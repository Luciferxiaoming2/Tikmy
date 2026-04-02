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
        <text class="sheet-close" :style="textMutedStyle" @tap="$emit('close')">{{ '\u5173\u95ed' }}</text>
      </view>

      <view v-if="allowImport || videos.length || batchMode" class="sheet-actions">
        <view
          v-if="allowImport && !batchMode"
          class="action-pill"
          :style="primaryActionStyle"
          @tap="$emit('import-category')"
        >
          <text class="action-pill__text action-pill__text--primary">{{ '\u5bfc\u5165\u5230\u6b64\u5206\u7c7b' }}</text>
        </view>

        <template v-if="batchMode">
          <view
            class="action-pill action-pill--ghost"
            :style="secondaryActionStyle"
            @tap="$emit('toggle-select-all')"
          >
            <text class="action-pill__text" :style="textPrimaryStyle">
              {{ allSelected ? '\u53d6\u6d88\u5168\u9009' : '\u5168\u9009' }}
            </text>
          </view>
          <view class="action-pill" :style="dangerActionStyle" @tap="$emit('batch-delete')">
            <text class="action-pill__text action-pill__text--danger">
              {{ selectionCount ? `${'\u5220\u9664'} ${selectionCount}` : '\u5220\u9664' }}
            </text>
          </view>
          <view
            class="action-pill action-pill--ghost"
            :style="secondaryActionStyle"
            @tap="$emit('cancel-batch-delete')"
          >
            <text class="action-pill__text" :style="textPrimaryStyle">{{ '\u53d6\u6d88' }}</text>
          </view>
        </template>
      </view>

      <view v-if="videos.length" class="gallery-grid">
        <view
          v-for="video in videos"
          :key="video.id"
          class="gallery-item glass-panel"
          :class="{ 'gallery-item--selected': batchMode && selectedVideoIds.includes(video.id) }"
          :style="batchMode && selectedVideoIds.includes(video.id) ? [cardStyle, selectedCardStyle] : cardStyle"
          @tap="handleVideoTap(video.id)"
          @longpress="handleVideoLongPress(video.id)"
        >
          <view v-if="batchMode" class="gallery-item__check" :style="checkStyle">
            <text class="gallery-item__check-icon">
              {{ selectedVideoIds.includes(video.id) ? '\u2713' : '' }}
            </text>
          </view>
          <view class="gallery-item__cover" :style="buildPosterStyle(video.posterPath)">
            <text v-if="!video.posterPath" class="gallery-item__fallback">VIDEO</text>
          </view>
          <text class="gallery-item__duration" :style="durationBadgeStyle">{{ formatDuration(video.duration) }}</text>
          <text class="gallery-item__meta" :style="textMutedStyle">{{ formatDate(video.createdAt) }}</text>
        </view>
      </view>

      <view v-else class="empty-state glass-panel" :style="cardStyle">
        <text class="empty-state__title" :style="textPrimaryStyle">{{ '\u8fd9\u4e2a\u5206\u7c7b\u8fd8\u6ca1\u6709\u89c6\u9891' }}</text>
        <text class="empty-state__copy" :style="textSecondaryStyle">
          {{ allowImport ? '\u5148\u5bfc\u5165\u51e0\u6761\u89c6\u9891\uff0c\u518d\u5728\u8fd9\u91cc\u50cf\u76f8\u518c\u4e00\u6837\u67e5\u770b\u548c\u6574\u7406\u3002' : '\u53bb\u64ad\u653e\u9875\u4e3a\u559c\u6b22\u7684\u89c6\u9891\u70b9\u51fb\u6536\u85cf\uff0c\u8fd9\u91cc\u4f1a\u81ea\u52a8\u6c47\u603b\u3002' }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { VideoAsset } from '@/types/domain'

const props = defineProps<{
  open: boolean
  title: string
  subtitle: string
  videos: VideoAsset[]
  allowImport: boolean
  batchMode: boolean
  selectedVideoIds: string[]
  selectionCount: number
  allSelected: boolean
  sheetStyle: Record<string, string>
  cardStyle: Record<string, string>
  textPrimaryStyle: Record<string, string>
  textSecondaryStyle: Record<string, string>
  textMutedStyle: Record<string, string>
  primaryActionStyle: Record<string, string>
  secondaryActionStyle: Record<string, string>
  dangerActionStyle: Record<string, string>
  durationBadgeStyle: Record<string, string>
  selectedCardStyle: Record<string, string>
  checkStyle: Record<string, string>
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'import-category'): void
  (event: 'select-video', videoId: string): void
  (event: 'enter-batch-mode', videoId: string): void
  (event: 'toggle-select-all'): void
  (event: 'cancel-batch-delete'): void
  (event: 'batch-delete'): void
  (event: 'toggle-video-selection', videoId: string): void
}>()

const pendingLongPressVideoId = ref('')

function handleVideoTap(videoId: string) {
  if (pendingLongPressVideoId.value === videoId) {
    pendingLongPressVideoId.value = ''
    return
  }

  if (props.batchMode) {
    emit('toggle-video-selection', videoId)
    return
  }

  emit('select-video', videoId)
}

function handleVideoLongPress(videoId: string) {
  pendingLongPressVideoId.value = videoId
  emit('enter-batch-mode', videoId)
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
  flex-wrap: wrap;
  align-items: stretch;
  gap: 16rpx;
  margin-top: 24rpx;
}

.action-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 80rpx;
  padding: 0 24rpx;
  border-radius: 9999rpx;
  flex: 1 1 0;
}

.action-pill--ghost {
  flex: 1 1 0;
}

.action-pill__text {
  font-size: 22rpx;
  white-space: nowrap;
}

.action-pill__text--primary {
  color: #08110c;
  font-weight: 700;
}

.action-pill__text--danger {
  color: #ffffff;
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

.gallery-item--selected {
  transform: translateY(-2rpx);
}

.gallery-item__check {
  position: absolute;
  top: 20rpx;
  left: 20rpx;
  z-index: 2;
  width: 34rpx;
  height: 34rpx;
  border-radius: 9999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.gallery-item__check-icon {
  color: #08110c;
  font-size: 22rpx;
  font-weight: 700;
  line-height: 1;
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
  margin-top: 12rpx;
  font-size: 20rpx;
  text-align: center;
}

.empty-state {
  margin-top: 24rpx;
  padding: 28rpx;
  border-radius: 28rpx;
}

.empty-state__title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.empty-state__copy {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.6;
}
</style>
