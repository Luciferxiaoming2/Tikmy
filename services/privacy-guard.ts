import { onShow } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user'

export function usePrivacyGuard() {
  const userStore = useUserStore()

  onShow(() => {
    if (!userStore.useBiometrics || !userStore.passcode || userStore.isUnlocked) {
      return
    }

    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const currentRoute = currentPage?.route || ''

    if (currentRoute === 'pages/lock/index') {
      return
    }

    uni.navigateTo({
      url: '/pages/lock/index',
    })
  })
}
