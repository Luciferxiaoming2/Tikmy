<template>
  <view class="panel glass-panel" :style="panelStyle" @tap.stop>
    <view class="panel-header">
      <view class="panel-header__main">
        <text class="panel-title" :style="textPrimaryStyle">{{ categoryName }}</text>
        <text class="panel-meta" :style="textSecondaryStyle">{{ statsText }}</text>
      </view>
      <text class="panel-close" :style="textMutedStyle" @tap="emit('close')">关闭</text>
    </view>

    <text class="panel-copy" :style="textMutedStyle">{{ hint }}</text>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  categoryName: string
  statsText: string
  hint: string
  panelStyle: Record<string, string>
  textPrimaryStyle: Record<string, string>
  textSecondaryStyle: Record<string, string>
  textMutedStyle: Record<string, string>
}>()

const emit = defineEmits<{
  (event: 'close'): void
}>()
</script>

<style scoped lang="scss">
.panel {
  padding: 28rpx 28rpx 30rpx;
  border-radius: 32rpx 32rpx 0 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.panel-header__main {
  flex: 1;
  min-width: 0;
}

.panel-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
}

.panel-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 24rpx;
}

.panel-close {
  font-size: 22rpx;
}

.panel-copy {
  display: block;
  margin-top: 18rpx;
  font-size: 22rpx;
  line-height: 1.7;
}
</style>
