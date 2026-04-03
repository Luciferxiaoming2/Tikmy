import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '../constants/storage'
import { DEFAULT_CATEGORY_ID } from '../repositories/library'
import { getStorageItem, setStorageItem } from '../services/storage/kv'
import { DEFAULT_THEME_ID, applyThemeChrome } from '../theme/presets'
import type { GestureSettings, PlaybackEndAction, PlaybackMode, UserSettings } from '../types/domain'

const defaultSettings: UserSettings = {
  passcode: '',
  useBiometrics: false,
  theme: DEFAULT_THEME_ID,
  playbackCategoryId: DEFAULT_CATEGORY_ID,
  playbackMode: 'sequential',
  playbackEndAction: 'next',
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
  const playbackCategoryId = ref(storedSettings.playbackCategoryId)
  const playbackMode = ref<PlaybackMode>(storedSettings.playbackMode)
  const playbackEndAction = ref<PlaybackEndAction>(storedSettings.playbackEndAction)
  const likeWeight = ref(storedSettings.likeWeight)
  const gestures = ref<GestureSettings>(storedSettings.gestures)

  const settings = computed<UserSettings>(() => ({
    passcode: passcode.value,
    useBiometrics: useBiometrics.value,
    theme: theme.value,
    playbackCategoryId: playbackCategoryId.value,
    playbackMode: playbackMode.value,
    playbackEndAction: playbackEndAction.value,
    likeWeight: likeWeight.value,
    gestures: gestures.value,
  }))

  function persistSettings() {
    setStorageItem(STORAGE_KEYS.userSettings, settings.value)
  }

  function setUnlocked(value: boolean) {
    isUnlocked.value = value
  }

  function setPasscode(value: string) {
    passcode.value = value
    persistSettings()
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

  function setPlaybackEndAction(value: PlaybackEndAction) {
    playbackEndAction.value = value
    persistSettings()
  }

  function setPlaybackCategory(value: string) {
    playbackCategoryId.value = value || DEFAULT_CATEGORY_ID
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

  function replaceSettings(nextSettings: Partial<UserSettings> | null | undefined) {
    const normalized = normalizeSettings(nextSettings)

    passcode.value = normalized.passcode
    useBiometrics.value = normalized.useBiometrics
    theme.value = normalized.theme
    playbackCategoryId.value = normalized.playbackCategoryId
    playbackMode.value = normalized.playbackMode
    playbackEndAction.value = normalized.playbackEndAction
    likeWeight.value = normalized.likeWeight
    gestures.value = normalized.gestures
    persistSettings()
    applyThemeChrome(normalized.theme)
  }

  applyThemeChrome(theme.value)

  return {
    isUnlocked,
    passcode,
    useBiometrics,
    theme,
    playbackCategoryId,
    playbackMode,
    playbackEndAction,
    likeWeight,
    gestures,
    settings,
    setUnlocked,
    setPasscode,
    setUseBiometrics,
    setTheme,
    setPlaybackCategory,
    setPlaybackMode,
    setPlaybackEndAction,
    setLikeWeight,
    setGestureSetting,
    replaceSettings,
  }
})

function normalizeSettings(settings?: Partial<UserSettings> | null): UserSettings {
  return {
    passcode: settings?.passcode || '',
    useBiometrics: Boolean(settings?.useBiometrics),
    theme: settings?.theme || DEFAULT_THEME_ID,
    playbackCategoryId: settings?.playbackCategoryId || DEFAULT_CATEGORY_ID,
    playbackMode: settings?.playbackMode === 'random' ? 'random' : 'sequential',
    playbackEndAction: settings?.playbackEndAction === 'loop' ? 'loop' : 'next',
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
