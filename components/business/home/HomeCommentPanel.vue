<template>
  <view class="panel glass-panel" :style="panelStyle" @tap.stop>
    <view class="panel-header">
      <view class="panel-header__main">
        <text class="panel-title" :style="textPrimaryStyle">{{ '\u6211\u7684\u8bc4\u8bba' }}</text>
        <text class="panel-meta" :style="textSecondaryStyle">
          {{ comments.length ? `${comments.length} \u6761\u8bb0\u5f55` : '\u8fd8\u6ca1\u6709\u8bc4\u8bba' }}
        </text>
      </view>
      <text class="panel-close" :style="textMutedStyle" @tap="emit('close')">{{ '\u5173\u95ed' }}</text>
    </view>

    <view class="panel-body">
      <view v-if="comments.length" class="comment-list">
        <view v-for="comment in comments" :key="comment.id" class="comment-item">
          <text class="comment-item__time" :style="accentStyle">{{ comment.timeLabel }}</text>
          <text class="comment-item__content" :style="textPrimaryStyle">{{ comment.content }}</text>
        </view>
      </view>
      <text v-else class="comment-empty" :style="textMutedStyle">
        {{ '\u53d1\u4e00\u6761\u7ed9\u672a\u6765\u518d\u6b21\u5237\u5230\u7684\u81ea\u5df1\u3002' }}
      </text>

      <view v-if="active" class="comment-editor">
        <input
          :value="draft"
          class="comment-input"
          :style="inputStyle"
          maxlength="40"
          :placeholder="commentPlaceholder"
          placeholder-style="color: #8e8e93;"
          confirm-type="send"
          :adjust-position="false"
          :cursor-spacing="20"
          @input="handleInput"
          @focus="handleInputFocus"
          @blur="handleInputBlur"
          @confirm="handleKeyboardSubmit"
        />
        <button
          type="button"
          class="comment-send"
          :style="primaryActionStyle"
          hover-class="comment-send--active"
          @touchstart.stop.prevent="handleSendPress"
          @tap.stop.prevent="handleSendTap"
        >
          <text class="comment-send__text">{{ '\u53d1\u9001' }}</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

const commentPlaceholder = '\u5199\u4e00\u53e5\u60f3\u5728\u4e0b\u6b21\u5237\u5230\u65f6\u770b\u5230\u7684\u8bdd'
const isInputFocused = ref(false)
const pendingSubmitAfterBlur = ref(false)

function handleInput(event: Event & { detail?: { value?: string } }) {
  emit('update:draft', event.detail?.value || '')
}

function handleInputFocus() {
  isInputFocused.value = true
  pendingSubmitAfterBlur.value = false
}

function handleInputBlur() {
  isInputFocused.value = false

  if (!pendingSubmitAfterBlur.value) {
    return
  }

  pendingSubmitAfterBlur.value = false
  setTimeout(() => {
    emitSubmit()
  }, 50)
}

function emitSubmit() {
  emit('submit')
}

function handleKeyboardSubmit() {
  pendingSubmitAfterBlur.value = false
  isInputFocused.value = false
  emitSubmit()
}

function handleSendPress() {
  if (isInputFocused.value) {
    pendingSubmitAfterBlur.value = true
    uni.hideKeyboard()
  }
}

function handleSendTap() {
  if (pendingSubmitAfterBlur.value) {
    return
  }

  emitSubmit()
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
  width: 100%;
  box-sizing: border-box;
}

.comment-input {
  flex: 1;
  width: 0;
  min-height: 84rpx;
  box-sizing: border-box;
  padding: 0 24rpx;
  border-radius: 22rpx;
  font-size: 26rpx;
}

.comment-send {
  display: inline-flex;
  width: 136rpx;
  min-height: 84rpx;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 22rpx;
  padding: 0;
  margin: 0;
  line-height: 1;
  border: 0;
}

.comment-send__text {
  color: #08110c;
  font-size: 24rpx;
  font-weight: 700;
}

.comment-send--active {
  opacity: 0.92;
}

.comment-send::after {
  border: 0;
}
</style>
