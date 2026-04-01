<template>
  <view class="panel glass-panel" :style="panelStyle" @tap.stop>
    <view class="panel-header">
      <view class="panel-header__main">
        <text class="panel-title" :style="textPrimaryStyle">我的评论</text>
        <text class="panel-meta" :style="textSecondaryStyle">
          {{ comments.length ? `${comments.length} 条记录` : '还没有评论' }}
        </text>
      </view>
      <text class="panel-close" :style="textMutedStyle" @tap="emit('close')">关闭</text>
    </view>

    <view class="panel-body">
      <view v-if="comments.length" class="comment-list">
        <view v-for="comment in comments" :key="comment.id" class="comment-item">
          <text class="comment-item__time" :style="accentStyle">{{ comment.timeLabel }}</text>
          <text class="comment-item__content" :style="textPrimaryStyle">{{ comment.content }}</text>
        </view>
      </view>
      <text v-else class="comment-empty" :style="textMutedStyle">发一条给未来再次刷到的自己。</text>

      <view v-if="active" class="comment-editor">
        <input
          :value="draft"
          class="comment-input"
          :style="inputStyle"
          maxlength="40"
          placeholder="写一句想在下次刷到时看到的话"
          placeholder-style="color: #8e8e93;"
          confirm-type="send"
          @input="handleInput"
          @confirm="emit('submit')"
        />
        <view class="comment-send" :style="primaryActionStyle" @tap="emit('submit')">
          <text class="comment-send__text">发送</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  active: boolean
  draft: string
  comments: Array<{ id: string; timeLabel: string; content: string }>
  panelStyle: Record<string, string>
  textPrimaryStyle: Record<string, string>
  textSecondaryStyle: Record<string, string>
  textMutedStyle: Record<string, string>
  accentStyle: Record<string, string>
  inputStyle: Record<string, string>
  primaryActionStyle: Record<string, string>
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'submit'): void
  (event: 'update:draft', value: string): void
}>()

function handleInput(event: Event & { detail?: { value?: string } }) {
  emit('update:draft', event.detail?.value || '')
}
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
  font-size: 28rpx;
  font-weight: 700;
}

.panel-meta {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
}

.panel-close {
  font-size: 22rpx;
}

.panel-body {
  margin-top: 18rpx;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.comment-item {
  display: flex;
  gap: 14rpx;
  align-items: flex-start;
}

.comment-item__time {
  min-width: 68rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.comment-item__content {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  line-height: 1.6;
}

.comment-empty {
  display: block;
  font-size: 22rpx;
}

.comment-editor {
  display: flex;
  gap: 14rpx;
  align-items: center;
  margin-top: 18rpx;
}

.comment-input {
  flex: 1;
  min-height: 84rpx;
  box-sizing: border-box;
  padding: 0 24rpx;
  border-radius: 22rpx;
  font-size: 26rpx;
}

.comment-send {
  display: flex;
  min-width: 136rpx;
  min-height: 84rpx;
  align-items: center;
  justify-content: center;
  border-radius: 22rpx;
}

.comment-send__text {
  color: #08110c;
  font-size: 24rpx;
  font-weight: 700;
}
</style>
