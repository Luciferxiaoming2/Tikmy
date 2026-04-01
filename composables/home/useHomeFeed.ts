import { DEFAULT_CATEGORY_ID, FAVORITES_CATEGORY_ID } from '@/repositories/library'
import type { GestureSettings, PlaybackMode, VideoAsset } from '@/types/domain'

export function buildHomeFeed(source: VideoAsset[], categoryId: string, mode: PlaybackMode, weight: number) {
  const filteredSource = filterVideosByCategory(source, categoryId)
  return mode === 'random' ? buildRandomFeed(filteredSource, weight) : buildSequentialFeed(filteredSource)
}

export function getPlaybackModeLabel(mode: PlaybackMode) {
  return mode === 'random' ? '随机播放' : '顺序播放'
}

export function getGestureHint(gestures: GestureSettings) {
  const hints: string[] = []

  if (gestures.doubleTapLike) {
    hints.push('双击点赞')
  }

  if (gestures.longPressSpeed) {
    hints.push('长按 2 倍速')
  }

  if (!hints.length) {
    return '当前未启用快捷手势，可在设置页随时调整。'
  }

  return `当前支持${hints.join('、')}。`
}

export function formatDuration(duration: number) {
  const totalSeconds = Math.max(0, Math.round(duration))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function formatWatchTime(seconds: number) {
  if (seconds < 60) {
    return `${Math.round(seconds)} 秒`
  }

  return `${(seconds / 60).toFixed(1)} 分钟`
}

export function formatCommentTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const restSeconds = safeSeconds % 60

  return `${minutes}:${String(restSeconds).padStart(2, '0')}`
}

function buildSequentialFeed(source: VideoAsset[]) {
  return [...source].sort((left, right) => right.createdAt - left.createdAt)
}

function buildRandomFeed(source: VideoAsset[], weight: number) {
  return [...source].sort((left, right) => scoreVideo(right, weight) - scoreVideo(left, weight))
}

function scoreVideo(video: VideoAsset, weight: number) {
  const likedBoost = video.isLiked ? weight / 18 : 0
  const freshnessBoost = Math.max(0, 8 - video.playCount * 0.7)
  const watchBoost = Math.min(video.totalWatchTime / 12, 4)

  return Math.random() * 10 + likedBoost + freshnessBoost + watchBoost
}

function filterVideosByCategory(source: VideoAsset[], categoryId: string) {
  if (!categoryId || categoryId === DEFAULT_CATEGORY_ID) {
    return source
  }

  if (categoryId === FAVORITES_CATEGORY_ID) {
    return source.filter((video) => video.isFavorite)
  }

  return source.filter((video) => video.categoryId === categoryId)
}
