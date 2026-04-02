import type { ThemeId } from '../theme/presets'

export type PlaybackMode = 'sequential' | 'random'
export type PlaybackEndAction = 'next' | 'loop'

export interface GestureSettings {
  doubleTapLike: boolean
  longPressSpeed: boolean
}

export interface UserSettings {
  passcode: string
  useBiometrics: boolean
  theme: ThemeId
  playbackCategoryId: string
  playbackMode: PlaybackMode
  playbackEndAction: PlaybackEndAction
  likeWeight: number
  gestures: GestureSettings
}

export interface Category {
  id: string
  name: string
  coverPath: string
  videoCount: number
  createdAt: number
  updatedAt: number
}

export interface VideoAsset {
  id: string
  categoryId: string
  localPath: string
  posterPath: string
  videoHash: string
  duration: number
  width?: number
  height?: number
  importHint?: string
  isLiked: boolean
  isFavorite: boolean
  playCount: number
  totalWatchTime: number
  createdAt: number
  updatedAt: number
}

export interface CommentItem {
  id: string
  videoId: string
  content: string
  timestamp: number
  source: string
  createdAt: number
}

export interface BackupPayload {
  schemaVersion: number
  exportedAt: number
  userSettings: UserSettings
  categories: Category[]
  videos: VideoAsset[]
  comments: CommentItem[]
}
