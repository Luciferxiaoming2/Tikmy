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

    <view class="speed-row">
      <text class="speed-row__label" :style="textMutedStyle">{{ '\u5f39\u5e55\u901f\u5ea6' }}</text>
      <view class="speed-row__options">
        <view
          v-for="option in speedOptions"
          :key="option.value"
          class="speed-chip"
          :style="option.value === danmakuSpeed ? activeChipStyle : inactiveChipStyle"
          @tap="emit('change-danmaku-speed', option.value)"
        >
          <text class="speed-chip__text" :style="option.value === danmakuSpeed ? activeChipTextStyle : textMutedStyle">
            {{ option.label }}
          </text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const props = defineProps<{
  categoryName: string
  statsText: string
  hint: string
  danmakuSpeed: 'slow' | 'normal' | 'fast'
  panelStyle: Record<string, string>
  textPrimaryStyle: Record<string, string>
  textSecondaryStyle: Record<string, string>
  textMutedStyle: Record<string, string>
  activeChipStyle: Record<string, string>
  inactiveChipStyle: Record<string, string>
  activeChipTextStyle: Record<string, string>
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'change-danmaku-speed', value: 'slow' | 'normal' | 'fast'): void
}>()

const speedOptions = [
  { value: 'slow', label: '\u6162' },
  { value: 'normal', label: '\u6807\u51c6' },
  { value: 'fast', label: '\u5feb' },
] as const
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

.speed-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  margin-top: 22rpx;
}

.speed-row__label {
  font-size: 22rpx;
}

.speed-row__options {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.speed-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  min-height: 56rpx;
  padding: 0 18rpx;
  border-radius: 9999rpx;
  border: 1rpx solid transparent;
}

.speed-chip__text {
  font-size: 22rpx;
  line-height: 1;
}
</style>
