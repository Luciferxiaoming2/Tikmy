import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '../constants/storage'
import { getStorageItem, setStorageItem } from '../services/storage/kv'
import { DEFAULT_THEME_ID, applyThemeChrome } from '../theme/presets'
import type { UserSettings } from '../types/domain'

const defaultSettings: UserSettings = {
  passcode: '',
  useBiometrics: false,
  theme: DEFAULT_THEME_ID,
}

export const useUserStore = defineStore('user', () => {
  const storedSettings = getStorageItem<UserSettings>(STORAGE_KEYS.userSettings, defaultSettings)

  const isUnlocked = ref(false)
  const passcode = ref(storedSettings.passcode || '')
  const useBiometrics = ref(Boolean(storedSettings.useBiometrics))
  const theme = ref(storedSettings.theme || DEFAULT_THEME_ID)

  const settings = computed<UserSettings>(() => ({
    passcode: passcode.value,
    useBiometrics: useBiometrics.value,
    theme: theme.value,
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

  applyThemeChrome(theme.value)

  return {
    isUnlocked,
    passcode,
    useBiometrics,
    theme,
    settings,
    setUnlocked,
    setUseBiometrics,
    setTheme,
  }
})
