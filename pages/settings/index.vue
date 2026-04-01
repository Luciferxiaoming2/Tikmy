<template>
  <view :class="['page-shell', 'mt-page', themeClass]" :style="pageInlineStyle">
    <view class="hero glass-panel" :style="panelInlineStyle">
      <text class="hero__eyebrow" :style="accentStyle">SETTINGS</text>
      <text class="hero__title" :style="textPrimaryStyle">播放设置</text>
      <text class="hero__copy" :style="textSecondaryStyle">
        调整刷视频时的交互偏好、喜欢权重、备份恢复与主题表现。
      </text>
    </view>
    <view class="section">
      <text class="section__title" :style="textPrimaryStyle">主题</text>
      <view class="theme-trigger glass-panel" :style="panelInlineStyle" @tap="toggleThemePicker">
        <view class="setting-main">
          <text class="label" :style="textPrimaryStyle">当前主题</text>
          <text class="setting-subtitle" :style="textSecondaryStyle">{{ activeTheme.description }}</text>
        </view>
        <view class="setting-meta">
          <text class="value" :style="textMutedStyle">{{ activeTheme.name }}</text>
          <text class="chevron" :style="textMutedStyle">切换</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section__title" :style="textPrimaryStyle">喜欢权重</text>
      <view class="weight-card glass-panel" :style="panelInlineStyle">
        <view class="weight-card__header">
          <view>
            <text class="weight-card__title" :style="textPrimaryStyle">随机播放时的喜欢加权</text>
            <text class="weight-card__copy" :style="textSecondaryStyle">
              只在随机模式生效。权重越高，已点赞视频越容易再次出现。
            </text>
          </view>
          <text class="weight-card__value" :style="accentStyle">{{ likeWeight }}%</text>
        </view>
        <slider
          class="weight-slider"
          :value="likeWeight"
          :min="0"
          :max="100"
          :step="5"
          :activeColor="activeTheme.primary"
          :backgroundColor="activeTheme.borderSubtle"
          :block-color="activeTheme.primary"
          @change="handleLikeWeightChange"
        />
        <view class="weight-scale">
          <text class="weight-scale__label" :style="textMutedStyle">更均匀</text>
          <text class="weight-scale__label" :style="textMutedStyle">更偏向已喜欢</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section__title" :style="textPrimaryStyle">手势偏好</text>
      <view class="setting-list">
        <view class="setting-item glass-panel" :style="panelInlineStyle">
          <view class="setting-main">
            <text class="label" :style="textPrimaryStyle">双击点赞</text>
            <text class="setting-subtitle" :style="textSecondaryStyle">
              开启后，Home 页双击当前视频会直接点赞。
            </text>
          </view>
          <switch
            :checked="gestures.doubleTapLike"
            :color="activeTheme.primary"
            data-key="doubleTapLike"
            @change="handleGestureChange"
          />
        </view>

        <view class="setting-item glass-panel" :style="panelInlineStyle">
          <view class="setting-main">
            <text class="label" :style="textPrimaryStyle">长按 2 倍速</text>
            <text class="setting-subtitle" :style="textSecondaryStyle">
              开启后，长按当前视频临时切到 2 倍速，松手恢复。
            </text>
          </view>
          <switch
            :checked="gestures.longPressSpeed"
            :color="activeTheme.primary"
            data-key="longPressSpeed"
            @change="handleGestureChange"
          />
        </view>

        <view class="setting-item glass-panel" :style="panelInlineStyle">
          <view class="setting-main">
            <text class="label" :style="textPrimaryStyle">生物识别占位</text>
            <text class="setting-subtitle" :style="textSecondaryStyle">
              预留给后续隐私能力，当前不影响 MVP 主流程。
            </text>
          </view>
          <switch
            :checked="useBiometrics"
            :color="activeTheme.primary"
            @change="handleBiometricChange"
          />
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section__title" :style="textPrimaryStyle">数据备份恢复</text>
      <text class="section__copy" :style="textSecondaryStyle">
        导出当前分类、视频记录、评论和偏好为 JSON；导入时会追加到新的导入分类，并检测需要修复的视频源。
      </text>
      <view class="selection-grid">
        <view class="selection-card glass-panel" :style="panelInlineStyle" @tap="handleExportBackup">
          <text class="selection-card__title" :style="textPrimaryStyle">导出 JSON 备份</text>
          <text class="selection-card__copy" :style="textSecondaryStyle">
            {{ isBackupBusy ? backupBusyLabel : backupSummary }}
          </text>
        </view>
        <view class="selection-card glass-panel" :style="panelInlineStyle" @tap="handleImportBackup">
          <text class="selection-card__title" :style="textPrimaryStyle">导入 JSON 恢复</text>
          <text class="selection-card__copy" :style="textSecondaryStyle">
            选择备份文件后追加到新分类，保留当前已有视频和设置不变。
          </text>
        </view>
      </view>
      <view class="backup-status glass-panel" :style="panelInlineStyle">
        <text class="backup-status__text" :style="textSecondaryStyle">{{ brokenVideoSummary }}</text>
        <text v-if="backupStatus" class="backup-status__text" :style="textMutedStyle">{{ backupStatus }}</text>
        <view
          v-if="brokenVideoCount"
          class="backup-status__action"
          :style="[chipInlineStyle, activeCardStyle]"
          @tap="handleRepairBrokenVideos"
        >
          <text class="backup-status__action-text" :style="textPrimaryStyle">修复断链视频</text>
        </view>
      </view>
    </view>


    <view v-if="isThemePickerOpen" class="sheet-mask" @tap="closeThemePicker" />
    <view v-if="isThemePickerOpen" class="theme-sheet glass-panel" :style="sheetInlineStyle">
      <view class="theme-sheet__header">
        <view>
          <text class="theme-sheet__title" :style="textPrimaryStyle">选择主题</text>
          <text class="theme-sheet__subtitle" :style="textSecondaryStyle">
            主题会同步影响页面背景、面板层次和底部导航观感。
          </text>
        </view>
        <text class="theme-sheet__close" :style="textMutedStyle" @tap="closeThemePicker">关闭</text>
      </view>

      <view class="theme-sheet__list">
        <view
          v-for="option in themeOptions"
          :key="option.id"
          class="theme-row"
          :style="option.id === theme ? [themeOptionInlineStyle, activeBorderStyle] : themeOptionInlineStyle"
          :data-theme-id="option.id"
          @tap="handleThemeTap"
        >
          <view class="theme-row__preview">
            <view
              v-for="color in option.preview"
              :key="`${option.id}-${color}`"
              class="theme-preview__chip"
              :style="{ backgroundColor: color }"
            />
          </view>
          <view class="theme-row__content">
            <text class="theme-name" :style="textPrimaryStyle">{{ option.name }}</text>
            <text class="theme-copy" :style="textSecondaryStyle">{{ option.description }}</text>
          </view>
          <text v-if="option.id === theme" class="theme-row__selected" :style="textPrimaryStyle">当前</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { buildVideoAssetHash, DEFAULT_CATEGORY_ID } from '@/repositories/library'
