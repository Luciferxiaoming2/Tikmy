import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '@/constants/storage'
import {
  assertUniqueCategoryName,
  createCategoryEntity,
  createVideoAssets,
  DEFAULT_CATEGORY_ID,
  ensureBaseCategories,
  moveVideosToCategory,
  renameCategoryEntity,
  syncCategoryStats as buildCategoryStats,
} from '@/repositories/library'
import { getStorageItem, setStorageItem } from '@/services/storage/kv'
import type { Category, VideoAsset } from '@/types/domain'

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
    if (categoryId === DEFAULT_CATEGORY_ID) {
      throw new Error('未分类暂不支持重命名')
    }

    const target = categories.value.find((item) => item.id === categoryId)

    if (!target) {
      throw new Error('分类不存在')
    }

    assertUniqueCategoryName(categories.value, name, categoryId)
    categories.value = categories.value.map((category) =>
      category.id === categoryId ? renameCategoryEntity(category, name) : category,
    )
    persistCategories()
    syncCategoryStats()
  }

  function deleteCategory(categoryId: string) {
    if (categoryId === DEFAULT_CATEGORY_ID) {
      throw new Error('未分类不可删除')
    }

    const target = categories.value.find((item) => item.id === categoryId)

    if (!target) {
      throw new Error('分类不存在')
    }

    videos.value = moveVideosToCategory(videos.value, categoryId, DEFAULT_CATEGORY_ID)
    categories.value = categories.value.filter((category) => category.id !== categoryId)
    persistVideos()
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
      throw new Error('分类不存在')
    }

    const newVideos = createVideoAssets(categoryId, mediaFiles)
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
    renameCategory,
    deleteCategory,
    addVideosToCategory,
    syncCategoryStats,
  }
})
