<template>
  <view v-if="open" class="sheet-wrap">
    <view class="sheet-mask" @tap="$emit('close')" />
    <view class="sheet-panel" :style="sheetStyle">
      <view class="sheet-handle" />
      <view class="sheet-header">
        <view class="sheet-header__main">
          <text class="sheet-title" :style="textPrimaryStyle">{{ title }}</text>
          <text class="sheet-subtitle" :style="textMutedStyle">{{ subtitle }}</text>
        </view>
        <text class="sheet-close" :style="textMutedStyle" @tap="$emit('close')">关闭</text>
      </view>

      <view class="sheet-actions">
        <view class="action-pill" :style="primaryActionStyle" @tap="$emit('import-category')">
          <text class="action-pill__text action-pill__text--primary">导入到此分类</text>
        </view>
      </view>

      <view v-if="videos.length" class="gallery-grid">
        <view
          v-for="video in videos"
          :key="video.id"
          class="gallery-item glass-panel"
          :style="cardStyle"
          @tap="$emit('select-video', video.id)"
        >
          <view class="gallery-item__cover" :style="buildPosterStyle(video.posterPath)">
            <text v-if="!video.posterPath" class="gallery-item__fallback">VIDEO</text>
          </view>
          <text class="gallery-item__duration" :style="durationBadgeStyle">{{ formatDuration(video.duration) }}</text>
          <text class="gallery-item__meta" :style="textMutedStyle">{{ formatDate(video.createdAt) }}</text>
        </view>
      </view>

      <view v-else class="empty-state glass-panel" :style="cardStyle">
        <text class="empty-state__title" :style="textPrimaryStyle">这个分类还没有视频</text>
        <text class="empty-state__copy" :style="textSecondaryStyle">先导入几条视频，再在这里像相册一样查看和整理。</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { VideoAsset } from '@/types/domain'

defineProps<{
  open: boolean
  title: string
  subtitle: string
  videos: VideoAsset[]
  sheetStyle: Record<string, string>
  cardStyle: Record<string, string>
  textPrimaryStyle: Record<string, string>
  textSecondaryStyle: Record<string, string>
  textMutedStyle: Record<string, string>
  primaryActionStyle: Record<string, string>
  durationBadgeStyle: Record<string, string>
}>()

defineEmits<{
  (event: 'close'): void
  (event: 'import-category'): void
  (event: 'select-video', videoId: string): void
}>()

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

function formatDuration(duration: number) {
  const totalSeconds = Math.max(0, Math.round(duration))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatDate(timestamp: number) {
  const date = new Date(timestamp)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${month}-${day}`
}
</script>

<style scoped lang="scss">
.sheet-wrap {
  position: fixed;
  inset: 0;
  z-index: 50;
}

.sheet-mask {
  position: absolute;
  inset: 0;
  background: rgba(8, 8, 8, 0.28);
}

.sheet-panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 20rpx 28rpx calc(30rpx + env(safe-area-inset-bottom));
  border-top-left-radius: 36rpx;
  border-top-right-radius: 36rpx;
}

.sheet-handle {
  width: 84rpx;
  height: 8rpx;
  margin: 0 auto 24rpx;
  border-radius: 9999rpx;
  background: rgba(142, 142, 147, 0.35);
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16rpx;
}

.sheet-header__main {
  flex: 1;
  min-width: 0;
}

.sheet-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
}

.sheet-subtitle {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
}

.sheet-close {
  font-size: 24rpx;
}

.sheet-actions {
  display: flex;
  margin-top: 24rpx;
}

.action-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 220rpx;
  min-height: 80rpx;
  padding: 0 28rpx;
  border-radius: 9999rpx;
}

.action-pill__text {
  font-size: 24rpx;
}

.action-pill__text--primary {
  color: #08110c;
  font-weight: 700;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 24rpx;
  max-height: 58vh;
  overflow: auto;
}

.gallery-item {
  position: relative;
  padding: 12rpx;
  border-radius: 26rpx;
}

.gallery-item__cover {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 3 / 4;
  border-radius: 18rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.gallery-item__fallback {
  color: rgba(255, 255, 255, 0.72);
  font-size: 22rpx;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.gallery-item__duration {
  position: absolute;
  right: 18rpx;
  bottom: 46rpx;
  padding: 6rpx 12rpx;
  border-radius: 9999rpx;
  font-size: 18rpx;
}

.gallery-item__meta {
  display: block;
  margin-top: 10rpx;
  font-size: 20rpx;
  text-align: center;
}

.empty-state {
  margin-top: 24rpx;
  padding: 34rpx 28rpx;
  border-radius: 28rpx;
}

.empty-state__title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.empty-state__copy {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.6;
}
</style>