import { persistMediaFile, checkFileExists } from '@/services/platform/file-system'
import { chooseVideos, detectVideoImportHint, normalizeChosenVideos } from '@/services/platform/media'
import {
  createBackupPayload,
  exportBackupFile,
  importBackupFile,
  pickBackupFile,
  revealBackupFile,
} from '@/services/backup'
import { useCommentStore } from '@/stores/comments'
import { useLibraryStore } from '@/stores/library'
import { useUserStore } from '@/stores/user'
import { THEME_OPTIONS, getThemeOption } from '@/theme/presets'
import type { ThemeId } from '@/theme/presets'
import type { GestureSettings, VideoAsset } from '@/types/domain'

const themeOptions = THEME_OPTIONS

const userStore = useUserStore()
const libraryStore = useLibraryStore()
const commentStore = useCommentStore()
const { categories, videos } = storeToRefs(libraryStore)
const { comments } = storeToRefs(commentStore)
const { gestures, likeWeight, playbackCategoryId, theme, useBiometrics } = storeToRefs(userStore)
const isThemePickerOpen = ref(false)
const backupBusyLabel = ref('')
const backupStatus = ref('')
const brokenVideoIds = ref<string[]>([])

const activeTheme = computed(() => getThemeOption(theme.value))
const themeClass = computed(() => `theme--${theme.value}`)
const pageInlineStyle = computed(() => ({
  background: activeTheme.value.pageBackground,
  color: activeTheme.value.textPrimary,
}))
const panelInlineStyle = computed(() => ({
  background: activeTheme.value.surface,
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
  boxShadow: activeTheme.value.shadowSoft,
  backdropFilter: 'blur(20px)',
}))
const chipInlineStyle = computed(() => ({
  background: activeTheme.value.themeOptionBackground,
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
}))
const themeOptionInlineStyle = computed(() => ({
  background: activeTheme.value.themeOptionBackground,
}))
const sheetInlineStyle = computed(() => ({
  background: activeTheme.value.surface,
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
  boxShadow: activeTheme.value.shadowSoft,
  backdropFilter: 'blur(28px)',
}))
const activeBorderStyle = computed(() => ({ borderColor: activeTheme.value.primary }))
const activeCardStyle = computed(() => ({
  borderColor: activeTheme.value.primary,
  background: activeTheme.value.themeOptionBackground,
}))
const textPrimaryStyle = computed(() => ({ color: activeTheme.value.textPrimary }))
const textSecondaryStyle = computed(() => ({ color: activeTheme.value.textSecondary }))
const textMutedStyle = computed(() => ({ color: activeTheme.value.textMuted }))
const accentStyle = computed(() => ({ color: activeTheme.value.primary }))
const isBackupBusy = computed(() => Boolean(backupBusyLabel.value))
const backupSummary = computed(
  () => `当前共 ${categories.value.length} 个分类、${videos.value.length} 个视频、${comments.value.length} 条评论`,
)
const brokenVideoCount = computed(() => brokenVideoIds.value.length)
const brokenVideoSummary = computed(() => {
  if (!brokenVideoCount.value) {
    return '当前未检测到断链视频，导入恢复后也会自动重新扫描。'
  }

  return `检测到 ${brokenVideoCount.value} 个视频源已断链，可从相册重新选择后按特征值自动回绑。`
})

