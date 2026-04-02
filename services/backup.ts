import { DEFAULT_CATEGORY_ID, ensureBaseCategories, syncCategoryStats } from '@/repositories/library'
import { DEFAULT_THEME_ID } from '@/theme/presets'
import type { BackupPayload, Category, CommentItem, UserSettings, VideoAsset } from '@/types/domain'
import { ensureUserDataDirectory, readTextFile, writeUserDataTextFile } from '@/services/platform/file-system'

export const BACKUP_SCHEMA_VERSION = 1

interface PickedBackupFile {
  name: string
  path: string
}

export function createBackupPayload(input: {
  userSettings: UserSettings
  categories: Category[]
  videos: VideoAsset[]
  comments: CommentItem[]
}): BackupPayload {
  return {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: Date.now(),
    userSettings: normalizeUserSettings(input.userSettings),
    categories: normalizeCategories(input.categories),
    videos: normalizeVideos(input.videos),
    comments: normalizeComments(input.comments),
  }
}

export async function exportBackupFile(payload: BackupPayload) {
  const exportDirectory = await ensureUserDataDirectory('mytik-backups')
  const fileName = `mytik-backup-${formatTimestamp(payload.exportedAt)}.json`
  const filePath = `${exportDirectory}/${fileName}`
  const content = JSON.stringify(payload, null, 2)

  await writeUserDataTextFile(filePath, content)

  return {
    fileName,
    filePath,
    content,
  }
}

export async function pickBackupFile(): Promise<PickedBackupFile> {
  if (typeof wx === 'undefined' || typeof wx.chooseMessageFile !== 'function') {
    throw new Error('当前环境不支持选择 JSON 备份文件')
  }

  const result = await new Promise<{
    tempFiles: Array<{
      name?: string
      path?: string
    }>
  }>((resolve, reject) => {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['json'],
      success: resolve,
      fail: reject,
    })
  })

  const file = result.tempFiles?.[0]

  if (!file?.path) {
    throw new Error('未选择有效的 JSON 备份文件')
  }

  return {
    name: file.name || 'backup.json',
    path: file.path,
  }
}

export async function importBackupFile(filePath: string) {
  const content = await readTextFile(filePath)
  const rawPayload = JSON.parse(content) as Partial<BackupPayload> | null

  return normalizeBackupPayload(rawPayload)
}

export async function revealBackupFile(filePath: string) {
  if (typeof wx !== 'undefined' && typeof wx.shareFileMessage === 'function') {
    await new Promise<void>((resolve, reject) => {
      wx.shareFileMessage({
        filePath,
        success: () => resolve(),
        fail: reject,
      })
    })
    return 'shared'
  }

  if (typeof uni.openDocument === 'function') {
    await new Promise<void>((resolve, reject) => {
      uni.openDocument({
        filePath,
        fileType: 'json',
        showMenu: true,
        success: () => resolve(),
        fail: reject,
      })
    })
    return 'opened'
  }

  return 'saved'
}

export async function saveBackupFileToDevice(filePath: string, fileName?: string) {
  const miniProgramApi = typeof wx !== 'undefined' ? (wx as typeof wx & {
    saveFileToDisk?: (options: {
      filePath: string
      fileName?: string
      success?: () => void
      fail?: (error: unknown) => void
    }) => void
  }) : null
  const platform = getRuntimePlatform()

  if (miniProgramApi?.saveFileToDisk && (platform === 'windows' || platform === 'mac' || platform === 'devtools')) {
    try {
      await new Promise<void>((resolve, reject) => {
        miniProgramApi.saveFileToDisk?.({
          filePath,
          fileName,
          success: () => resolve(),
          fail: reject,
        })
      })
    } catch (error) {
      throw new Error(`saveFileToDisk failed: ${formatUnknownError(error)}`)
    }

    return 'saved-to-disk'
  }

  if (typeof wx !== 'undefined' && typeof wx.shareFileMessage === 'function') {
    try {
      await new Promise<void>((resolve, reject) => {
        wx.shareFileMessage({
          filePath,
          fileName,
          success: () => resolve(),
          fail: reject,
        })
      })
    } catch (error) {
      throw new Error(`shareFileMessage failed: ${formatUnknownError(error)}`)
    }

    return 'shared'
  }

  throw new Error('当前环境暂不支持保存备份文件')
}

function getRuntimePlatform() {
  if (typeof wx !== 'undefined' && typeof wx.getDeviceInfo === 'function') {
    try {
      return wx.getDeviceInfo().platform || ''
    } catch {
      // fall through
    }
  }

  if (typeof uni !== 'undefined' && typeof uni.getSystemInfoSync === 'function') {
    try {
      return uni.getSystemInfoSync().platform || ''
    } catch {
      return ''
    }
  }

  return ''
}

