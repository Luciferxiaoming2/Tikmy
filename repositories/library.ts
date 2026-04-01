import type { Category, VideoAsset } from '@/types/domain'

export const DEFAULT_CATEGORY_ID = 'default'
export const DEFAULT_CATEGORY_NAME = '全部'

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

export function ensureBaseCategories(categories: Category[]) {
  if (!categories.length) {
    return [createDefaultCategory()]
  }

  const hasDefaultCategory = categories.some((category) => category.id === DEFAULT_CATEGORY_ID)

  if (hasDefaultCategory) {
    return categories.map((category) =>
      category.id === DEFAULT_CATEGORY_ID
        ? {
            ...category,
            name: DEFAULT_CATEGORY_NAME,
          }
        : category,
    )
  }

  return [createDefaultCategory(), ...categories]
}

export function normalizeCategoryName(name: string) {
  return name.trim()
}

export function assertUniqueCategoryName(categories: Category[], name: string, ignoreId?: string) {
  const normalizedName = normalizeCategoryName(name).toLowerCase()

  if (!normalizedName) {
    throw new Error('分类名称不能为空')
  }

  const duplicated = categories.some((category) => {
    if (ignoreId && category.id === ignoreId) {
      return false
    }

    return category.name.trim().toLowerCase() === normalizedName
  })

  if (duplicated) {
    throw new Error('分类名称已存在')
  }
}

export function createCategoryEntity(name: string): Category {
  const normalizedName = normalizeCategoryName(name)

  if (!normalizedName) {
    throw new Error('分类名称不能为空')
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
    throw new Error('分类名称不能为空')
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
    const size = Number(file.size || 0)

    return {
      id: createId(`video_${index}`),
      categoryId,
      localPath: file.persistedPath || file.tempFilePath,
      posterPath: file.thumbTempFilePath || '',
      videoHash: `${duration}_${size || file.tempFilePath}`,
      duration,
      isLiked: false,
      playCount: 0,
      totalWatchTime: 0,
      createdAt: now + index,
      updatedAt: now + index,
    }
  })
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
    const categoryVideos = videos.filter((video) => video.categoryId === category.id)
    const latestVideo = categoryVideos.at(-1)

    return {
      ...category,
      videoCount: categoryVideos.length,
      coverPath: latestVideo?.posterPath || category.coverPath,
      updatedAt: latestVideo?.updatedAt || category.updatedAt,
    }
  })
}
