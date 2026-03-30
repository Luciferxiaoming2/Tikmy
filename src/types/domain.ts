export interface UserSettings {
  passcode: string
  useBiometrics: boolean
  theme: 'dark'
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
  isLiked: boolean
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
