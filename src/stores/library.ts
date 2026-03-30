import { defineStore } from 'pinia'
import type { Category, VideoAsset } from '@/types/domain'

export const useLibraryStore = defineStore('library', {
  state: () => ({
    categories: [] as Category[],
    videos: [] as VideoAsset[],
  }),
})
