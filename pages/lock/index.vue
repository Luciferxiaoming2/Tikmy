<template>
  <view :class="['lock-page', 'mt-page', themeClass]" :style="pageInlineStyle">
    <view class="lock-panel" :style="panelInlineStyle">
      <text class="lock-title" :style="textPrimaryStyle">{{ '\u8f93\u5165\u9690\u79c1\u5bc6\u7801' }}</text>
      <text class="lock-copy" :style="textSecondaryStyle">
        {{ '\u9690\u79c1\u6a21\u5f0f\u5df2\u5f00\u542f\uff0c\u8f93\u5165 6 \u4f4d\u5bc6\u7801\u540e\u7ee7\u7eed\u4f7f\u7528\u3002' }}
      </text>

      <view class="dot-row">
        <view
          v-for="item in 6"
          :key="item"
          class="dot"
          :style="item <= passcodeDraft.length ? activeDotStyle : inactiveDotStyle"
        />
      </view>

      <view class="lock-input-wrap" :style="inputInlineStyle">
        <input
          :value="passcodeDraft"
          class="lock-input"
          type="number"
          :password="!showPasscode"
          maxlength="6"
          :focus="true"
          :placeholder="placeholder"
          placeholder-style="color: #8e8e93;"
          :adjust-position="false"
          @input="handleInput"
          @confirm="handleUnlock"
        />
        <view class="eye-toggle" @tap="togglePasscodeVisibility">
          <view class="eye-icon">
            <view class="eye-icon__pupil" />
            <view v-if="!showPasscode" class="eye-icon__slash" />
          </view>
        </view>
      </view>

      <text v-if="errorMessage" class="lock-error">{{ errorMessage }}</text>

      <view class="lock-actions">
        <view class="lock-button" :style="primaryActionStyle" @tap="handleUnlock">
          <text class="lock-button__text">{{ '\u89e3\u9501' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { normalizePrivacyPasscode, validatePrivacyPasscode } from '@/services/privacy-mode'
import { useUserStore } from '@/stores/user'
import { getThemeOption } from '@/theme/presets'

const userStore = useUserStore()
const { passcode, theme } = storeToRefs(userStore)

const passcodeDraft = ref('')
const errorMessage = ref('')
const showPasscode = ref(false)
const placeholder = '\u8f93\u5165 6 \u4f4d\u5bc6\u7801'
const activeTheme = computed(() => getThemeOption(theme.value))
const themeClass = computed(() => `theme--${theme.value}`)
const pageInlineStyle = computed(() => ({
  background: activeTheme.value.pageBackground,
  color: activeTheme.value.textPrimary,
}))
const panelInlineStyle = computed(() => ({
  background: activeTheme.value.surface,
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
  boxShadow: activeTheme.value.shadowSoft,
  backdropFilter: 'blur(28px)',
}))
const inputInlineStyle = computed(() => ({
  background: activeTheme.value.surfaceHighest,
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
}))
const textPrimaryStyle = computed(() => ({ color: activeTheme.value.textPrimary }))
const textSecondaryStyle = computed(() => ({ color: activeTheme.value.textSecondary }))
const primaryActionStyle = computed(() => ({
  background: activeTheme.value.primary,
  border: `1rpx solid ${activeTheme.value.primary}`,
  boxShadow: activeTheme.value.shadowSoft,
}))
const activeDotStyle = computed(() => ({
  background: activeTheme.value.primary,
  boxShadow: activeTheme.value.shadowSoft,
}))
const inactiveDotStyle = computed(() => ({
  background: activeTheme.value.surfaceHighest,
}))

function handleInput(event: Event & { detail?: { value?: string } }) {
  passcodeDraft.value = normalizePrivacyPasscode(event.detail?.value || '')
  errorMessage.value = ''
}

function togglePasscodeVisibility() {
  showPasscode.value = !showPasscode.value
}

function handleUnlock() {
  const validationMessage = validatePrivacyPasscode(passcodeDraft.value)

  if (validationMessage) {
    errorMessage.value = validationMessage
    return
  }

  if (passcodeDraft.value !== passcode.value) {
    errorMessage.value = '\u9690\u79c1\u5bc6\u7801\u4e0d\u6b63\u786e'
    return
  }

  userStore.setUnlocked(true)
  passcodeDraft.value = ''
  errorMessage.value = ''
  uni.navigateBack({
    fail: () => {
      uni.switchTab({
        url: '/pages/home/index',
      })
    },
  })
}
</script>

<style scoped lang="scss">
.lock-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
  box-sizing: border-box;
}

.lock-panel {
  width: 100%;
  max-width: 680rpx;
  padding: 40rpx 34rpx 36rpx;
  border-radius: 36rpx;
  box-sizing: border-box;
}

.lock-title {
  display: block;
  font-size: 42rpx;
  font-weight: 700;
}

.lock-copy {
  display: block;
  margin-top: 14rpx;
  font-size: 24rpx;
  line-height: 1.7;
}

.dot-row {
  display: flex;
  justify-content: center;
  gap: 18rpx;
  margin-top: 34rpx;
}

.dot {
  width: 22rpx;
  height: 22rpx;
  border-radius: 50%;
}

.lock-input-wrap {
  display: flex;
  align-items: center;
  gap: 14rpx;
  min-height: 88rpx;
  margin-top: 28rpx;
  padding: 0 22rpx;
  border-radius: 24rpx;
  box-sizing: border-box;
}

.lock-input {
  flex: 1;
  min-width: 0;
  height: 88rpx;
  font-size: 28rpx;
  color: inherit;
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

.lock-error {
  display: block;
  margin-top: 16rpx;
  color: #ff6b6b;
  font-size: 22rpx;
}

.lock-actions {
  margin-top: 28rpx;
}

.lock-button {
  min-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999rpx;
}

.lock-button__text {
  color: #08110c;
  font-size: 28rpx;
  font-weight: 700;
}
</style>