watch(
  categories,
  (nextCategories) => {
    if (!nextCategories.some((category) => category.id === playbackCategoryId.value)) {
      userStore.setPlaybackCategory(DEFAULT_CATEGORY_ID)
    }
  },
  {
    immediate: true,
  },
)

onShow(() => {
  void refreshBrokenVideoStatus()
})

function handleBiometricChange(event: Event) {
  const detail = (event as Event & { detail?: { value?: boolean } }).detail
  userStore.setUseBiometrics(Boolean(detail?.value))
}

function handleLikeWeightChange(event: Event) {
  const detail = (event as Event & { detail?: { value?: number } }).detail
  userStore.setLikeWeight(Number(detail?.value || 0))
}

function handleGestureChange(event: Event) {
  const key = (
    event as Event & { currentTarget?: { dataset?: { key?: keyof GestureSettings } } }
  ).currentTarget?.dataset?.key
  const detail = (event as Event & { detail?: { value?: boolean } }).detail

  if (!key) {
    return
  }

  userStore.setGestureSetting(key, Boolean(detail?.value))
}

function toggleThemePicker() {
  isThemePickerOpen.value = !isThemePickerOpen.value
}

function closeThemePicker() {
  isThemePickerOpen.value = false
}

function handleThemeTap(event: Event) {
  const dataset = (event as Event & { currentTarget?: { dataset?: { themeId?: ThemeId } } }).currentTarget?.dataset

  if (dataset?.themeId) {
    userStore.setTheme(dataset.themeId)
  }
}

async function handleExportBackup() {
  if (isBackupBusy.value) {
    return
  }

  try {
    backupBusyLabel.value = '正在生成备份文件'
    const payload = createBackupPayload({
      userSettings: userStore.settings,
      categories: categories.value,
      videos: videos.value,
      comments: comments.value,
    })
    const result = await exportBackupFile(payload)

    backupBusyLabel.value = '正在打开备份文件'

    try {
      await revealBackupFile(result.filePath)
    } catch {
      // ignore reveal failure and fall back to success modal below
    }

    backupStatus.value = `最近导出：${result.fileName}`
    uni.showModal({
      title: '备份已生成',
      content: '当前数据已经导出为 JSON 文件。建议发送到文件传输助手或保存到安全位置，换机后可直接导入恢复。',
      showCancel: false,
    })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '导出备份失败',
      icon: 'none',
    })
  } finally {
    backupBusyLabel.value = ''
  }
}

