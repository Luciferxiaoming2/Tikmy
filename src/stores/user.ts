import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    isUnlocked: false,
    useBiometrics: false,
  }),
  actions: {
    setUnlocked(value: boolean) {
      this.isUnlocked = value
    },
  },
})
