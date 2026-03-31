<template>
  <view :class="['page-shell', 'mt-page', themeClass]" :style="pageInlineStyle">
    <text class="title" :style="textPrimaryStyle">设置</text>

    <view class="setting-list">
      <view class="setting-item glass-panel" :style="panelInlineStyle" @tap="toggleThemePicker">
        <view class="setting-main">
          <text class="label" :style="textPrimaryStyle">主题风格</text>
          <text class="setting-subtitle" :style="textSecondaryStyle">{{ activeTheme.description }}</text>
        </view>
        <view class="setting-meta">
          <text class="value" :style="textMutedStyle">{{ activeTheme.name }}</text>
          <text class="chevron" :style="textMutedStyle">选择</text>
        </view>
      </view>

      <view class="setting-item glass-panel" :style="panelInlineStyle">
        <text class="label" :style="textPrimaryStyle">隐私锁</text>
        <text class="value" :style="textMutedStyle">待接入</text>
      </view>

      <view class="setting-item glass-panel" :style="panelInlineStyle">
        <text class="label" :style="textPrimaryStyle">JSON 备份</text>
        <text class="value" :style="textMutedStyle">待接入</text>
      </view>

      <view class="setting-item glass-panel" :style="panelInlineStyle">
        <text class="label" :style="textPrimaryStyle">生物识别</text>
        <switch
          :checked="useBiometrics"
          :color="activeTheme.preview[0]"
          @change="handleBiometricChange"
        />
      </view>
    </view>

    <view v-if="isThemePickerOpen" class="sheet-mask" @tap="closeThemePicker" />
    <view
      v-if="isThemePickerOpen"
      class="theme-sheet glass-panel"
      :style="sheetInlineStyle"
    >
      <view class="theme-sheet__header">
        <view>
          <text class="theme-sheet__title" :style="textPrimaryStyle">选择主题</text>
          <text class="theme-sheet__subtitle" :style="textSecondaryStyle">切换后会立即应用到当前页面和 tabBar。</text>
        </view>
        <text class="theme-sheet__close" :style="textMutedStyle" @tap="closeThemePicker">关闭</text>
      </view>

      <view class="theme-sheet__list">
        <view
          v-for="option in themeOptions"
          :key="option.id"
          class="theme-row"
          :style="option.id === theme ? [themeOptionInlineStyle, activeBorderStyle] : themeOptionInlineStyle"
          @tap="selectTheme(option.id)"
        >
          <view class="theme-row__preview">
            <view
              v-for="color in option.preview"
              :key="`${option.id}-${color}`"
              class="theme-preview__chip"
              :style="{ backgroundColor: color }"
            />
          </view>
          <view class="theme-row__content">
            <text class="theme-name" :style="textPrimaryStyle">{{ option.name }}</text>
            <text class="theme-copy" :style="textSecondaryStyle">{{ option.description }}</text>
          </view>
          <text v-if="option.id === theme" class="theme-row__selected" :style="textPrimaryStyle">当前</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '../../stores/user'
import { THEME_OPTIONS, getThemeOption } from '../../theme/presets'
import type { ThemeId } from '../../theme/presets'

const themeOptions = THEME_OPTIONS
const userStore = useUserStore()
const { useBiometrics, theme } = storeToRefs(userStore)
const isThemePickerOpen = ref(false)
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
const themeOptionInlineStyle = computed(() => ({
  background: activeTheme.value.themeOptionBackground,
}))
const sheetInlineStyle = computed(() => ({
  background: activeTheme.value.surface,
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
  boxShadow: activeTheme.value.shadowSoft,
  backdropFilter: 'blur(28px)',
}))
const textPrimaryStyle = computed(() => ({ color: activeTheme.value.textPrimary }))
const textSecondaryStyle = computed(() => ({ color: activeTheme.value.textSecondary }))
const textMutedStyle = computed(() => ({ color: activeTheme.value.textMuted }))
const activeBorderStyle = computed(() => ({ borderColor: activeTheme.value.primary }))

function handleBiometricChange(event: Event) {
  const detail = (event as Event & { detail?: { value?: boolean } }).detail
  userStore.setUseBiometrics(Boolean(detail?.value))
}

function toggleThemePicker() {
  isThemePickerOpen.value = !isThemePickerOpen.value
}

function closeThemePicker() {
  isThemePickerOpen.value = false
}

function selectTheme(themeId: ThemeId) {
  userStore.setTheme(themeId)
}
</script>

<style scoped lang="scss">
.page-shell {
  padding: 96rpx 40rpx 48rpx;
}

.title {
  display: block;
  font-size: 56rpx;
  font-weight: 700;
}

.setting-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  margin-top: 40rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-radius: var(--mt-radius-card);
}

.setting-main {
  flex: 1;
  min-width: 0;
}

.setting-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8rpx;
}

.label {
  font-size: 30rpx;
}

.setting-subtitle {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.value {
  font-size: 26rpx;
}

.chevron {
  font-size: 22rpx;
}

.sheet-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
}

.theme-sheet {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 24rpx;
  padding: 28rpx;
  border-radius: 36rpx;
}

.theme-sheet__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24rpx;
}

.theme-sheet__title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
}

.theme-sheet__subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.theme-sheet__close {
  font-size: 24rpx;
}

.theme-sheet__list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 24rpx;
}

.theme-row {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  border: 2rpx solid transparent;
}

.theme-row__preview {
  display: flex;
  gap: 8rpx;
  width: 132rpx;
}

.theme-preview__chip {
  flex: 1;
  height: 44rpx;
  border-radius: 12rpx;
}

.theme-row__content {
  flex: 1;
  min-width: 0;
}

.theme-name {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
}

.theme-copy {
  display: block;
  margin-top: 6rpx;
  font-size: 22rpx;
  line-height: 1.5;
}

.theme-row__selected {
  font-size: 22rpx;
}
</style>
