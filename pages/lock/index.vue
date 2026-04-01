<template>
  <view :class="['lock-page', 'mt-page', themeClass]" :style="pageInlineStyle">
    <text class="lock-title" :style="textPrimaryStyle">输入隐私密码</text>
    <view class="dot-row">
      <view v-for="item in 6" :key="item" class="dot" :style="dotInlineStyle" />
    </view>
    <text class="lock-tip" :style="textSecondaryStyle">后续这里会接入 6 位密码与生物识别解锁。</text>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { getThemeOption } from '@/theme/presets'

const userStore = useUserStore()
const { theme } = storeToRefs(userStore)
const activeTheme = computed(() => getThemeOption(theme.value))
const themeClass = computed(() => `theme--${theme.value}`)
const pageInlineStyle = computed(() => ({
  background: activeTheme.value.pageBackground,
  color: activeTheme.value.textPrimary,
}))
const textPrimaryStyle = computed(() => ({ color: activeTheme.value.textPrimary }))
const textSecondaryStyle = computed(() => ({ color: activeTheme.value.textSecondary }))
const dotInlineStyle = computed(() => ({
  background: activeTheme.value.surfaceHighest,
  boxShadow: '0 0 24rpx rgba(0, 0, 0, 0.18)',
}))
</script>

<style scoped lang="scss">
.lock-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  padding: 40rpx;
}

.lock-title {
  font-size: 48rpx;
  font-weight: 700;
}

.dot-row {
  display: flex;
  gap: 20rpx;
}

.dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
}

.lock-tip {
  font-size: 28rpx;
  text-align: center;
  line-height: 1.7;
}
</style>
