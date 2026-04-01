<template>
  <view class="video-side-actions">
    <view class="side-button glass-panel" :style="panelStyle" @tap.stop="$emit('toggle-like')">
      <text class="side-button__icon">{{ liked ? '♥' : '♡' }}</text>
      <text class="side-button__text" :style="textPrimaryStyle">{{ liked ? '已喜欢' : '喜欢' }}</text>
    </view>
    <view class="side-button glass-panel" :style="panelStyle" @tap.stop="$emit('open-info')">
      <text class="side-button__icon">▶</text>
      <text class="side-button__text" :style="textPrimaryStyle">{{ playCount }}</text>
    </view>
    <view class="side-button glass-panel" :style="panelStyle" @tap.stop="$emit('open-comments')">
      <text class="side-button__icon">评</text>
      <text class="side-button__text" :style="textPrimaryStyle">{{ commentCount }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  liked: boolean
  playCount: number
  commentCount: number
  panelStyle: Record<string, string>
  textPrimaryStyle: Record<string, string>
}>()

defineEmits<{
  (event: 'toggle-like'): void
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
