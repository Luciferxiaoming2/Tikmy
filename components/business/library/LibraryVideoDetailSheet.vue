<template>
  <view v-if="open && video" class="sheet-wrap">
    <view class="sheet-mask" @tap="$emit('close')" />
    <view class="sheet-panel" :style="sheetStyle">
      <view class="sheet-handle" />
      <view class="sheet-header">
        <view class="sheet-header__main">
          <text class="sheet-title" :style="textPrimaryStyle">{{ '\u89c6\u9891\u8be6\u60c5' }}</text>
          <text class="sheet-subtitle" :style="textMutedStyle">{{ categoryName }}</text>
        </view>
        <text class="sheet-close" :style="textMutedStyle" @tap="$emit('close')">{{ '\u5173\u95ed' }}</text>
      </view>

      <view class="preview-card glass-panel" :style="cardStyle">
        <view class="preview-cover" :style="buildPosterStyle(video.posterPath)">
          <text v-if="!video.posterPath" class="preview-cover__fallback">VIDEO</text>
        </view>
      </view>

      <view class="info-list glass-panel" :style="cardStyle">
        <view class="info-row">
          <text class="info-row__label" :style="textMutedStyle">{{ '\u65f6\u957f' }}</text>
          <text class="info-row__value" :style="textPrimaryStyle">{{ formatDuration(video.duration) }}</text>
        </view>
        <view class="info-row">
          <text class="info-row__label" :style="textMutedStyle">{{ '\u64ad\u653e\u6b21\u6570' }}</text>
          <text class="info-row__value" :style="textPrimaryStyle">{{ video.playCount }}</text>
        </view>
        <view class="info-row">
          <text class="info-row__label" :style="textMutedStyle">{{ '\u7d2f\u8ba1\u89c2\u770b' }}</text>
          <text class="info-row__value" :style="textPrimaryStyle">{{ formatWatchTime(video.totalWatchTime) }}</text>
        </view>
        <view class="info-row">
          <text class="info-row__label" :style="textMutedStyle">{{ '\u672c\u5730\u8def\u5f84' }}</text>
          <text class="info-row__value info-row__value--path" :style="textPrimaryStyle">{{ video.localPath }}</text>
        </view>
        <view v-if="video.importHint" class="info-row">
          <text class="info-row__label" :style="textMutedStyle">{{ '\u517c\u5bb9\u6027\u63d0\u793a' }}</text>
          <text class="info-row__value info-row__value--path" :style="textPrimaryStyle">{{ video.importHint }}</text>
        </view>
      </view>

      <view class="action-list">
        <view class="action-row" :style="primaryActionStyle" @tap="$emit('copy')">
          <text class="action-row__text action-row__text--primary">{{ '\u590d\u5236\u5230\u5176\u4ed6\u5206\u7c7b' }}</text>
        </view>
        <view class="action-row" :style="secondaryActionStyle" @tap="$emit('move')">
          <text class="action-row__text" :style="textPrimaryStyle">{{ '\u79fb\u52a8\u5230\u5176\u4ed6\u5206\u7c7b' }}</text>
        </view>
        <view class="action-row" :style="secondaryActionStyle" @tap="$emit('download')">
          <text class="action-row__text" :style="textPrimaryStyle">{{ '\u4fdd\u5b58\u5230\u672c\u5730' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { VideoAsset } from '@/types/domain'

defineProps<{
  open: boolean
  video: VideoAsset | null
  categoryName: string
  sheetStyle: Record<string, string>
  cardStyle: Record<string, string>
  textPrimaryStyle: Record<string, string>
  textMutedStyle: Record<string, string>
  primaryActionStyle: Record<string, string>
  secondaryActionStyle: Record<string, string>
}>()

defineEmits<{
  (event: 'close'): void
  (event: 'copy'): void
  (event: 'move'): void
  (event: 'download'): void
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

function formatWatchTime(seconds: number) {
  if (seconds < 60) {
    return `${Math.round(seconds)} ${'\u79d2'}`
  }

  return `${(seconds / 60).toFixed(1)} ${'\u5206\u949f'}`
}
</script>

<style scoped lang="scss">
.sheet-wrap {
  position: fixed;
  inset: 0;
  z-index: 60;
}

.sheet-mask {
  position: absolute;
  inset: 0;
  background: rgba(8, 8, 8, 0.36);
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

.preview-card,
.info-list {
  margin-top: 24rpx;
  padding: 18rpx;
  border-radius: 28rpx;
}

.preview-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 16 / 9;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.05);
}

.preview-cover__fallback {
  color: rgba(255, 255, 255, 0.72);
  font-size: 24rpx;
  font-weight: 700;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20rpx;
}

.info-row__label {
  width: 132rpx;
  font-size: 22rpx;
}

.info-row__value {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  text-align: right;
}

.info-row__value--path {
  line-height: 1.6;
  word-break: break-all;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-top: 24rpx;
}

.action-row {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  border-radius: 9999rpx;
}

.action-row__text {
  font-size: 24rpx;
}

.action-row__text--primary {
  color: #08110c;
  font-weight: 700;
}
</style>
