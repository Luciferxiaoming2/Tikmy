import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '@/constants/storage'
import {
  assertUniqueCategoryName,
  cloneVideoAssetToCategory,
  createCategoryEntity,
  createVideoAssets,
  DEFAULT_CATEGORY_ID,
  ensureBaseCategories,
  FAVORITES_CATEGORY_ID,
  moveVideoAssetToCategory,
  moveVideosToCategory,
  renameCategoryEntity,
  syncCategoryStats as buildCategoryStats,
} from '@/repositories/library'
import { getStorageItem, setStorageItem } from '@/services/storage/kv'
import type { Category, VideoAsset } from '@/types/domain'

function createImportedEntityId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function normalizeVideos(nextVideos: VideoAsset[]) {
  return (Array.isArray(nextVideos) ? nextVideos : []).map((video) => ({
    ...video,
    isLiked: Boolean(video.isLiked),
    isFavorite: Boolean(video.isFavorite),
  }))
}

function isProtectedCategory(categoryId: string) {
  return categoryId === DEFAULT_CATEGORY_ID || categoryId === FAVORITES_CATEGORY_ID
}

function isVirtualCategory(categoryId: string) {
  return categoryId === FAVORITES_CATEGORY_ID
}

export const useLibraryStore = defineStore('library', () => {
  const categories = ref<Category[]>(getStorageItem<Category[]>(STORAGE_KEYS.categories, []))
  const videos = ref<VideoAsset[]>(normalizeVideos(getStorageItem<VideoAsset[]>(STORAGE_KEYS.videos, [])))

  function persistCategories() {
    setStorageItem(STORAGE_KEYS.categories, categories.value)
  }

  function persistVideos() {
    setStorageItem(STORAGE_KEYS.videos, videos.value)
  }

  function syncCategoryStats() {
    categories.value = buildCategoryStats(categories.value, videos.value)
    persistCategories()
  }

  function ensureDefaultCategory() {
    const nextCategories = ensureBaseCategories(categories.value)
    const changed =
      nextCategories.length !== categories.value.length ||
      nextCategories.some(
        (category, index) =>
          category.id !== categories.value[index]?.id || category.name !== categories.value[index]?.name,
      )

    if (changed) {
      categories.value = nextCategories
      persistCategories()
    }
  }

  function createCategory(name: string) {
    assertUniqueCategoryName(categories.value, name)
    const category = createCategoryEntity(name)
    categories.value = [category, ...categories.value]
    persistCategories()
    return category
  }

  function renameCategory(categoryId: string, name: string) {
    if (isProtectedCategory(categoryId)) {
      throw new Error('\u7cfb\u7edf\u5206\u7c7b\u4e0d\u652f\u6301\u91cd\u547d\u540d')
    }

    const target = categories.value.find((item) => item.id === categoryId)

    if (!target) {
      throw new Error('\u5206\u7c7b\u4e0d\u5b58\u5728')
    }

    assertUniqueCategoryName(categories.value, name, categoryId)
    categories.value = categories.value.map((category) =>
      category.id === categoryId ? renameCategoryEntity(category, name) : category,
    )
    persistCategories()
    syncCategoryStats()
  }

  function deleteCategory(categoryId: string) {
    if (isProtectedCategory(categoryId)) {
      throw new Error('\u7cfb\u7edf\u5206\u7c7b\u4e0d\u53ef\u5220\u9664')
    }

    const target = categories.value.find((item) => item.id === categoryId)

    if (!target) {
      throw new Error('\u5206\u7c7b\u4e0d\u5b58\u5728')
    }

    videos.value = moveVideosToCategory(videos.value, categoryId, DEFAULT_CATEGORY_ID)
    persistVideos()
    categories.value = categories.value.filter((category) => category.id !== categoryId)
    persistCategories()
    syncCategoryStats()
  }

  function addVideosToCategory(
    categoryId: string,
    mediaFiles: Array<
      WechatMiniprogram.MediaFile & {
        thumbTempFilePath?: string
        persistedPath?: string
      }
    >,
  ) {
    const category = categories.value.find((item) => item.id === categoryId)

    if (!category) {
      throw new Error('\u5206\u7c7b\u4e0d\u5b58\u5728')
    }

    if (isVirtualCategory(categoryId)) {
      throw new Error('\u6536\u85cf\u5217\u8868\u4e0d\u652f\u6301\u76f4\u63a5\u5bfc\u5165')
    }

    const newVideos = createVideoAssets(categoryId, mediaFiles)
    videos.value = [...videos.value, ...newVideos]
    persistVideos()
    syncCategoryStats()

    return newVideos
  }

  function toggleLike(videoId: string) {
    let changed = false

    videos.value = videos.value.map((video) => {
      if (video.id !== videoId) {
        return video
      }

      changed = true

      return {
        ...video,
        isLiked: !video.isLiked,
        updatedAt: Date.now(),
      }
    })

    if (changed) {
      persistVideos()
    }
  }

  function toggleFavorite(videoId: string) {
    let changed = false

    videos.value = videos.value.map((video) => {
      if (video.id !== videoId) {
        return video
      }

      changed = true

      return {
        ...video,
        isFavorite: !video.isFavorite,
        updatedAt: Date.now(),
      }
    })

    if (changed) {
      persistVideos()
      syncCategoryStats()
    }
  }

  function incrementPlayCount(videoId: string) {
    let changed = false

    videos.value = videos.value.map((video) => {
      if (video.id !== videoId) {
        return video
      }

      changed = true

      return {
        ...video,
        playCount: video.playCount + 1,
        updatedAt: Date.now(),
      }
    })

    if (changed) {
      persistVideos()
    }
  }

  function addWatchTime(videoId: string, seconds: number) {
    if (seconds <= 0) {
      return
    }

    let changed = false

    videos.value = videos.value.map((video) => {
      if (video.id !== videoId) {
        return video
      }

      changed = true

      return {
        ...video,
        totalWatchTime: Math.round((video.totalWatchTime + seconds) * 10) / 10,
        updatedAt: Date.now(),
      }
    })

    if (changed) {
      persistVideos()
    }
  }

  function getVideosByCategory(categoryId: string) {
    return videos.value
      .filter((video) => (categoryId === FAVORITES_CATEGORY_ID ? video.isFavorite : video.categoryId === categoryId))
      .sort((left, right) => right.createdAt - left.createdAt)
  }

  function moveVideoToCategory(videoId: string, toCategoryId: string) {
    const targetCategory = categories.value.find((category) => category.id === toCategoryId)

    if (!targetCategory) {
      throw new Error('\u76ee\u6807\u5206\u7c7b\u4e0d\u5b58\u5728')
    }

    if (isVirtualCategory(toCategoryId)) {
      throw new Error('\u6536\u85cf\u5217\u8868\u4e0d\u652f\u6301\u79fb\u52a8')
    }

    const currentVideo = videos.value.find((video) => video.id === videoId)

    if (!currentVideo) {
      throw new Error('\u89c6\u9891\u4e0d\u5b58\u5728')
    }

    if (currentVideo.categoryId === toCategoryId) {
      return currentVideo
    }

    videos.value = videos.value.map((video) =>
      video.id === videoId ? moveVideoAssetToCategory(video, toCategoryId) : video,
    )
    persistVideos()
    syncCategoryStats()

    return videos.value.find((video) => video.id === videoId) || currentVideo
  }

  function copyVideoToCategory(videoId: string, toCategoryId: string) {
    const targetCategory = categories.value.find((category) => category.id === toCategoryId)

    if (!targetCategory) {
      throw new Error('\u76ee\u6807\u5206\u7c7b\u4e0d\u5b58\u5728')
    }

    if (isVirtualCategory(toCategoryId)) {
      throw new Error('\u6536\u85cf\u5217\u8868\u4e0d\u652f\u6301\u590d\u5236')
    }

    const currentVideo = videos.value.find((video) => video.id === videoId)

    if (!currentVideo) {
      throw new Error('\u89c6\u9891\u4e0d\u5b58\u5728')
    }

    const copiedVideo = cloneVideoAssetToCategory(currentVideo, toCategoryId)
    videos.value = [copiedVideo, ...videos.value]
    persistVideos()
    syncCategoryStats()

    return copiedVideo
  }

  function deleteVideo(videoId: string) {
    const currentVideo = videos.value.find((video) => video.id === videoId)

    if (!currentVideo) {
      throw new Error('\u89c6\u9891\u4e0d\u5b58\u5728')
    }

    videos.value = videos.value.filter((video) => video.id !== videoId)
    persistVideos()
    syncCategoryStats()

    return currentVideo
  }

  function replaceLibraryData(nextCategories: Category[], nextVideos: VideoAsset[]) {
    categories.value = ensureBaseCategories(nextCategories)
    videos.value = normalizeVideos(nextVideos)
    persistVideos()
    syncCategoryStats()
  }

  function repairVideoSources(
    repairs: Array<
      Pick<VideoAsset, 'id' | 'localPath' | 'posterPath' | 'videoHash' | 'width' | 'height' | 'importHint'>
    >,
  ) {
    if (!repairs.length) {
      return 0
    }

    const repairMap = new Map(repairs.map((repair) => [repair.id, repair]))
    let repairedCount = 0

    videos.value = videos.value.map((video) => {
      const repair = repairMap.get(video.id)

      if (!repair) {
        return video
      }

      repairedCount += 1

      return {
        ...video,
        localPath: repair.localPath,
        posterPath: repair.posterPath,
        videoHash: repair.videoHash,
        width: repair.width,
        height: repair.height,
        importHint: repair.importHint,
        updatedAt: Date.now(),
      }
    })

    if (repairedCount) {
      persistVideos()
      syncCategoryStats()
    }

    return repairedCount
  }

  function importBackupVideos(targetCategoryName: string, nextVideos: VideoAsset[]) {
    const baseName = targetCategoryName.trim() || '\u5bfc\u5165\u5907\u4efd'
    let resolvedName = baseName
    let suffix = 2

    while (categories.value.some((category) => category.name.trim().toLowerCase() === resolvedName.trim().toLowerCase())) {
      resolvedName = `${baseName} ${suffix}`
      suffix += 1
    }

    const targetCategory = createCategoryEntity(resolvedName)
    const videoIdMap = new Map<string, string>()
    const normalizedImportedVideos = normalizeVideos(nextVideos)

    const importedVideos = normalizedImportedVideos.map((video, index) => {
      const nextId = createImportedEntityId('video')
      videoIdMap.set(video.id, nextId)

      return {
        ...video,
        id: nextId,
        categoryId: targetCategory.id,
        createdAt: Date.now() + index,
        updatedAt: Date.now() + index,
      }
    })

    categories.value = [targetCategory, ...categories.value]
    videos.value = [...importedVideos, ...videos.value]
    persistVideos()
    persistCategories()
    syncCategoryStats()

    return {
      category: targetCategory,
      importedVideos,
      videoIdMap,
    }
  }

  const totalVideoCount = computed(() => videos.value.length)

  ensureDefaultCategory()
  syncCategoryStats()

  return {
    categories,
    videos,
    totalVideoCount,
    createCategory,
    renameCategory,
    deleteCategory,
    addVideosToCategory,
    toggleLike,
    toggleFavorite,
    incrementPlayCount,
    addWatchTime,
    getVideosByCategory,
    moveVideoToCategory,
    copyVideoToCategory,
    deleteVideo,
    replaceLibraryData,
    repairVideoSources,
    importBackupVideos,
    syncCategoryStats,
  }
})