async function handleImportBackup() {
  if (isBackupBusy.value) {
    return
  }

  const confirmed = await confirmAction(
    '导入不会覆盖当前已有视频和设置。系统会自动新建一个导入分类，并把备份里的视频和评论追加进去。是否继续？',
  )

  if (!confirmed) {
    return
  }

  try {
    backupBusyLabel.value = '正在读取备份文件'
    const pickedFile = await pickBackupFile()
    const backup = await importBackupFile(pickedFile.path)
    const importCategoryName = buildImportedCategoryName(backup.exportedAt)
    const imported = libraryStore.importBackupVideos(importCategoryName, backup.videos)
    const importedCommentCount = commentStore.importBackupComments(backup.comments, imported.videoIdMap)

    await refreshBrokenVideoStatus()
    backupStatus.value = `最近导入：${pickedFile.name}`

    uni.showModal({
      title: '导入完成',
      content: brokenVideoCount.value
        ? `已导入到分类“${imported.category.name}”，新增 ${imported.importedVideos.length} 个视频、${importedCommentCount} 条评论。当前还有 ${brokenVideoCount.value} 个视频源需要重新绑定。`
        : `已导入到分类“${imported.category.name}”，新增 ${imported.importedVideos.length} 个视频、${importedCommentCount} 条评论，当前未检测到断链视频。`,
      showCancel: false,
    })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '导入备份失败',
      icon: 'none',
    })
  } finally {
    backupBusyLabel.value = ''
  }
}

async function handleRepairBrokenVideos() {
  if (isBackupBusy.value) {
    return
  }

  const brokenVideos = videos.value.filter((video) => brokenVideoIds.value.includes(video.id))

  if (!brokenVideos.length) {
    uni.showToast({
      title: '当前没有待修复视频',
      icon: 'none',
    })
    return
  }

  try {
    backupBusyLabel.value = '请选择需要回绑的视频'
    const result = await chooseVideos({
      count: Math.min(20, brokenVideos.length),
    })
    const mediaFiles = normalizeChosenVideos(result)

    if (!mediaFiles.length) {
      return
    }

    const persistedFiles: Array<
      WechatMiniprogram.MediaFile & {
        thumbTempFilePath?: string
        persistedPath?: string
      }
    > = []

    for (const [index, file] of mediaFiles.entries()) {
      uni.showLoading({
        title: `修复 ${index + 1}/${mediaFiles.length}`,
        mask: true,
      })

      const persisted = await persistMediaFile(file.tempFilePath)
      persistedFiles.push({
        ...file,
        persistedPath: persisted.path,
      })
    }

    const repairs = buildRepairPayloads(brokenVideos, persistedFiles)
    const repairedCount = libraryStore.repairVideoSources(repairs)
    await refreshBrokenVideoStatus()

    uni.showModal({
      title: '修复完成',
      content:
        repairedCount > 0
          ? `已成功回绑 ${repairedCount} 个视频。剩余 ${brokenVideoCount.value} 个视频仍需继续修复。`
          : '这次选择的视频没有匹配到待修复记录，请尽量选择原始视频文件后重试。',
      showCancel: false,
    })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '修复断链失败',
      icon: 'none',
    })
  } finally {
    uni.hideLoading()
    backupBusyLabel.value = ''
  }
}

async function refreshBrokenVideoStatus() {
  const nextBrokenIds: string[] = []

  for (const video of videos.value) {
    const exists = await checkFileExists(video.localPath)

    if (!exists) {
      nextBrokenIds.push(video.id)
    }
  }

  brokenVideoIds.value = nextBrokenIds
}

function buildRepairPayloads(
  brokenVideos: VideoAsset[],
  mediaFiles: Array<
    WechatMiniprogram.MediaFile & {
      thumbTempFilePath?: string
      persistedPath?: string
    }
  >,
) {
  const candidateMap = new Map<string, typeof mediaFiles>()

  for (const file of mediaFiles) {
    const hash = buildVideoAssetHash(file)
    const current = candidateMap.get(hash) || []
    current.push(file)
    candidateMap.set(hash, current)
  }

  return brokenVideos.flatMap((video) => {
    const candidates = candidateMap.get(video.videoHash)
    const matched = candidates?.shift()

    if (!matched) {
      return []
    }

    return [
      {
        id: video.id,
        localPath: matched.persistedPath || matched.tempFilePath,
        posterPath: matched.thumbTempFilePath || '',
        videoHash: buildVideoAssetHash(matched),
        width: typeof matched.width === 'number' ? matched.width : undefined,
        height: typeof matched.height === 'number' ? matched.height : undefined,
        importHint: detectVideoImportHint(matched),
      },
    ]
  })
}

