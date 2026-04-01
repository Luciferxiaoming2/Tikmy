export type ThemeId = 'dark-glass' | 'forest-luxe' | 'cyber-neon' | 'paper-mist'

export interface ThemeOption {
  id: ThemeId
  name: string
  description: string
  preview: [string, string, string]
  cssVars: Record<string, string>
  pageBackground: string
  homeBackground: string
  surface: string
  themeOptionBackground: string
  textPrimary: string
  textSecondary: string
  textMuted: string
  primary: string
  borderSubtle: string
  shadowSoft: string
  surfaceHighest: string
  tabBar: {
    color: string
    selectedColor: string
    backgroundColor: string
    borderStyle: 'black' | 'white'
  }
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'dark-glass',
    name: 'Dark Glass',
    description: '深色玻璃质感，适合沉浸式主界面。',
    preview: ['#56E472', '#131313', '#2A2A2A'],
    pageBackground:
      'radial-gradient(circle at top, rgba(86, 228, 114, 0.08), transparent 28%), linear-gradient(180deg, #101010 0%, #050505 100%)',
    homeBackground:
      'radial-gradient(circle at center, rgba(86, 228, 114, 0.14), transparent 30%), linear-gradient(180deg, #090909 0%, #000000 100%)',
    surface: 'rgba(42, 42, 42, 0.6)',
    themeOptionBackground: 'rgba(42, 42, 42, 0.72)',
    textPrimary: '#ffffff',
    textSecondary: '#bccbb8',
    textMuted: '#8e8e93',
    primary: '#56e472',
    borderSubtle: 'rgba(255, 255, 255, 0.08)',
    shadowSoft: '0 24rpx 80rpx rgba(0, 0, 0, 0.18)',
    surfaceHighest: '#353534',
    cssVars: {
      '--mt-background': '#131313',
      '--mt-surface-low': '#1c1b1b',
      '--mt-surface-high': '#2a2a2a',
      '--mt-surface-highest': '#353534',
      '--mt-primary': '#56e472',
      '--mt-primary-strong': '#34c759',
      '--mt-danger': '#ff5e57',
      '--mt-text-primary': '#ffffff',
      '--mt-text-secondary': '#bccbb8',
      '--mt-text-muted': '#8e8e93',
      '--mt-page-background':
        'radial-gradient(circle at top, rgba(86, 228, 114, 0.08), transparent 28%), linear-gradient(180deg, #101010 0%, #050505 100%)',
      '--mt-home-background':
        'radial-gradient(circle at center, rgba(86, 228, 114, 0.14), transparent 30%), linear-gradient(180deg, #090909 0%, #000000 100%)',
      '--mt-glass-surface': 'rgba(42, 42, 42, 0.6)',
      '--mt-theme-option-background': 'rgba(42, 42, 42, 0.72)',
    },
    tabBar: {
      color: '#8E8E93',
      selectedColor: '#56E472',
      backgroundColor: '#131313',
      borderStyle: 'black',
    },
  },
  {
    id: 'forest-luxe',
    name: 'Forest Luxe',
    description: '墨绿和金色点缀，偏克制的高级感。',
    preview: ['#D7B56D', '#102019', '#264238'],
    pageBackground:
      'radial-gradient(circle at top, rgba(215, 181, 109, 0.16), transparent 26%), linear-gradient(180deg, #13241d 0%, #09110d 100%)',
    homeBackground:
      'radial-gradient(circle at center, rgba(215, 181, 109, 0.2), transparent 30%), linear-gradient(180deg, #13241d 0%, #060b08 100%)',
    surface: 'rgba(30, 53, 44, 0.72)',
    themeOptionBackground: 'rgba(30, 53, 44, 0.82)',
    textPrimary: '#f7f4ee',
    textSecondary: '#bfd3c7',
    textMuted: '#89a494',
    primary: '#d7b56d',
    borderSubtle: 'rgba(242, 206, 131, 0.16)',
    shadowSoft: '0 24rpx 80rpx rgba(0, 0, 0, 0.18)',
    surfaceHighest: '#264238',
    cssVars: {
      '--mt-background': '#102019',
      '--mt-surface-low': '#152920',
      '--mt-surface-high': '#1e352c',
      '--mt-surface-highest': '#264238',
      '--mt-primary': '#d7b56d',
      '--mt-primary-strong': '#f2ce83',
      '--mt-danger': '#ff8178',
      '--mt-text-primary': '#f7f4ee',
      '--mt-text-secondary': '#bfd3c7',
      '--mt-text-muted': '#89a494',
      '--mt-page-background':
        'radial-gradient(circle at top, rgba(215, 181, 109, 0.16), transparent 26%), linear-gradient(180deg, #13241d 0%, #09110d 100%)',
      '--mt-home-background':
        'radial-gradient(circle at center, rgba(215, 181, 109, 0.2), transparent 30%), linear-gradient(180deg, #13241d 0%, #060b08 100%)',
      '--mt-glass-surface': 'rgba(30, 53, 44, 0.72)',
      '--mt-border-subtle': 'rgba(242, 206, 131, 0.16)',
      '--mt-theme-option-background': 'rgba(30, 53, 44, 0.82)',
    },
    tabBar: {
      color: '#9CB6A8',
      selectedColor: '#D7B56D',
      backgroundColor: '#102019',
      borderStyle: 'black',
    },
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    description: '高对比霓虹氛围，更强调未来感和视觉冲击。',
    preview: ['#62F3FF', '#11091A', '#31214B'],
    pageBackground:
      'radial-gradient(circle at top, rgba(98, 243, 255, 0.15), transparent 24%), radial-gradient(circle at bottom right, rgba(154, 108, 255, 0.16), transparent 26%), linear-gradient(180deg, #13071d 0%, #08040d 100%)',
    homeBackground:
      'radial-gradient(circle at center, rgba(98, 243, 255, 0.24), transparent 26%), linear-gradient(180deg, #14091f 0%, #050208 100%)',
    surface: 'rgba(38, 22, 59, 0.7)',
    themeOptionBackground: 'rgba(38, 22, 59, 0.82)',
    textPrimary: '#f5f2ff',
    textSecondary: '#c0b7df',
    textMuted: '#9289b4',
    primary: '#62f3ff',
    borderSubtle: 'rgba(98, 243, 255, 0.16)',
    shadowSoft: '0 24rpx 80rpx rgba(0, 0, 0, 0.18)',
    surfaceHighest: '#31214b',
    cssVars: {
      '--mt-background': '#11091a',
      '--mt-surface-low': '#1d102b',
      '--mt-surface-high': '#26163b',
      '--mt-surface-highest': '#31214b',
      '--mt-primary': '#62f3ff',
      '--mt-primary-strong': '#9a6cff',
      '--mt-danger': '#ff668a',
      '--mt-text-primary': '#f5f2ff',
      '--mt-text-secondary': '#c0b7df',
      '--mt-text-muted': '#9289b4',
      '--mt-page-background':
        'radial-gradient(circle at top, rgba(98, 243, 255, 0.15), transparent 24%), radial-gradient(circle at bottom right, rgba(154, 108, 255, 0.16), transparent 26%), linear-gradient(180deg, #13071d 0%, #08040d 100%)',
      '--mt-home-background':
        'radial-gradient(circle at center, rgba(98, 243, 255, 0.24), transparent 26%), linear-gradient(180deg, #14091f 0%, #050208 100%)',
      '--mt-glass-surface': 'rgba(38, 22, 59, 0.7)',
      '--mt-border-subtle': 'rgba(98, 243, 255, 0.16)',
      '--mt-theme-option-background': 'rgba(38, 22, 59, 0.82)',
    },
    tabBar: {
      color: '#A8A0C8',
      selectedColor: '#62F3FF',
      backgroundColor: '#11091A',
      borderStyle: 'black',
    },
  },
  {
    id: 'paper-mist',
    name: 'Paper Mist',
    description: '浅色雾面主题，更适合设置和资料管理。',
    preview: ['#3E6AE1', '#F4EFE6', '#FFFFFF'],
    pageBackground:
      'radial-gradient(circle at top, rgba(62, 106, 225, 0.1), transparent 28%), linear-gradient(180deg, #f8f4ec 0%, #efe7dc 100%)',
    homeBackground:
      'radial-gradient(circle at center, rgba(62, 106, 225, 0.14), transparent 28%), linear-gradient(180deg, #faf7f1 0%, #ebe3d7 100%)',
    surface: 'rgba(255, 255, 255, 0.74)',
    themeOptionBackground: 'rgba(255, 255, 255, 0.9)',
    textPrimary: '#1f2430',
    textSecondary: '#5f6773',
    textMuted: '#8c919b',
    primary: '#3e6ae1',
    borderSubtle: 'rgba(31, 36, 48, 0.08)',
    shadowSoft: '0 24rpx 80rpx rgba(31, 36, 48, 0.08)',
    surfaceHighest: '#f6f1e8',
    cssVars: {
      '--mt-background': '#f4efe6',
      '--mt-surface-low': '#ebe3d7',
      '--mt-surface-high': '#ffffff',
      '--mt-surface-highest': '#f6f1e8',
      '--mt-primary': '#3e6ae1',
      '--mt-primary-strong': '#2146b9',
      '--mt-danger': '#d74d52',
      '--mt-text-primary': '#1f2430',
      '--mt-text-secondary': '#5f6773',
      '--mt-text-muted': '#8c919b',
      '--mt-page-background':
        'radial-gradient(circle at top, rgba(62, 106, 225, 0.1), transparent 28%), linear-gradient(180deg, #f8f4ec 0%, #efe7dc 100%)',
      '--mt-home-background':
        'radial-gradient(circle at center, rgba(62, 106, 225, 0.14), transparent 28%), linear-gradient(180deg, #faf7f1 0%, #ebe3d7 100%)',
      '--mt-glass-surface': 'rgba(255, 255, 255, 0.74)',
      '--mt-border-subtle': 'rgba(31, 36, 48, 0.08)',
      '--mt-shadow-soft': '0 24rpx 80rpx rgba(31, 36, 48, 0.08)',
      '--mt-theme-option-background': 'rgba(255, 255, 255, 0.9)',
    },
    tabBar: {
      color: '#7A7A7A',
      selectedColor: '#3E6AE1',
      backgroundColor: '#F4EFE6',
      borderStyle: 'white',
    },
  },
]

export const DEFAULT_THEME_ID: ThemeId = 'dark-glass'

export function getThemeOption(themeId: ThemeId) {
  return THEME_OPTIONS.find((option) => option.id === themeId) ?? THEME_OPTIONS[0]
}

export function applyThemeChrome(themeId: ThemeId) {
  const option = getThemeOption(themeId)

  if (typeof uni.setTabBarStyle === 'function') {
    uni.setTabBarStyle({
      color: option.tabBar.color,
      selectedColor: option.tabBar.selectedColor,
      backgroundColor: option.tabBar.backgroundColor,
      borderStyle: option.tabBar.borderStyle,
    })
  }

  if (typeof uni.setBackgroundColor === 'function') {
    uni.setBackgroundColor({
      backgroundColor: option.tabBar.backgroundColor,
      backgroundColorTop: option.tabBar.backgroundColor,
      backgroundColorBottom: option.tabBar.backgroundColor,
    })
  }
}
