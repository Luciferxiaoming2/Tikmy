<template>
  <view class="empty-shell">
    <view class="empty-card glass-panel" :style="panelStyle">
      <text class="empty-tag" :style="accentStyle">HOME</text>
      <text class="empty-title" :style="textPrimaryStyle">还没有可播放的视频</text>
      <text class="empty-copy" :style="textSecondaryStyle">
        先去素材库导入本地视频，随后回到 Home 页就能开始上下刷视频。
      </text>
      <view class="empty-action" :style="primaryActionStyle" @tap="$emit('go-library')">
        <text class="empty-action__text">前往素材库</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  panelStyle: Record<string, string>
  accentStyle: Record<string, string>
  textPrimaryStyle: Record<string, string>
  textSecondaryStyle: Record<string, string>
  primaryActionStyle: Record<string, string>
}>()

defineEmits<{
  (event: 'go-library'): void
}>()
</script>

<style scoped lang="scss">
.empty-shell {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 48rpx 40rpx;
}

.empty-card {
  width: 100%;
  padding: 40rpx 36rpx;
  border-radius: var(--mt-radius-card);
}

.empty-tag {
  display: block;
  font-size: 24rpx;
  letter-spacing: 0.18em;
}

.empty-title {
  display: block;
  margin-top: 18rpx;
  font-size: 48rpx;
  font-weight: 700;
}

.empty-copy {
  display: block;
  margin-top: 18rpx;
  font-size: 28rpx;
  line-height: 1.7;
}

.empty-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 220rpx;
  margin-top: 28rpx;
  padding: 22rpx 30rpx;
  border-radius: 9999rpx;
}

.empty-action__text {
  color: #08110c;
  font-size: 24rpx;
  font-weight: 700;
}
</style>
