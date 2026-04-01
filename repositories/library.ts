import type { Category, VideoAsset } from '@/types/domain'
import { detectVideoImportHint } from '@/services/platform/media'

export const DEFAULT_CATEGORY_ID = 'default'
export const DEFAULT_CATEGORY_NAME = '\u5168\u90e8'
export const FAVORITES_CATEGORY_ID = 'favorites'
export const FAVORITES_CATEGORY_NAME = '\u6536\u85cf'

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function createDefaultCategory(): Category {
  const now = Date.now()

  return {
    id: DEFAULT_CATEGORY_ID,
    name: DEFAULT_CATEGORY_NAME,
    coverPath: '',
    videoCount: 0,
    createdAt: now,
    updatedAt: now,
  }
}

export function createFavoritesCategory(): Category {
  const now = Date.now()

  return {
    id: FAVORITES_CATEGORY_ID,
    name: FAVORITES_CATEGORY_NAME,
    coverPath: '',
    videoCount: 0,
    createdAt: now,
    updatedAt: now,
  }
}

export function ensureBaseCategories(categories: Category[]) {
  const normalizedCategories = categories.map((category) => {
    if (category.id === DEFAULT_CATEGORY_ID) {
      return {
        ...category,
        name: DEFAULT_CATEGORY_NAME,
      }
    }

    if (category.id === FAVORITES_CATEGORY_ID) {
      return {
        ...category,
        name: FAVORITES_CATEGORY_NAME,
      }
    }

    return category
  })

  const hasDefaultCategory = normalizedCategories.some((category) => category.id === DEFAULT_CATEGORY_ID)
  const hasFavoritesCategory = normalizedCategories.some((category) => category.id === FAVORITES_CATEGORY_ID)
  const nextCategories = [...normalizedCategories]

  if (!hasDefaultCategory) {
    nextCategories.unshift(createDefaultCategory())
  }

  if (!hasFavoritesCategory) {
    const defaultIndex = nextCategories.findIndex((category) => category.id === DEFAULT_CATEGORY_ID)
    nextCategories.splice(defaultIndex >= 0 ? defaultIndex + 1 : 0, 0, createFavoritesCategory())
  }

  return nextCategories
}

export function normalizeCategoryName(name: string) {
  return name.trim()
}

export function assertUniqueCategoryName(categories: Category[], name: string, ignoreId?: string) {
  const normalizedName = normalizeCategoryName(name).toLowerCase()

  if (!normalizedName) {
    throw new Error('\u5206\u7c7b\u540d\u79f0\u4e0d\u80fd\u4e3a\u7a7a')
  }

  const duplicated = categories.some((category) => {
    if (ignoreId && category.id === ignoreId) {
      return false
    }

    return category.name.trim().toLowerCase() === normalizedName
  })

  if (duplicated) {
    throw new Error('\u5206\u7c7b\u540d\u79f0\u5df2\u5b58\u5728')
  }
}

export function createCategoryEntity(name: string): Category {
  const normalizedName = normalizeCategoryName(name)

  if (!normalizedName) {
    throw new Error('\u5206\u7c7b\u540d\u79f0\u4e0d\u80fd\u4e3a\u7a7a')
  }

  const now = Date.now()

  return {
    id: createId('category'),
    name: normalizedName,
    coverPath: '',
    videoCount: 0,
    createdAt: now,
    updatedAt: now,
  }
}

export function renameCategoryEntity(category: Category, name: string): Category {
  const normalizedName = normalizeCategoryName(name)

  if (!normalizedName) {
    throw new Error('\u5206\u7c7b\u540d\u79f0\u4e0d\u80fd\u4e3a\u7a7a')
  }

  return {
    ...category,
    name: normalizedName,
    updatedAt: Date.now(),
  }
}

export function createVideoAssets(
  categoryId: string,
  mediaFiles: Array<
    WechatMiniprogram.MediaFile & {
      thumbTempFilePath?: string
      persistedPath?: string
    }
  >,
) {
  const now = Date.now()

  return mediaFiles.map<VideoAsset>((file, index) => {
    const duration = Number(file.duration || 0)
    const width = typeof file.width === 'number' ? file.width : undefined
    const height = typeof file.height === 'number' ? file.height : undefined

    return {
      id: createId(`video_${index}`),
      categoryId,
      localPath: file.persistedPath || file.tempFilePath,
      posterPath: file.thumbTempFilePath || '',
      videoHash: buildVideoAssetHash(file),
      duration,
      width,
      height,
      importHint: detectVideoImportHint(file),
      isLiked: false,
      isFavorite: false,
      playCount: 0,
      totalWatchTime: 0,
      createdAt: now + index,
      updatedAt: now + index,
    }
  })
}

export function buildVideoAssetHash(file: {
  duration?: number
  size?: number
  tempFilePath?: string
}) {
  const duration = Number(file.duration || 0)
  const size = Number(file.size || 0)

  return `${duration}_${size || file.tempFilePath || ''}`
}

export function moveVideosToCategory(videos: VideoAsset[], fromCategoryId: string, toCategoryId: string) {
  return videos.map((video) =>
    video.categoryId === fromCategoryId
      ? {
          ...video,
          categoryId: toCategoryId,
          updatedAt: Date.now(),
        }
      : video,
  )
}

export function moveVideoAssetToCategory(video: VideoAsset, toCategoryId: string): VideoAsset {
  return {
    ...video,
    categoryId: toCategoryId,
    updatedAt: Date.now(),
  }
}

export function cloneVideoAssetToCategory(video: VideoAsset, toCategoryId: string): VideoAsset {
  const now = Date.now()

  return {
    ...video,
    id: createId('video_copy'),
    categoryId: toCategoryId,
    createdAt: now,
    updatedAt: now,
  }
}

export function syncCategoryStats(categories: Category[], videos: VideoAsset[]) {
  return categories.map((category) => {
    const categoryVideos = videos.filter((video) =>
      category.id === FAVORITES_CATEGORY_ID ? video.isFavorite : video.categoryId === category.id,
    )
    const latestVideo = categoryVideos.at(-1)

    return {
      ...category,
      videoCount: categoryVideos.length,
      coverPath: latestVideo?.posterPath || '',
      updatedAt: latestVideo?.updatedAt || category.updatedAt,
    }
  })
}