function confirmAction(content: string) {
  return new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '请确认',
      content,
      success: (result) => resolve(Boolean(result.confirm)),
      fail: () => resolve(false),
    })
  })
}

function buildImportedCategoryName(exportedAt: number) {
  const date = new Date(exportedAt || Date.now())
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `导入备份 ${month}-${day} ${hours}:${minutes}`
}
</script>

<style scoped lang="scss">
.page-shell {
  padding: 96rpx 32rpx 56rpx;
}

.hero {
  padding: 34rpx 30rpx;
  border-radius: var(--mt-radius-card);
}

.hero__eyebrow {
  display: block;
  font-size: 22rpx;
  letter-spacing: 0.18em;
}

.hero__title {
  display: block;
  margin-top: 16rpx;
  font-size: 56rpx;
  font-weight: 700;
}

.hero__copy {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.7;
}

.hero__chips {
  display: flex;
  gap: 16rpx;
  margin-top: 26rpx;
}

.hero-chip {
  flex: 1;
  min-width: 0;
  padding: 20rpx 22rpx;
  border-radius: 24rpx;
}

.hero-chip__label {
  display: block;
  font-size: 20rpx;
}

.hero-chip__value {
  display: block;
  margin-top: 10rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.section {
  margin-top: 36rpx;
}

.section__title {
  display: block;
  margin-bottom: 12rpx;
  font-size: 32rpx;
  font-weight: 700;
}

.section__copy {
  display: block;
  margin-bottom: 18rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.selection-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.picker-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 28rpx;
  border-radius: 28rpx;
  border: 2rpx solid transparent;
}

.picker-card__main {
  flex: 1;
  min-width: 0;
}

.picker-card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.picker-card__copy {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.picker-card__action {
  font-size: 24rpx;
}

.selection-card {
  padding: 28rpx;
  border-radius: 28rpx;
  border: 2rpx solid transparent;
}

.selection-card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.selection-card__copy {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.weight-card {
  padding: 28rpx;
  border-radius: 28rpx;
}

.backup-status {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
  margin-top: 18rpx;
  padding: 24rpx 28rpx;
  border-radius: 28rpx;
}

.backup-status__text {
  font-size: 24rpx;
  line-height: 1.6;
}

.backup-status__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 72rpx;
  padding: 0 24rpx;
  border-radius: 9999rpx;
  border: 2rpx solid transparent;
}

.backup-status__action-text {
  font-size: 24rpx;
  font-weight: 600;
}

.weight-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
}

.weight-card__title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.weight-card__copy {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.weight-card__value {
  font-size: 34rpx;
  font-weight: 700;
}

.weight-slider {
  margin-top: 18rpx;
}

.weight-scale {
  display: flex;
  justify-content: space-between;
  margin-top: 8rpx;
}

.weight-scale__label {
  font-size: 22rpx;
}

.setting-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.setting-item,
.theme-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx;
  border-radius: 28rpx;
}

.setting-main {
  flex: 1;
  min-width: 0;
}

.setting-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.label {
  font-size: 30rpx;
  font-weight: 600;
}

.setting-subtitle {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.value {
  font-size: 26rpx;
}

.chevron {
  font-size: 22rpx;
}

.sheet-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
}

.theme-sheet {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 24rpx;
  padding: 28rpx;
  border-radius: 36rpx;
}

.theme-sheet__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24rpx;
}

.theme-sheet__title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
}

.theme-sheet__subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.theme-sheet__close {
  font-size: 24rpx;
}

.theme-sheet__list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 24rpx;
}

.theme-sheet__list--category {
  max-height: 52vh;
}

.theme-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  border: 2rpx solid transparent;
}

.theme-row__preview {
  display: flex;
  gap: 8rpx;
  width: 132rpx;
}

.theme-preview__chip {
  flex: 1;
  height: 44rpx;
  border-radius: 12rpx;
}

.theme-row__content {
  flex: 1;
  min-width: 0;
}

.theme-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
}

.theme-copy {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  line-height: 1.5;
}

.theme-row__selected {
  font-size: 22rpx;
}
</style>
