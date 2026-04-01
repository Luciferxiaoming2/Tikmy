import { defineStore } from 'pinia'

export const usePlayerStore = defineStore('player', {
  state: () => ({
    activeVideoId: '',
    currentIndex: 0,
    currentTime: 0,
  }),
  actions: {
    setActiveVideo(id: string, index: number) {
      this.activeVideoId = id
      this.currentIndex = index
      this.currentTime = 0
    },
    setCurrentTime(time: number) {
      this.currentTime = time
    },
  },
})
