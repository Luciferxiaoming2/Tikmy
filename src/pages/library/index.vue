<template>
  <view :class="['page-shell', 'mt-page', themeClass]" :style="pageInlineStyle">
    <view class="page-header">
      <text class="eyebrow" :style="accentStyle">Library</text>
      <text class="title" :style="textPrimaryStyle">素材库</text>
      <text class="description" :style="textSecondaryStyle">管理分类、封面与本地视频导入。</text>
    </view>

    <view class="card glass-panel" :style="panelInlineStyle">
      <text class="card-title" :style="textPrimaryStyle">首期目标</text>
      <text class="card-body" :style="textSecondaryStyle">先完成本地视频导入、分类管理和网格浏览。</text>
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
const pageInlineStyle = computed(() => ({
  background: activeTheme.value.pageBackground,
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
.page-shell {
  padding: 96rpx 40rpx 48rpx;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.eyebrow {
  font-size: 24rpx;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.title {
  font-size: 56rpx;
  font-weight: 700;
}

.description {
  font-size: 28rpx;
  line-height: 1.6;
}

.card {
  margin-top: 48rpx;
  padding: 36rpx;
  border-radius: var(--mt-radius-card);
}

.card-title {
  display: block;
  margin-bottom: 16rpx;
  font-size: 32rpx;
  font-weight: 600;
}

.card-body {
  font-size: 28rpx;
  line-height: 1.7;
}
</style>
