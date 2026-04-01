import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '../constants/storage'
import { getStorageItem, setStorageItem } from '../services/storage/kv'
import type { Category, VideoAsset } from '../types/domain'

const DEFAULT_CATEGORY_NAME = '未分类'

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

function createDefaultCategory(): Category {
  const now = Date.now()

  return {
    id: 'default',
    name: DEFAULT_CATEGORY_NAME,
    coverPath: '',
    videoCount: 0,
    createdAt: now,
    updatedAt: now,
  }
}

export const useLibraryStore = defineStore('library', () => {
  const categories = ref<Category[]>(getStorageItem<Category[]>(STORAGE_KEYS.categories, []))
  const videos = ref<VideoAsset[]>(getStorageItem<VideoAsset[]>(STORAGE_KEYS.videos, []))

  function persistCategories() {
    setStorageItem(STORAGE_KEYS.categories, categories.value)
  }

  function persistVideos() {
    setStorageItem(STORAGE_KEYS.videos, videos.value)
  }

  function syncCategoryStats() {
    categories.value = categories.value.map((category) => {
      const categoryVideos = videos.value.filter((video) => video.categoryId === category.id)
      const latestVideo = categoryVideos.at(-1)

      return {
        ...category,
        videoCount: categoryVideos.length,
        coverPath: latestVideo?.posterPath || latestVideo?.localPath || category.coverPath,
        updatedAt: latestVideo?.updatedAt || category.updatedAt,
      }
    })

    persistCategories()
  }

  function ensureDefaultCategory() {
    if (!categories.value.length) {
      categories.value = [createDefaultCategory()]
      persistCategories()
      return
    }

    const hasDefault = categories.value.some((category) => category.id === 'default')

    if (!hasDefault) {
      categories.value.unshift(createDefaultCategory())
      persistCategories()
    }
  }

  function createCategory(name: string) {
    const normalizedName = name.trim()

    if (!normalizedName) {
      throw new Error('分类名称不能为空')
    }

    const now = Date.now()
    const category: Category = {
      id: createId('category'),
      name: normalizedName,
      coverPath: '',
      videoCount: 0,
      createdAt: now,
      updatedAt: now,
    }

    categories.value = [category, ...categories.value]
    persistCategories()

    return category
  }

  function addVideosToCategory(
    categoryId: string,
    mediaFiles: Array<WechatMiniprogram.MediaFile & { thumbTempFilePath?: string }>,
  ) {
    const category = categories.value.find((item) => item.id === categoryId)

    if (!category) {
      throw new Error('分类不存在')
    }

    const now = Date.now()
    const newVideos: VideoAsset[] = mediaFiles.map((file, index) => ({
      id: createId(`video_${index}`),
      categoryId,
      localPath: file.tempFilePath,
      posterPath: file.thumbTempFilePath || '',
      videoHash: file.tempFilePath,
      duration: file.duration || 0,
      isLiked: false,
      playCount: 0,
      totalWatchTime: 0,
      createdAt: now + index,
      updatedAt: now + index,
    }))

    videos.value = [...videos.value, ...newVideos]
    persistVideos()
    syncCategoryStats()

    return newVideos
  }

  const totalVideoCount = computed(() => videos.value.length)

  ensureDefaultCategory()
  syncCategoryStats()

  return {
    categories,
    videos,
    totalVideoCount,
    createCategory,
    addVideosToCategory,
    syncCategoryStats,
  }
})
