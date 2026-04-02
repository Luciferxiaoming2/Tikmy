<template>
  <view class="video-side-actions">
    <view class="side-button glass-panel" :style="panelStyle" @tap.stop="$emit('toggle-like')">
      <text class="side-button__icon">{{ liked ? '\u2665' : '\u2661' }}</text>
      <text class="side-button__text" :style="textPrimaryStyle">{{ liked ? '\u5df2\u559c\u6b22' : '\u559c\u6b22' }}</text>
    </view>
    <view class="side-button glass-panel" :style="panelStyle" @tap.stop="$emit('toggle-favorite')">
      <text class="side-button__icon">{{ favorited ? '\u2605' : '\u2606' }}</text>
      <text class="side-button__text" :style="textPrimaryStyle">
        {{ favorited ? '\u5df2\u6536\u85cf' : '\u6536\u85cf' }}
      </text>
    </view>
    <view class="side-button glass-panel" :style="panelStyle" @tap.stop="$emit('open-comments')">
      <text class="side-button__icon">{{ '\u8bc4' }}</text>
      <text class="side-button__text" :style="textPrimaryStyle">{{ commentCount }}</text>
    </view>
    <view class="side-button glass-panel" :style="panelStyle" @tap.stop="$emit('open-info')">
      <text class="side-button__icon">{{ '\u24d8' }}</text>
      <text class="side-button__text" :style="textPrimaryStyle">{{ playCount }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  liked: boolean
  favorited: boolean
  playCount: number
  commentCount: number
  panelStyle: Record<string, string>
  textPrimaryStyle: Record<string, string>
}>()

defineEmits<{
  (event: 'toggle-like'): void
  (event: 'toggle-favorite'): void
  (event: 'open-info'): void
  (event: 'open-comments'): void
}>()
</script>

<style scoped lang="scss">
.video-side-actions {
  position: absolute;
  right: 22rpx;
  bottom: 320rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.side-button {
  width: 120rpx;
  padding: 18rpx 12rpx;
  border-radius: 26rpx;
  text-align: center;
  background: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

.side-button__icon {
  display: block;
  color: #fff;
  font-size: 32rpx;
  line-height: 1;
}

.side-button__text {
  display: block;
  margin-top: 10rpx;
  font-size: 20rpx;
}
</style>
