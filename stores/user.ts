import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '../constants/storage'
import { getStorageItem, setStorageItem } from '../services/storage/kv'
import { DEFAULT_THEME_ID, applyThemeChrome } from '../theme/presets'
import type { GestureSettings, PlaybackMode, UserSettings } from '../types/domain'

const defaultSettings: UserSettings = {
  passcode: '',
  useBiometrics: false,
  theme: DEFAULT_THEME_ID,
  playbackMode: 'sequential',
  likeWeight: 70,
  gestures: {
    doubleTapLike: true,
    longPressSpeed: true,
  },
}

export const useUserStore = defineStore('user', () => {
  const storedSettings = normalizeSettings(getStorageItem<UserSettings>(STORAGE_KEYS.userSettings, defaultSettings))

  const isUnlocked = ref(false)
  const passcode = ref(storedSettings.passcode || '')
  const useBiometrics = ref(Boolean(storedSettings.useBiometrics))
  const theme = ref(storedSettings.theme || DEFAULT_THEME_ID)
  const playbackMode = ref<PlaybackMode>(storedSettings.playbackMode)
  const likeWeight = ref(storedSettings.likeWeight)
  const gestures = ref<GestureSettings>(storedSettings.gestures)

  const settings = computed<UserSettings>(() => ({
    passcode: passcode.value,
    useBiometrics: useBiometrics.value,
    theme: theme.value,
    playbackMode: playbackMode.value,
    likeWeight: likeWeight.value,
    gestures: gestures.value,
  }))

  function persistSettings() {
    setStorageItem(STORAGE_KEYS.userSettings, settings.value)
  }

  function setUnlocked(value: boolean) {
    isUnlocked.value = value
  }

  function setUseBiometrics(value: boolean) {
    useBiometrics.value = value
    persistSettings()
  }

  function setTheme(value: UserSettings['theme']) {
    theme.value = value
    persistSettings()
    applyThemeChrome(value)
  }

  function setPlaybackMode(value: PlaybackMode) {
    playbackMode.value = value
    persistSettings()
  }

  function setLikeWeight(value: number) {
    likeWeight.value = Math.max(0, Math.min(100, Math.round(value)))
    persistSettings()
  }

  function setGestureSetting<K extends keyof GestureSettings>(key: K, value: GestureSettings[K]) {
    gestures.value = {
      ...gestures.value,
      [key]: value,
    }
    persistSettings()
  }

  applyThemeChrome(theme.value)

  return {
    isUnlocked,
    passcode,
    useBiometrics,
    theme,
    playbackMode,
    likeWeight,
    gestures,
    settings,
    setUnlocked,
    setUseBiometrics,
    setTheme,
    setPlaybackMode,
    setLikeWeight,
    setGestureSetting,
  }
})

function normalizeSettings(settings?: Partial<UserSettings> | null): UserSettings {
  return {
    passcode: settings?.passcode || '',
    useBiometrics: Boolean(settings?.useBiometrics),
    theme: settings?.theme || DEFAULT_THEME_ID,
    playbackMode: settings?.playbackMode === 'random' ? 'random' : 'sequential',
    likeWeight: normalizeLikeWeight(settings?.likeWeight),
    gestures: {
      doubleTapLike: settings?.gestures?.doubleTapLike ?? true,
      longPressSpeed: settings?.gestures?.longPressSpeed ?? true,
    },
  }
}

function normalizeLikeWeight(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return defaultSettings.likeWeight
  }

  return Math.max(0, Math.min(100, Math.round(value)))
}
