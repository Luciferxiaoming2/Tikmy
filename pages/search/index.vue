<template>
  <view :class="['search-page', 'mt-page', themeClass]" :style="pageInlineStyle">
    <view class="search-shell">
      <view class="search-bar glass-panel" :style="panelInlineStyle">
        <view class="search-bar__back" @tap="goBack">
          <text class="search-bar__back-icon" :style="textPrimaryStyle">&#8592;</text>
        </view>

        <view class="search-bar__input-wrap" :style="inputInlineStyle">
          <view class="search-bar__icon" aria-hidden="true">
            <view class="search-bar__icon-lens" />
            <view class="search-bar__icon-handle" />
          </view>
          <input
            v-model="keyword"
            class="search-bar__input"
            :style="textPrimaryStyle"
            type="text"
            confirm-type="search"
            maxlength="40"
            placeholder="搜索分类、评论和本地视频"
            :placeholder-style="placeholderStyle"
          />
          <view v-if="keyword" class="search-bar__clear" @tap="clearKeyword">
            <text class="search-bar__clear-icon" :style="textMutedStyle">×</text>
          </view>
        </view>
      </view>

      <view class="search-headline">
        <text class="search-headline__title" :style="textPrimaryStyle">本地搜索</text>
        <text class="search-headline__meta" :style="textSecondaryStyle">{{ resultSummary }}</text>
      </view>

      <scroll-view scroll-y class="search-results">
        <view v-if="!normalizedKeyword" class="empty-state glass-panel" :style="panelInlineStyle">
          <text class="empty-state__title" :style="textPrimaryStyle">输入关键词开始搜索</text>
          <text class="empty-state__copy" :style="textSecondaryStyle">
            支持搜索分类名称、评论内容，以及按分类归属查找本地视频。
          </text>
        </view>

        <template v-else>
          <view v-if="!hasResults" class="empty-state glass-panel" :style="panelInlineStyle">
            <text class="empty-state__title" :style="textPrimaryStyle">没有匹配结果</text>
            <text class="empty-state__copy" :style="textSecondaryStyle">
              试试更短的关键词，或者从分类名称、评论内容开始搜索。
            </text>
          </view>

          <view v-if="categoryResults.length" class="result-section">
            <text class="result-section__title" :style="textPrimaryStyle">分类</text>
            <view
              v-for="category in categoryResults"
              :key="category.id"
              class="result-card glass-panel"
              :style="panelInlineStyle"
              @tap="openCategory(category.id)"
            >
              <view class="result-card__main">
                <text class="result-card__title" :style="textPrimaryStyle">{{ category.name }}</text>
                <text class="result-card__meta" :style="textSecondaryStyle">{{ category.videoCount }} 个视频</text>
              </view>
              <text class="result-card__action" :style="textMutedStyle">进入播放</text>
            </view>
          </view>

          <view v-if="videoResults.length" class="result-section">
            <text class="result-section__title" :style="textPrimaryStyle">视频</text>
            <view
              v-for="video in videoResults"
              :key="video.id"
              class="video-result glass-panel"
              :style="panelInlineStyle"
              @tap="openVideo(video.id)"
            >
              <view class="video-result__poster" :style="buildPosterStyle(video.posterPath)">
                <text v-if="!video.posterPath" class="video-result__poster-fallback">VIDEO</text>
              </view>
              <view class="video-result__body">
                <text class="result-card__title" :style="textPrimaryStyle">{{ categoryNameFor(video.categoryId) }}</text>
                <text class="result-card__meta" :style="textSecondaryStyle">
                  {{ formatDuration(video.duration) }} · 播放 {{ video.playCount }} 次
                </text>
              </view>
              <text class="result-card__action" :style="textMutedStyle">打开</text>
            </view>
          </view>

          <view v-if="commentResults.length" class="result-section">
            <text class="result-section__title" :style="textPrimaryStyle">评论</text>
            <view
              v-for="comment in commentResults"
              :key="comment.id"
              class="result-card glass-panel"
              :style="panelInlineStyle"
              @tap="openVideo(comment.videoId)"
            >
              <view class="result-card__main">
                <text class="result-card__title" :style="textPrimaryStyle">{{ comment.content }}</text>
                <text class="result-card__meta" :style="textSecondaryStyle">
                  {{ categoryNameFor(videoById(comment.videoId)?.categoryId || '') }} · {{ formatCommentTime(comment.timestamp) }}
                </text>
              </view>
              <text class="result-card__action" :style="textMutedStyle">定位视频</text>
            </view>
          </view>
        </template>
      </scroll-view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCommentStore } from '@/stores/comments'
import { useLibraryStore } from '@/stores/library'
import { usePlayerStore } from '@/stores/player'
import { useUserStore } from '@/stores/user'
import { getThemeOption } from '@/theme/presets'
import type { CommentItem, VideoAsset } from '@/types/domain'

const userStore = useUserStore()
const libraryStore = useLibraryStore()
const playerStore = usePlayerStore()
const commentStore = useCommentStore()

const { theme } = storeToRefs(userStore)
const { categories, videos } = storeToRefs(libraryStore)
const { comments } = storeToRefs(commentStore)

