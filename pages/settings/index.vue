<template>
  <view :class="['page-shell', 'mt-page', themeClass]" :style="pageInlineStyle">
    <view class="hero glass-panel" :style="panelInlineStyle">
      <text class="hero__eyebrow" :style="accentStyle">SETTINGS</text>
      <text class="hero__title" :style="textPrimaryStyle">播放设置</text>
      <text class="hero__copy" :style="textSecondaryStyle">
        控制 Home 页的播放范围、顺序和交互偏好，优先保证刷视频时的稳定体验。
      </text>
      <view class="hero__chips">
        <view class="hero-chip" :style="chipInlineStyle">
          <text class="hero-chip__label" :style="textMutedStyle">播放分类</text>
          <text class="hero-chip__value" :style="textPrimaryStyle">{{ playbackCategoryLabel }}</text>
        </view>
        <view class="hero-chip" :style="chipInlineStyle">
          <text class="hero-chip__label" :style="textMutedStyle">播放模式</text>
          <text class="hero-chip__value" :style="textPrimaryStyle">{{ playbackModeLabel }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section__title" :style="textPrimaryStyle">播放分类</text>
      <text class="section__copy" :style="textSecondaryStyle">
        先选播放范围，再决定顺序或随机。默认播放“全部”。
      </text>
      <view class="picker-card glass-panel" :style="[panelInlineStyle, activeCardStyle]" @tap="openCategoryPicker">
        <view class="picker-card__main">
          <text class="picker-card__title" :style="textPrimaryStyle">{{ playbackCategoryLabel }}</text>
          <text class="picker-card__copy" :style="textSecondaryStyle">
            {{ playbackCategoryMeta }}
          </text>
        </view>
        <text class="picker-card__action" :style="textMutedStyle">选择</text>
      </view>
    </view>

    <view class="section">
      <text class="section__title" :style="textPrimaryStyle">播放模式</text>
      <text class="section__copy" :style="textSecondaryStyle">
        顺序模式播完当前分类后会从头循环；随机模式会在当前分类里随机抽取。
      </text>
      <view class="selection-grid">
        <view
          v-for="option in playbackModeOptions"
          :key="option.value"
          class="selection-card glass-panel"
          :style="option.value === playbackMode ? [panelInlineStyle, activeCardStyle] : panelInlineStyle"
          :data-mode="option.value"
          @tap="handlePlaybackModeTap"
        >
          <text class="selection-card__title" :style="textPrimaryStyle">{{ option.label }}</text>
          <text class="selection-card__copy" :style="textSecondaryStyle">{{ option.description }}</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section__title" :style="textPrimaryStyle">喜欢权重</text>
      <view class="weight-card glass-panel" :style="panelInlineStyle">
        <view class="weight-card__header">
          <view>
            <text class="weight-card__title" :style="textPrimaryStyle">随机播放时的喜欢加权</text>
            <text class="weight-card__copy" :style="textSecondaryStyle">
              只在随机模式生效。权重越高，已点赞视频越容易再次出现。
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
          <text class="weight-scale__label" :style="textMutedStyle">更偏向已喜欢</text>
        </view>
      </view>
    </view>

    <view class="section">
      <text class="section__title" :style="textPrimaryStyle">手势偏好</text>
      <view class="setting-list">
        <view class="setting-item glass-panel" :style="panelInlineStyle">
          <view class="setting-main">
            <text class="label" :style="textPrimaryStyle">双击点赞</text>
            <text class="setting-subtitle" :style="textSecondaryStyle">
              开启后，Home 页双击当前视频会直接点赞。
            </text>
          </view>
          <switch
            :checked="gestures.doubleTapLike"
            :color="activeTheme.primary"
            data-key="doubleTapLike"
            @change="handleGestureChange"
          />
        </view>

        <view class="setting-item glass-panel" :style="panelInlineStyle">
          <view class="setting-main">
            <text class="label" :style="textPrimaryStyle">长按 2 倍速</text>
            <text class="setting-subtitle" :style="textSecondaryStyle">
              开启后，长按当前视频临时切到 2 倍速，松手恢复。
            </text>
          </view>
          <switch
            :checked="gestures.longPressSpeed"
            :color="activeTheme.primary"
            data-key="longPressSpeed"
            @change="handleGestureChange"
          />
        </view>

        <view class="setting-item glass-panel" :style="panelInlineStyle">
          <view class="setting-main">
            <text class="label" :style="textPrimaryStyle">生物识别占位</text>
            <text class="setting-subtitle" :style="textSecondaryStyle">
              预留给后续隐私能力，当前不影响 MVP 主流程。
            </text>
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
          <text class="label" :style="textPrimaryStyle">当前主题</text>
          <text class="setting-subtitle" :style="textSecondaryStyle">{{ activeTheme.description }}</text>
        </view>
        <view class="setting-meta">
          <text class="value" :style="textMutedStyle">{{ activeTheme.name }}</text>
          <text class="chevron" :style="textMutedStyle">切换</text>
        </view>
      </view>
    </view>

    <view v-if="isThemePickerOpen" class="sheet-mask" @tap="closeThemePicker" />
    <view v-if="isThemePickerOpen" class="theme-sheet glass-panel" :style="sheetInlineStyle">
      <view class="theme-sheet__header">
        <view>
          <text class="theme-sheet__title" :style="textPrimaryStyle">选择主题</text>
          <text class="theme-sheet__subtitle" :style="textSecondaryStyle">
            主题会同步影响页面背景、面板层次和底部导航观感。
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
          :data-theme-id="option.id"
          @tap="handleThemeTap"
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

    <view v-if="isCategoryPickerOpen" class="sheet-mask" @tap="closeCategoryPicker" />
    <view v-if="isCategoryPickerOpen" class="theme-sheet glass-panel" :style="sheetInlineStyle">
      <view class="theme-sheet__header">
        <view>
          <text class="theme-sheet__title" :style="textPrimaryStyle">选择播放分类</text>
          <text class="theme-sheet__subtitle" :style="textSecondaryStyle">
            Home 页会只播放当前所选分类的视频。
          </text>
        </view>
        <text class="theme-sheet__close" :style="textMutedStyle" @tap="closeCategoryPicker">关闭</text>
      </view>

      <scroll-view scroll-y class="theme-sheet__list theme-sheet__list--category">
        <view
          v-for="option in playbackCategoryRange"
          :key="option.id"
          class="theme-row"
          :style="option.id === playbackCategoryId ? [themeOptionInlineStyle, activeBorderStyle] : themeOptionInlineStyle"
          :data-category-id="option.id"
          @tap="handlePlaybackCategoryTap"
        >
          <view class="theme-row__content">
            <text class="theme-name" :style="textPrimaryStyle">{{ option.name }}</text>
            <text class="theme-copy" :style="textSecondaryStyle">{{ option.videoCountLabel }}</text>
          </view>
          <text v-if="option.id === playbackCategoryId" class="theme-row__selected" :style="textPrimaryStyle">当前</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { DEFAULT_CATEGORY_ID } from '@/repositories/library'
import { useLibraryStore } from '@/stores/library'
import { useUserStore } from '@/stores/user'
import { THEME_OPTIONS, getThemeOption } from '@/theme/presets'
import type { ThemeId } from '@/theme/presets'
import type { GestureSettings, PlaybackMode } from '@/types/domain'

const themeOptions = THEME_OPTIONS
const playbackModeOptions: Array<{ value: PlaybackMode; label: string; description: string }> = [
  {
    value: 'sequential',
    label: '顺序播放',
    description: '按当前分类的视频顺序播放，播到最后一条后自动回到第一条继续循环。',
  },
  {
    value: 'random',
    label: '随机播放',
    description: '只在当前分类内随机抽取视频，适合反复刷同一类素材时打散顺序。',
  },
]

const userStore = useUserStore()
const libraryStore = useLibraryStore()
const { categories } = storeToRefs(libraryStore)
const { gestures, likeWeight, playbackCategoryId, playbackMode, theme, useBiometrics } = storeToRefs(userStore)
const isThemePickerOpen = ref(false)
const isCategoryPickerOpen = ref(false)

const playbackCategoryOptions = computed(() => categories.value)
const playbackCategoryRange = computed(() =>
  playbackCategoryOptions.value.map((option) => ({
    id: option.id,
    name: option.name,
    videoCountLabel: `${option.videoCount} 个视频`,
  })),
)
const activeTheme = computed(() => getThemeOption(theme.value))
const playbackModeLabel = computed(
  () => playbackModeOptions.find((option) => option.value === playbackMode.value)?.label || '顺序播放',
)
const playbackCategoryLabel = computed(
  () => playbackCategoryOptions.value.find((option) => option.id === playbackCategoryId.value)?.name || '全部',
)
const playbackCategoryIndex = computed(() => {
  const index = playbackCategoryOptions.value.findIndex((option) => option.id === playbackCategoryId.value)
  return index >= 0 ? index : 0
})
const playbackCategoryMeta = computed(() => {
  const option = playbackCategoryOptions.value[playbackCategoryIndex.value]
  return option ? `${option.videoCount} 个视频` : '0 个视频'
})
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

watch(
  categories,
  (nextCategories) => {
    if (!nextCategories.some((category) => category.id === playbackCategoryId.value)) {
      userStore.setPlaybackCategory(DEFAULT_CATEGORY_ID)
    }
  },
  {
    immediate: true,
  },
)

function handleBiometricChange(event: Event) {
  const detail = (event as Event & { detail?: { value?: boolean } }).detail
  userStore.setUseBiometrics(Boolean(detail?.value))
}

function handleLikeWeightChange(event: Event) {
  const detail = (event as Event & { detail?: { value?: number } }).detail
  userStore.setLikeWeight(Number(detail?.value || 0))
}

function handleGestureChange(event: Event) {
  const key = (
    event as Event & { currentTarget?: { dataset?: { key?: keyof GestureSettings } } }
  ).currentTarget?.dataset?.key
  const detail = (event as Event & { detail?: { value?: boolean } }).detail

  if (!key) {
    return
  }

  userStore.setGestureSetting(key, Boolean(detail?.value))
}

function openCategoryPicker() {
  isCategoryPickerOpen.value = true
}

function closeCategoryPicker() {
  isCategoryPickerOpen.value = false
}

function handlePlaybackCategoryTap(event: Event) {
  const dataset = (
    event as Event & { currentTarget?: { dataset?: { categoryId?: string } } }
  ).currentTarget?.dataset
  userStore.setPlaybackCategory(dataset?.categoryId || DEFAULT_CATEGORY_ID)
  closeCategoryPicker()
}

function handlePlaybackModeTap(event: Event) {
  const dataset = (event as Event & { currentTarget?: { dataset?: { mode?: PlaybackMode } } }).currentTarget?.dataset
  userStore.setPlaybackMode(dataset?.mode === 'random' ? 'random' : 'sequential')
}

function toggleThemePicker() {
  isThemePickerOpen.value = !isThemePickerOpen.value
}

function closeThemePicker() {
  isThemePickerOpen.value = false
}

function handleThemeTap(event: Event) {
  const dataset = (event as Event & { currentTarget?: { dataset?: { themeId?: ThemeId } } }).currentTarget?.dataset

  if (dataset?.themeId) {
    userStore.setTheme(dataset.themeId)
  }
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
  margin-bottom: 12rpx;
  font-size: 32rpx;
  font-weight: 700;
}

.section__copy {
  display: block;
  margin-bottom: 18rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.selection-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.picker-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 28rpx;
  border-radius: 28rpx;
  border: 2rpx solid transparent;
}

.picker-card__main {
  flex: 1;
  min-width: 0;
}

.picker-card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.picker-card__copy {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.picker-card__action {
  font-size: 24rpx;
}

.selection-card {
  padding: 28rpx;
  border-radius: 28rpx;
  border: 2rpx solid transparent;
}

.selection-card__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.selection-card__copy {
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

.theme-sheet__list--category {
  max-height: 52vh;
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
