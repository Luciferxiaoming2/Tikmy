<template>
  <view class="lock-page">
    <text class="lock-title">输入隐私密码</text>
    <view class="dot-row">
      <view v-for="item in 6" :key="item" class="dot" />
    </view>
    <text class="lock-tip">后续这里会接入 6 位密码与生物识别解锁。</text>
  </view>
</template>

<style scoped lang="scss">
.lock-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  padding: 40rpx;
}

.lock-title {
  font-size: 48rpx;
  font-weight: 700;
}

.dot-row {
  display: flex;
  gap: 20rpx;
}

.dot {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
  background: rgba(53, 53, 52, 0.9);
  box-shadow: 0 0 24rpx rgba(86, 228, 114, 0.1);
}

.lock-tip {
  color: var(--mt-text-secondary);
  font-size: 28rpx;
  text-align: center;
  line-height: 1.7;
}
</style>