const keyword = ref('')
const isNavigating = ref(false)

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
const inputInlineStyle = computed(() => ({
  background: activeTheme.value.themeOptionBackground,
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
}))
const textPrimaryStyle = computed(() => ({ color: activeTheme.value.textPrimary }))
const textSecondaryStyle = computed(() => ({ color: activeTheme.value.textSecondary }))
const textMutedStyle = computed(() => ({ color: activeTheme.value.textMuted }))
const placeholderStyle = computed(() => `color:${activeTheme.value.textMuted};font-size:28rpx;`)
const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase())

const categoryResults = computed(() => {
  if (!normalizedKeyword.value) {
    return []
  }

  return categories.value.filter((category) => category.name.toLowerCase().includes(normalizedKeyword.value))
})

const videoResults = computed(() => {
  if (!normalizedKeyword.value) {
    return []
  }

  return videos.value
    .filter((video) => categoryNameFor(video.categoryId).toLowerCase().includes(normalizedKeyword.value))
    .slice(0, 12)
})

const commentResults = computed(() => {
  if (!normalizedKeyword.value) {
    return []
  }

  return comments.value
    .filter((comment) => comment.content.toLowerCase().includes(normalizedKeyword.value))
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, 12)
})

const hasResults = computed(
  () => categoryResults.value.length > 0 || videoResults.value.length > 0 || commentResults.value.length > 0,
)

const resultSummary = computed(() => {
  if (!normalizedKeyword.value) {
    return `共 ${categories.value.length} 个分类，${videos.value.length} 个视频，${comments.value.length} 条评论`
  }

  return `找到 ${categoryResults.value.length + videoResults.value.length + commentResults.value.length} 条结果`
})

function clearKeyword() {
  keyword.value = ''
}

function goBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack()
    return
  }

  uni.switchTab({
    url: '/pages/home/index',
  })
}

function openCategory(categoryId: string) {
  userStore.setPlaybackCategory(categoryId)
  navigateHome()
}

function openVideo(videoId: string) {
  const video = videoById(videoId)

  if (!video) {
    return
  }

  userStore.setPlaybackCategory(video.categoryId)
  playerStore.setActiveVideo(video.id, 0)
  navigateHome()
}

function navigateHome() {
  if (isNavigating.value) {
    return
  }

  isNavigating.value = true

  if (getCurrentPages().length > 1) {
    uni.navigateBack({
      complete: () => {
        isNavigating.value = false
      },
    })
    return
  }

  uni.switchTab({
    url: '/pages/home/index',
    complete: () => {
      isNavigating.value = false
    },
  })
}

function videoById(videoId: string) {
  return videos.value.find((video) => video.id === videoId)
}

function categoryNameFor(categoryId: string) {
  return categories.value.find((category) => category.id === categoryId)?.name || '全部'
}

function formatDuration(duration: number) {
  const totalSeconds = Math.max(0, Math.round(duration))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatCommentTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const restSeconds = safeSeconds % 60

  return `${minutes}:${String(restSeconds).padStart(2, '0')}`
}

function buildPosterStyle(posterPath: string) {
  if (!posterPath) {
    return {}
  }

  return {
    backgroundImage: `url(${posterPath})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
}
</script>

<style scoped lang="scss">
.search-page {
  min-height: 100vh;
}

.search-shell {
  min-height: 100vh;
  padding: 76rpx 24rpx 40rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  border-radius: 28rpx;
}

.search-bar__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
}

.search-bar__back-icon {
  font-size: 40rpx;
  line-height: 1;
}

.search-bar__input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14rpx;
  min-height: 72rpx;
  padding: 0 20rpx;
  border-radius: 9999rpx;
}

.search-bar__icon {
  position: relative;
  width: 28rpx;
  height: 28rpx;
  flex: 0 0 28rpx;
}

.search-bar__icon-lens {
  position: absolute;
  top: 2rpx;
  left: 1rpx;
  width: 16rpx;
  height: 16rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.65);
  border-radius: 9999rpx;
}

.search-bar__icon-handle {
  position: absolute;
  right: 2rpx;
  bottom: 3rpx;
  width: 10rpx;
  height: 4rpx;
  border-radius: 9999rpx;
  background: rgba(255, 255, 255, 0.65);
  transform: rotate(45deg);
  transform-origin: center;
}

.search-bar__clear-icon {
  font-size: 28rpx;
  line-height: 1;
}

.search-bar__input {
  flex: 1;
  height: 72rpx;
  font-size: 28rpx;
}

.search-bar__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
}

.search-headline {
  margin-top: 28rpx;
}

.search-headline__title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
}

.search-headline__meta {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
}

.search-results {
  height: calc(100vh - 246rpx);
  margin-top: 28rpx;
}

.empty-state {
  padding: 32rpx 28rpx;
  border-radius: 28rpx;
}

.empty-state__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.empty-state__copy {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.result-section + .result-section {
  margin-top: 28rpx;
}

.result-section__title {
  display: block;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.result-card,
.video-result {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 24rpx;
  border-radius: 28rpx;
}

.result-card + .result-card,
.video-result + .video-result {
  margin-top: 14rpx;
}

.result-card__main,
.video-result__body {
  flex: 1;
  min-width: 0;
}

.result-card__title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.5;
}

.result-card__meta {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.5;
}

.result-card__action {
  font-size: 22rpx;
}

.video-result__poster {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 112rpx;
  height: 156rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.video-result__poster-fallback {
  color: rgba(255, 255, 255, 0.65);
  font-size: 20rpx;
  letter-spacing: 0.08em;
}
</style>