function formatUnknownError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object') {
    try {
      return JSON.stringify(error)
    } catch {
      return String(error)
    }
  }

  return String(error)
}

function normalizeBackupPayload(payload?: Partial<BackupPayload> | null): BackupPayload {
  if (!payload || typeof payload !== 'object') {
    throw new Error('备份文件内容无效')
  }

  if (typeof payload.schemaVersion !== 'number') {
    throw new Error('备份文件缺少 schemaVersion，无法导入')
  }

  if (payload.schemaVersion > BACKUP_SCHEMA_VERSION) {
    throw new Error('备份文件版本高于当前应用，暂时无法导入')
  }

  return {
    schemaVersion: payload.schemaVersion,
    exportedAt: normalizeTimestamp(payload.exportedAt),
    userSettings: normalizeUserSettings(payload.userSettings),
    categories: normalizeCategories(payload.categories),
    videos: normalizeVideos(payload.videos),
    comments: normalizeComments(payload.comments),
  }
}

function normalizeUserSettings(settings?: Partial<UserSettings> | null): UserSettings {
  return {
    passcode: typeof settings?.passcode === 'string' ? settings.passcode : '',
    useBiometrics: Boolean(settings?.useBiometrics),
    theme: settings?.theme || DEFAULT_THEME_ID,
    playbackCategoryId: typeof settings?.playbackCategoryId === 'string' ? settings.playbackCategoryId : DEFAULT_CATEGORY_ID,
    playbackMode: settings?.playbackMode === 'random' ? 'random' : 'sequential',
    likeWeight: normalizeLikeWeight(settings?.likeWeight),
    gestures: {
      doubleTapLike: settings?.gestures?.doubleTapLike ?? true,
      longPressSpeed: settings?.gestures?.longPressSpeed ?? true,
    },
  }
}

function normalizeCategories(categories?: Category[] | null) {
  const normalized = Array.isArray(categories)
    ? categories
        .filter((category) => category && typeof category.id === 'string' && typeof category.name === 'string')
        .map<Category>((category) => ({
          id: category.id,
          name: category.name,
          coverPath: typeof category.coverPath === 'string' ? category.coverPath : '',
          videoCount: Number(category.videoCount || 0),
          createdAt: normalizeTimestamp(category.createdAt),
          updatedAt: normalizeTimestamp(category.updatedAt),
        }))
    : []

  return ensureBaseCategories(normalized)
}

function normalizeVideos(videos?: VideoAsset[] | null) {
  return Array.isArray(videos)
    ? videos
        .filter(
          (video) =>
            video &&
            typeof video.id === 'string' &&
            typeof video.categoryId === 'string' &&
            typeof video.localPath === 'string',
        )
        .map<VideoAsset>((video) => ({
          id: video.id,
          categoryId: video.categoryId,
          localPath: video.localPath,
          posterPath: typeof video.posterPath === 'string' ? video.posterPath : '',
          videoHash: typeof video.videoHash === 'string' ? video.videoHash : '',
          duration: normalizeNumber(video.duration),
          width: typeof video.width === 'number' ? video.width : undefined,
          height: typeof video.height === 'number' ? video.height : undefined,
          importHint: typeof video.importHint === 'string' ? video.importHint : '',
          isLiked: Boolean(video.isLiked),
          isFavorite: Boolean(video.isFavorite),
          playCount: Math.max(0, Math.round(Number(video.playCount || 0))),
          totalWatchTime: Math.max(0, Number(video.totalWatchTime || 0)),
          createdAt: normalizeTimestamp(video.createdAt),
          updatedAt: normalizeTimestamp(video.updatedAt),
        }))
    : []
}

function normalizeComments(comments?: CommentItem[] | null) {
  return Array.isArray(comments)
    ? comments
        .filter(
          (comment) =>
            comment &&
            typeof comment.id === 'string' &&
            typeof comment.videoId === 'string' &&
            typeof comment.content === 'string',
        )
        .map<CommentItem>((comment) => ({
          id: comment.id,
          videoId: comment.videoId,
          content: comment.content.trim(),
          timestamp: normalizeNumber(comment.timestamp),
          source: typeof comment.source === 'string' ? comment.source : 'self',
          createdAt: normalizeTimestamp(comment.createdAt),
        }))
        .filter((comment) => Boolean(comment.content))
    : []
}

export function finalizeImportedLibrary(categories: Category[], videos: VideoAsset[]) {
  return syncCategoryStats(categories, videos)
}

function normalizeTimestamp(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value) || value <= 0) {
    return Date.now()
  }

  return Math.round(value)
}

function normalizeNumber(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
    return 0
  }

  return value
}

function normalizeLikeWeight(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 70
  }

  return Math.max(0, Math.min(100, Math.round(value)))
}

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}${month}${day}-${hours}${minutes}${seconds}`
}
