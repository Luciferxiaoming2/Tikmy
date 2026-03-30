<template>
  <view class="page-shell">
    <text class="title">设置</text>

    <view class="setting-list">
      <view class="setting-item glass-panel">
        <text class="label">隐私锁</text>
        <text class="value">待接入</text>
      </view>
      <view class="setting-item glass-panel">
        <text class="label">JSON 备份</text>
        <text class="value">待接入</text>
      </view>
      <view class="setting-item glass-panel">
        <text class="label">生物识别</text>
        <text class="value">待接入</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-shell {
  min-height: 100vh;
  padding: 96rpx 40rpx 48rpx;
}

.title {
  display: block;
  font-size: 56rpx;
  font-weight: 700;
}

.setting-list {
  margin-top: 40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-radius: var(--mt-radius-card);
}

.label {
  font-size: 30rpx;
  color: var(--mt-text-primary);
}

.value {
  font-size: 26rpx;
  color: var(--mt-text-muted);
}
</style>
