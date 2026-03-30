<template>
  <view class="page-shell">
    <view class="page-header">
      <text class="eyebrow">Library</text>
      <text class="title">素材库</text>
      <text class="description">管理分类、封面与本地视频导入。</text>
    </view>

    <view class="card glass-panel">
      <text class="card-title">首期目标</text>
      <text class="card-body">先完成本地视频导入、分类管理和网格浏览。</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-shell {
  min-height: 100vh;
  padding: 96rpx 40rpx 48rpx;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.eyebrow {
  font-size: 24rpx;
  color: var(--mt-primary);
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.title {
  font-size: 56rpx;
  font-weight: 700;
}

.description {
  color: var(--mt-text-secondary);
  font-size: 28rpx;
  line-height: 1.6;
}

.card {
  margin-top: 48rpx;
  padding: 36rpx;
  border-radius: var(--mt-radius-card);
}

.card-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
}

.card-body {
  color: var(--mt-text-secondary);
  font-size: 28rpx;
  line-height: 1.7;
}
</style>
