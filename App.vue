<script setup lang="ts">
import { onHide, onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const { passcode, useBiometrics } = storeToRefs(userStore)

onShow(() => {
  if (!useBiometrics.value || !passcode.value) {
    userStore.setUnlocked(true)
    return
  }

  userStore.setUnlocked(false)
})

onHide(() => {
  if (!useBiometrics.value || !passcode.value) {
    return
  }

  userStore.setUnlocked(false)
})
</script>

<style lang="scss">
page {
  background: #000000;
  color: #ffffff;
}
</style>
