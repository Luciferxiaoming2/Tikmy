<template>
  <view :class="['page-shell', 'mt-page', themeClass]" :style="pageInlineStyle">
    <view class="hero glass-panel" :style="panelInlineStyle">
      <text class="hero__eyebrow" :style="accentStyle">SETTINGS</text>
      <text class="hero__title" :style="textPrimaryStyle">播放偏好</text>
      <text class="hero__copy" :style="textSecondaryStyle">
        控制 Home 页的视频排列策略、喜欢权重和快捷手势，所有设置都只保存在本机。
      </text>
      <view class="hero__chips">
        <view class="hero-chip" :style="chipInlineStyle">
          <text class="hero-chip__label" :style="textMutedStyle">当前模式</text>
          <text class="hero-chip__value" :style="textPrimaryStyle">{{ playbackModeLabel }}</text>
        </view>
        <view class="hero-chip" :style="chipInlineStyle">
          <text class="hero-chip__label" :style="textMutedStyle">喜欢权重</text>
          <text class="hero-chip__value" :style="textPrimaryStyle">{{ likeWeight }}%</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section__title" :style="textPrimaryStyle">播放模式</text>
      <view class="mode-grid">
        <view
          v-for="option in playbackModeOptions"
          :key="option.value"
          class="mode-card glass-panel"
          :style="option.value === playbackMode ? [panelInlineStyle, activeCardStyle] : panelInlineStyle"
          @tap="selectPlaybackMode(option.value)"
        >
          <text class="mode-card__title" :style="textPrimaryStyle">{{ option.label }}</text>
          <text class="mode-card__copy" :style="textSecondaryStyle">{{ option.description }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section__title" :style="textPrimaryStyle">喜欢权重</text>
      <view class="weight-card glass-panel" :style="panelInlineStyle">
        <view class="weight-card__header">
          <view>
            <text class="weight-card__title" :style="textPrimaryStyle">已喜欢视频优先级</text>
            <text class="weight-card__copy" :style="textSecondaryStyle">
              数值越高，随机模式下已喜欢的视频越容易再次刷到。
            </text>
          </view>
          <text class="weight-card__value" :style="accentStyle">{{ likeWeight }}%</text>
        </view>
        <slider
          class="weight-slider"
          :value="likeWeight"
          :min="0"
          :max="100"
          :step="5"
          :activeColor="activeTheme.primary"
          :backgroundColor="activeTheme.borderSubtle"
          :block-color="activeTheme.primary"
          @change="handleLikeWeightChange"
        />
        <view class="weight-scale">
          <text class="weight-scale__label" :style="textMutedStyle">更均匀</text>
          <text class="weight-scale__label" :style="textMutedStyle">更偏爱已喜欢</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section__title" :style="textPrimaryStyle">手势开关</text>
      <view class="setting-list">
        <view class="setting-item glass-panel" :style="panelInlineStyle">
          <view class="setting-main">
            <text class="label" :style="textPrimaryStyle">双击点赞</text>
            <text class="setting-subtitle" :style="textSecondaryStyle">在 Home 页双击视频舞台可快速切换喜欢状态。</text>
          </view>
          <switch
            :checked="gestures.doubleTapLike"
            :color="activeTheme.primary"
            @change="handleGestureChange('doubleTapLike', $event)"
          />
        </view>

        <view class="setting-item glass-panel" :style="panelInlineStyle">
          <view class="setting-main">
            <text class="label" :style="textPrimaryStyle">长按倍速</text>
            <text class="setting-subtitle" :style="textSecondaryStyle">长按当前视频时临时切换为 2 倍速，松手恢复。</text>
          </view>
          <switch
            :checked="gestures.longPressSpeed"
            :color="activeTheme.primary"
            @change="handleGestureChange('longPressSpeed', $event)"
          />
        </view>

        <view class="setting-item glass-panel" :style="panelInlineStyle">
          <view class="setting-main">
            <text class="label" :style="textPrimaryStyle">生物识别预留</text>
            <text class="setting-subtitle" :style="textSecondaryStyle">先保留开关位置，后续隐私锁版本再接入真实能力。</text>
          </view>
          <switch
            :checked="useBiometrics"
            :color="activeTheme.primary"
            @change="handleBiometricChange"
          />
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section__title" :style="textPrimaryStyle">主题</text>
      <view class="theme-trigger glass-panel" :style="panelInlineStyle" @tap="toggleThemePicker">
        <view class="setting-main">
          <text class="label" :style="textPrimaryStyle">界面主题</text>
          <text class="setting-subtitle" :style="textSecondaryStyle">{{ activeTheme.description }}</text>
        </view>
        <view class="setting-meta">
          <text class="value" :style="textMutedStyle">{{ activeTheme.name }}</text>
          <text class="chevron" :style="textMutedStyle">更换</text>
        </view>
      </view>
    </view>

    <view v-if="isThemePickerOpen" class="sheet-mask" @tap="closeThemePicker" />
    <view v-if="isThemePickerOpen" class="theme-sheet glass-panel" :style="sheetInlineStyle">
      <view class="theme-sheet__header">
        <view>
          <text class="theme-sheet__title" :style="textPrimaryStyle">选择主题</text>
          <text class="theme-sheet__subtitle" :style="textSecondaryStyle">
            主题会同步到素材库、Home 和底部 TabBar。
          </text>
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
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user'
import { THEME_OPTIONS, getThemeOption } from '@/theme/presets'
import type { ThemeId } from '@/theme/presets'
import type { GestureSettings, PlaybackMode } from '@/types/domain'

const themeOptions = THEME_OPTIONS
const playbackModeOptions: Array<{ value: PlaybackMode; label: string; description: string }> = [
  {
    value: 'sequential',
    label: '顺序播放',
    description: '按导入时间依次刷视频，适合整理素材和连续检查内容。',
  },
  {
    value: 'random',
    label: '随机播放',
    description: '自动打散顺序，并结合喜欢权重调整刷到已喜欢视频的概率。',
  },
]

const userStore = useUserStore()
const { gestures, likeWeight, playbackMode, theme, useBiometrics } = storeToRefs(userStore)
const isThemePickerOpen = ref(false)

const activeTheme = computed(() => getThemeOption(theme.value))
const playbackModeLabel = computed(
  () => playbackModeOptions.find((option) => option.value === playbackMode.value)?.label || '顺序播放',
)
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
const chipInlineStyle = computed(() => ({
  background: activeTheme.value.themeOptionBackground,
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
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
const activeBorderStyle = computed(() => ({ borderColor: activeTheme.value.primary }))
const activeCardStyle = computed(() => ({
  borderColor: activeTheme.value.primary,
  background: activeTheme.value.themeOptionBackground,
}))
const textPrimaryStyle = computed(() => ({ color: activeTheme.value.textPrimary }))
const textSecondaryStyle = computed(() => ({ color: activeTheme.value.textSecondary }))
const textMutedStyle = computed(() => ({ color: activeTheme.value.textMuted }))
const accentStyle = computed(() => ({ color: activeTheme.value.primary }))

function handleBiometricChange(event: Event) {
  const detail = (event as Event & { detail?: { value?: boolean } }).detail
  userStore.setUseBiometrics(Boolean(detail?.value))
}

function handleLikeWeightChange(event: Event) {
  const detail = (event as Event & { detail?: { value?: number } }).detail
  userStore.setLikeWeight(Number(detail?.value || 0))
}

function handleGestureChange(key: keyof GestureSettings, event: Event) {
  const detail = (event as Event & { detail?: { value?: boolean } }).detail
  userStore.setGestureSetting(key, Boolean(detail?.value))
}

function selectPlaybackMode(value: PlaybackMode) {
  userStore.setPlaybackMode(value)
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
  padding: 96rpx 32rpx 56rpx;
}

.hero {
  padding: 34rpx 30rpx;
  border-radius: var(--mt-radius-card);
}

.hero__eyebrow {
  display: block;
  font-size: 22rpx;
  letter-spacing: 0.18em;
}

.hero__title {
  display: block;
  margin-top: 16rpx;
  font-size: 56rpx;
  font-weight: 700;
}

.hero__copy {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.7;
}

.hero__chips {
  display: flex;
  gap: 16rpx;
  margin-top: 26rpx;
}

.hero-chip {
  flex: 1;
  min-width: 0;
  padding: 20rpx 22rpx;
  border-radius: 24rpx;
}

.hero-chip__label {
  display: block;
  font-size: 20rpx;
}

.hero-chip__value {
  display: block;
  margin-top: 10rpx;
  font-size: 28rpx;
  font-weight: 600;
}

.section {
  margin-top: 36rpx;
}

.section__title {
  display: block;
  margin-bottom: 18rpx;
  font-size: 32rpx;
  font-weight: 700;
}

.mode-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.mode-card {
  padding: 28rpx;
  border-radius: 28rpx;
  border: 2rpx solid transparent;
}

.mode-card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.mode-card__copy {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.weight-card {
  padding: 28rpx;
  border-radius: 28rpx;
}

.weight-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
}

.weight-card__title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.weight-card__copy {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.weight-card__value {
  font-size: 34rpx;
  font-weight: 700;
}

.weight-slider {
  margin-top: 18rpx;
}

.weight-scale {
  display: flex;
  justify-content: space-between;
  margin-top: 8rpx;
}

.weight-scale__label {
  font-size: 22rpx;
}

.setting-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.setting-item,
.theme-trigger {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20rpx;
  padding: 28rpx;
  border-radius: 28rpx;
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
  font-weight: 600;
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
