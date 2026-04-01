<template>
  <view :class="['page-shell', 'mt-page', themeClass]" :style="pageInlineStyle">
    <view class="page-header">
      <text class="eyebrow" :style="accentStyle">Library</text>
      <text class="title" :style="textPrimaryStyle">素材库</text>
      <text class="description" :style="textSecondaryStyle">先完成分类管理、本地视频导入和基础元数据落盘。</text>
    </view>

    <view class="hero glass-panel" :style="panelInlineStyle">
      <view class="hero-copy">
        <text class="hero-title" :style="textPrimaryStyle">当前已收纳 {{ totalVideoCount }} 个视频</text>
        <text class="hero-description" :style="textSecondaryStyle">
          先从“未分类”开始导入，后续再逐步整理到不同主题分类。
        </text>
      </view>
      <view class="hero-actions">
        <view class="action action--primary" :style="primaryActionStyle" @tap="handleQuickImport">
          <text class="action-text action-text--primary">导入视频</text>
        </view>
        <view class="action" :style="secondaryActionStyle" @tap="openCreateCategory">
          <text class="action-text" :style="textPrimaryStyle">新建分类</text>
        </view>
      </view>
    </view>

    <view v-if="showCreateCategory" class="create-card glass-panel" :style="panelInlineStyle">
      <text class="section-title" :style="textPrimaryStyle">创建分类</text>
      <input
        v-model="newCategoryName"
        class="category-input"
        :style="inputInlineStyle"
        maxlength="20"
        placeholder="输入分类名称，例如：旅行、音乐、练习素材"
        placeholder-style="color: #8e8e93;"
      />
      <view class="create-actions">
        <view class="action" :style="secondaryActionStyle" @tap="cancelCreateCategory">
          <text class="action-text" :style="textPrimaryStyle">取消</text>
        </view>
        <view class="action action--primary" :style="primaryActionStyle" @tap="submitCreateCategory">
          <text class="action-text action-text--primary">保存分类</text>
        </view>
      </view>
    </view>

    <view class="section-header">
      <text class="section-title" :style="textPrimaryStyle">分类列表</text>
      <text class="section-meta" :style="textMutedStyle">{{ categories.length }} 个分类</text>
    </view>

    <view v-if="!categories.length" class="empty-state glass-panel" :style="panelInlineStyle">
      <text class="empty-title" :style="textPrimaryStyle">还没有可用分类</text>
      <text class="empty-copy" :style="textSecondaryStyle">先创建一个分类，再开始导入本地视频。</text>
    </view>

    <view v-else class="category-list">
      <view
        v-for="category in categories"
        :key="category.id"
        class="category-card glass-panel"
        :style="panelInlineStyle"
      >
        <view class="category-cover" :style="buildCategoryCoverStyle(category)">
          <text v-if="!category.coverPath" class="category-cover__fallback">{{ category.name.slice(0, 2) }}</text>
        </view>
        <view class="category-content">
          <view class="category-head">
            <text class="category-name" :style="textPrimaryStyle">{{ category.name }}</text>
            <text class="category-count" :style="textMutedStyle">{{ category.videoCount }} 个视频</text>
          </view>
          <text class="category-note" :style="textSecondaryStyle">
            {{ category.videoCount ? '分类卡片已具备基础元数据展示能力。' : '当前为空，可直接向该分类导入视频。' }}
          </text>
          <view class="category-actions">
            <view class="action action--compact" :style="primaryActionStyle" @tap="handleImport(category.id)">
              <text class="action-text action-text--primary">导入到此分类</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useLibraryStore } from '@/stores/library'
import { useUserStore } from '@/stores/user'
import { getThemeOption } from '@/theme/presets'
import type { Category } from '@/types/domain'

const DEFAULT_IMPORT_CATEGORY_ID = 'default'

const userStore = useUserStore()
const libraryStore = useLibraryStore()

const { theme } = storeToRefs(userStore)
const { categories, totalVideoCount } = storeToRefs(libraryStore)

