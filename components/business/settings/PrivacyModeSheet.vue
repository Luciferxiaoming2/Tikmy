<template>
  <view class="sheet-mask" @tap="emit('close')" />
  <view class="sheet-panel glass-panel" :style="sheetStyle">
    <view class="sheet-handle" />
    <view class="sheet-header">
      <view>
        <text class="sheet-title" :style="textPrimaryStyle">{{ '\u8bbe\u7f6e\u9690\u79c1\u5bc6\u7801' }}</text>
        <text class="sheet-copy" :style="textSecondaryStyle">
          {{ '\u5f00\u542f\u540e\uff0c\u518d\u6b21\u8fdb\u5165 MyTik \u6216\u5207\u5230\u540e\u53f0\u8fd4\u56de\u65f6\u90fd\u4f1a\u9700\u8981\u8f93\u5165\u5bc6\u7801\u3002' }}
        </text>
      </view>
      <text class="sheet-close" :style="textMutedStyle" @tap="emit('close')">{{ '\u5173\u95ed' }}</text>
    </view>

    <view class="sheet-body">
      <view class="sheet-field">
        <text class="sheet-label" :style="textSecondaryStyle">{{ '\u9690\u79c1\u5bc6\u7801' }}</text>
        <view class="sheet-input-wrap" :style="inputInlineStyle">
          <input
            :value="draft"
            class="sheet-input"
            type="number"
            :password="!showPassword"
            maxlength="6"
            :focus="focusDraft"
            :placeholder="draftPlaceholder"
            placeholder-style="color: #8e8e93;"
            :adjust-position="false"
            @input="emitDraft"
          />
          <view class="eye-toggle" @tap="emit('toggle-visibility')">
            <view class="eye-icon">
              <view class="eye-icon__pupil" />
              <view v-if="!showPassword" class="eye-icon__slash" />
            </view>
          </view>
        </view>
      </view>

      <view class="sheet-field">
        <text class="sheet-label" :style="textSecondaryStyle">{{ '\u786e\u8ba4\u5bc6\u7801' }}</text>
        <view class="sheet-input-wrap" :style="inputInlineStyle">
          <input
            :value="confirmDraft"
            class="sheet-input"
            type="number"
            :password="!showPassword"
            maxlength="6"
            :placeholder="confirmPlaceholder"
            placeholder-style="color: #8e8e93;"
            :adjust-position="false"
            @input="emitConfirmDraft"
            @confirm="emit('submit')"
          />
          <view class="eye-toggle" @tap="emit('toggle-visibility')">
            <view class="eye-icon">
              <view class="eye-icon__pupil" />
              <view v-if="!showPassword" class="eye-icon__slash" />
            </view>
          </view>
        </view>
      </view>

      <text v-if="errorMessage" class="sheet-error">{{ errorMessage }}</text>
    </view>

    <view class="sheet-footer">
      <view class="sheet-action sheet-action--ghost" :style="secondaryActionStyle" @tap="emit('close')">
        <text class="sheet-action__text" :style="textPrimaryStyle">{{ '\u53d6\u6d88' }}</text>
      </view>
      <view class="sheet-action" :style="primaryActionStyle" @tap="emit('submit')">
        <text class="sheet-action__text sheet-action__text--primary">{{ '\u4fdd\u5b58\u5e76\u5f00\u542f' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  draft: string
  confirmDraft: string
  errorMessage: string
  focusDraft: boolean
  showPassword: boolean
  sheetStyle: Record<string, string>
  inputInlineStyle: Record<string, string>
  textPrimaryStyle: Record<string, string>
  textSecondaryStyle: Record<string, string>
  textMutedStyle: Record<string, string>
  primaryActionStyle: Record<string, string>
  secondaryActionStyle: Record<string, string>
}>()

const emit = defineEmits<{
  (event: 'close'): void
  (event: 'submit'): void
  (event: 'update:draft', value: string): void
  (event: 'update:confirmDraft', value: string): void
  (event: 'toggle-visibility'): void
}>()

const draftPlaceholder = '\u8f93\u5165 6 \u4f4d\u6570\u5b57'
const confirmPlaceholder = '\u518d\u8f93\u5165\u4e00\u6b21'

function emitDraft(event: Event & { detail?: { value?: string } }) {
  emit('update:draft', event.detail?.value || '')
}

function emitConfirmDraft(event: Event & { detail?: { value?: string } }) {
  emit('update:confirmDraft', event.detail?.value || '')
}
</script>

<style scoped lang="scss">
.sheet-mask {
  position: fixed;
  inset: 0;
  background: rgba(8, 8, 8, 0.24);
  z-index: 39;
}

.sheet-panel {
  position: fixed;
  left: 24rpx;
  right: 24rpx;
  bottom: 32rpx;
  z-index: 40;
  border-radius: 36rpx;
  padding: 20rpx 28rpx 28rpx;
  box-sizing: border-box;
}

.sheet-handle {
  width: 110rpx;
  height: 8rpx;
  margin: 0 auto 24rpx;
  border-radius: 9999rpx;
  background: rgba(255, 255, 255, 0.2);
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.sheet-title {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
}

.sheet-copy {
  display: block;
  margin-top: 10rpx;
  font-size: 22rpx;
  line-height: 1.7;
}

.sheet-close {
  font-size: 22rpx;
}

.sheet-body {
  margin-top: 26rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.sheet-field {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.sheet-label {
  font-size: 22rpx;
}

.sheet-input-wrap {
  display: flex;
  align-items: center;
  gap: 14rpx;
  min-height: 86rpx;
  padding: 0 22rpx;
  box-sizing: border-box;
  border-radius: 22rpx;
}

.sheet-input {
  flex: 1;
  min-width: 0;
  height: 86rpx;
  font-size: 28rpx;
}

.sheet-error {
  color: #ff6b6b;
  font-size: 22rpx;
}

.eye-toggle {
  width: 44rpx;
  height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.eye-icon {
  position: relative;
  width: 34rpx;
  height: 22rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 9999rpx / 70%;
  box-sizing: border-box;
}

.eye-icon__pupil {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.82);
  transform: translate(-50%, -50%);
}

.eye-icon__slash {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 36rpx;
  height: 2rpx;
  background: rgba(255, 255, 255, 0.82);
  transform: translate(-50%, -50%) rotate(-28deg);
}

.sheet-footer {
  display: flex;
  gap: 14rpx;
  margin-top: 24rpx;
}

.sheet-action {
  flex: 1;
  min-height: 84rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999rpx;
}

.sheet-action__text {
  font-size: 24rpx;
  font-weight: 600;
}

.sheet-action__text--primary {
  color: #08110c;
  font-weight: 700;
}
</style>
