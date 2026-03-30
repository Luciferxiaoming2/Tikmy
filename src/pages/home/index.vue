<template>
  <view class="home-page">
    <view class="hero-overlay">
      <text class="hero-tag">Private Gallery</text>
      <text class="hero-title">沉浸式播放</text>
      <text class="hero-copy">后续这里会接入 swiper + video 的 3 实例播放池。</text>
    </view>
  </view>
</template>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  position: relative;
  background:
    radial-gradient(circle at center, rgba(86, 228, 114, 0.14), transparent 30%),
    linear-gradient(180deg, #090909 0%, #000000 100%);
}

.hero-overlay {
  position: absolute;
  left: 40rpx;
  right: 40rpx;
  bottom: 80rpx;
  padding: 36rpx;
  border-radius: var(--mt-radius-card);
  background: rgba(28, 27, 27, 0.64);
  backdrop-filter: blur(20px);
}

.hero-tag {
  display: block;
  color: var(--mt-primary);
  font-size: 24rpx;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-title {
  display: block;
  margin-top: 16rpx;
  font-size: 60rpx;
  font-weight: 700;
}

.hero-copy {
  display: block;
  margin-top: 16rpx;
  color: var(--mt-text-secondary);
  font-size: 28rpx;
  line-height: 1.7;
}
</style>