const showCreateCategory = ref(false)
const newCategoryName = ref('')

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
const textMutedStyle = computed(() => ({ color: activeTheme.value.textMuted }))
const accentStyle = computed(() => ({ color: activeTheme.value.primary }))
const primaryActionStyle = computed(() => ({
  background: activeTheme.value.primary,
  border: `1rpx solid ${activeTheme.value.primary}`,
}))
const secondaryActionStyle = computed(() => ({
  background: 'transparent',
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
}))
const inputInlineStyle = computed(() => ({
  color: activeTheme.value.textPrimary,
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
  background: activeTheme.value.themeOptionBackground,
}))

function openCreateCategory() {
  showCreateCategory.value = true
}

function cancelCreateCategory() {
  showCreateCategory.value = false
  newCategoryName.value = ''
}

function submitCreateCategory() {
  try {
    libraryStore.createCategory(newCategoryName.value)
    uni.showToast({
      title: '分类已创建',
      icon: 'success',
    })
    cancelCreateCategory()
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '创建失败',
      icon: 'none',
    })
  }
}

async function importToCategory(categoryId: string) {
  try {
    const result = await new Promise<WechatMiniprogram.ChooseMediaSuccessCallbackResult>((resolve, reject) => {
      uni.chooseMedia({
        count: 9,
        mediaType: ['video'],
        sourceType: ['album'],
        success: resolve,
        fail: reject,
      })
    })
    const mediaFiles = result.tempFiles || []

    if (!mediaFiles.length) {
      return
    }

    const imported = libraryStore.addVideosToCategory(categoryId, mediaFiles)

    uni.showToast({
      title: `已导入 ${imported.length} 个视频`,
      icon: 'success',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message.toLowerCase().includes('cancel')) {
      return
    }

    uni.showToast({
      title: '导入失败，请重试',
      icon: 'none',
    })
  }
}

function handleQuickImport() {
  void importToCategory(DEFAULT_IMPORT_CATEGORY_ID)
}

function handleImport(categoryId: string) {
  return () => {
    void importToCategory(categoryId)
  }
}

function buildCategoryCoverStyle(category: Category) {
  if (category.coverPath) {
    return {
      backgroundImage: `url(${category.coverPath})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }

  return {
    background: activeTheme.value.themeOptionBackground,
    border: `1rpx solid ${activeTheme.value.borderSubtle}`,
  }
}
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

.hero,
.create-card,
.empty-state,
.category-card {
  border-radius: var(--mt-radius-card);
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  margin-top: 40rpx;
  padding: 36rpx;
}

.hero-title {
  display: block;
  font-size: 38rpx;
  font-weight: 700;
}

.hero-description {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.7;
}

.hero-actions,
.create-actions,
.category-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.action {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 180rpx;
  padding: 20rpx 28rpx;
  border-radius: 9999rpx;
}

.action--compact {
  min-width: 0;
  padding: 18rpx 24rpx;
}

.action-text {
  font-size: 24rpx;
  line-height: 1;
}

.action-text--primary {
  color: #08110c;
  font-weight: 700;
}

.create-card {
  margin-top: 28rpx;
  padding: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40rpx;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 700;
}

.section-meta {
  font-size: 24rpx;
}

.category-input {
  width: 100%;
  box-sizing: border-box;
  margin-top: 20rpx;
  margin-bottom: 20rpx;
  padding: 24rpx 28rpx;
  border-radius: 24rpx;
  font-size: 28rpx;
}

.empty-state {
  padding: 40rpx 32rpx;
}

.empty-title {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
}

.empty-copy {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  line-height: 1.7;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.category-card {
  display: flex;
  gap: 24rpx;
  padding: 24rpx;
}

.category-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 168rpx;
  height: 168rpx;
  flex-shrink: 0;
  border-radius: 28rpx;
  overflow: hidden;
}

.category-cover__fallback {
  color: rgba(255, 255, 255, 0.7);
  font-size: 34rpx;
  font-weight: 700;
}

.category-content {
  flex: 1;
  min-width: 0;
}

.category-head {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
  align-items: flex-start;
}

.category-name {
  font-size: 32rpx;
  font-weight: 700;
}

.category-count {
  font-size: 24rpx;
}

.category-note {
  display: block;
  margin-top: 12rpx;
  font-size: 25rpx;
  line-height: 1.6;
}

.category-actions {
  margin-top: 18rpx;
}
</style>
