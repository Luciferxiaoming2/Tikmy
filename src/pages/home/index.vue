<template>
  <view :class="['home-page', 'mt-page', themeClass]" :style="homeInlineStyle">
    <view class="hero-overlay glass-panel" :style="panelInlineStyle">
      <text class="hero-tag" :style="accentStyle">Private Gallery</text>
      <text class="hero-title" :style="textPrimaryStyle">沉浸式播放</text>
      <text class="hero-copy" :style="textSecondaryStyle">后续这里会接入 swiper + video 的 3 实例播放池。</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../../stores/user'
import { getThemeOption } from '../../theme/presets'

const userStore = useUserStore()
const { theme } = storeToRefs(userStore)
const activeTheme = computed(() => getThemeOption(theme.value))
const themeClass = computed(() => `theme--${theme.value}`)
const homeInlineStyle = computed(() => ({
  background: activeTheme.value.homeBackground,
  color: activeTheme.value.textPrimary,
}))
const panelInlineStyle = computed(() => ({
  background: activeTheme.value.surface,
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
  boxShadow: activeTheme.value.shadowSoft,
  backdropFilter: 'blur(20px)',
}))
const textPrimaryStyle = computed(() => ({ color: activeTheme.value.textPrimary }))
const textSecondaryStyle = computed(() => ({ color: activeTheme.value.textSecondary }))
const accentStyle = computed(() => ({ color: activeTheme.value.primary }))
</script>

<style scoped lang="scss">
.home-page {
  position: relative;
  background: var(--mt-home-background);
}

.hero-overlay {
  position: absolute;
  left: 40rpx;
  right: 40rpx;
  bottom: 80rpx;
  padding: 36rpx;
  border-radius: var(--mt-radius-card);
}

.hero-tag {
  display: block;
  font-size: 24rpx;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-title {
  display: block;
  margin-top: 16rpx;
  font-size: 60rpx;
  font-weight: 700;
}

.hero-copy {
  display: block;
  margin-top: 16rpx;
  font-size: 28rpx;
  line-height: 1.7;
}
</style>
