<template>
  <view class="privacy-lock" :style="pageInlineStyle">
    <view class="privacy-lock__panel" :style="panelInlineStyle">
      <text class="privacy-lock__eyebrow" :style="accentStyle">{{ '\u9690\u79c1\u6a21\u5f0f' }}</text>
      <text class="privacy-lock__title" :style="textPrimaryStyle">{{ '\u8f93\u5165\u9690\u79c1\u5bc6\u7801' }}</text>
      <text class="privacy-lock__copy" :style="textSecondaryStyle">
        {{ '\u5df2\u4e3a\u4f60\u81ea\u52a8\u9501\u5b9a MyTik\u3002\u8f93\u5165 6 \u4f4d\u5bc6\u7801\u540e\u7ee7\u7eed\u4f7f\u7528\u3002' }}
      </text>

      <view class="privacy-lock__dots">
        <view
          v-for="item in 6"
          :key="item"
          class="privacy-lock__dot"
          :style="item <= draft.length ? activeDotStyle : inactiveDotStyle"
        />
      </view>

      <input
        :value="draft"
        class="privacy-lock__input"
        :style="inputInlineStyle"
        type="number"
        :password="!showPassword"
        maxlength="6"
        :focus="true"
        :placeholder="placeholder"
        placeholder-style="color: #8e8e93;"
        :adjust-position="false"
        @input="handleInput"
        @confirm="emit('submit')"
      />
      <text class="privacy-lock__toggle" :style="textSecondaryStyle" @tap="emit('toggle-visibility')">
        {{ showPassword ? '\u9690\u85cf\u5bc6\u7801' : '\u663e\u793a\u5bc6\u7801' }}
      </text>

      <text v-if="errorMessage" class="privacy-lock__error">{{ errorMessage }}</text>

      <view class="privacy-lock__actions">
        <view class="privacy-lock__button" :style="primaryActionStyle" @tap="emit('submit')">
          <text class="privacy-lock__button-text">{{ '\u89e3\u9501' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
defineProps<{
  draft: string
  showPassword: boolean
  errorMessage: string
  pageInlineStyle: Record<string, string>
  panelInlineStyle: Record<string, string>
  inputInlineStyle: Record<string, string>
  textPrimaryStyle: Record<string, string>
  textSecondaryStyle: Record<string, string>
  accentStyle: Record<string, string>
  primaryActionStyle: Record<string, string>
  activeDotStyle: Record<string, string>
  inactiveDotStyle: Record<string, string>
}>()

const emit = defineEmits<{
  (event: 'update:draft', value: string): void
  (event: 'submit'): void
  (event: 'toggle-visibility'): void
}>()

const placeholder = '\u8f93\u5165 6 \u4f4d\u5bc6\u7801'

function handleInput(event: Event & { detail?: { value?: string } }) {
  emit('update:draft', event.detail?.value || '')
}
</script>

<style scoped lang="scss">
.privacy-lock {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
  box-sizing: border-box;
}

.privacy-lock__panel {
  width: 100%;
  max-width: 680rpx;
  padding: 40rpx 34rpx 36rpx;
  border-radius: 36rpx;
  box-sizing: border-box;
}

.privacy-lock__eyebrow {
  display: block;
  font-size: 24rpx;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.privacy-lock__title {
  display: block;
  margin-top: 14rpx;
  font-size: 44rpx;
  font-weight: 700;
}

.privacy-lock__copy {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.7;
}

.privacy-lock__dots {
  display: flex;
  justify-content: center;
  gap: 20rpx;
  margin-top: 34rpx;
}

.privacy-lock__dot {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
}

.privacy-lock__input {
  width: 100%;
  min-height: 88rpx;
  margin-top: 28rpx;
  padding: 0 24rpx;
  border-radius: 24rpx;
  box-sizing: border-box;
  font-size: 28rpx;
}

.privacy-lock__error {
  display: block;
  margin-top: 16rpx;
  color: #ff6b6b;
  font-size: 22rpx;
}

.privacy-lock__toggle {
  display: block;
  margin-top: 14rpx;
  font-size: 22rpx;
  text-align: right;
}

.privacy-lock__actions {
  margin-top: 28rpx;
}

.privacy-lock__button {
  min-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999rpx;
}

.privacy-lock__button-text {
  color: #08110c;
  font-size: 28rpx;
  font-weight: 700;
}
</style>
