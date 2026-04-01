import type { VideoAsset } from '@/types/domain'

export function videoDomId(videoId: string) {
  return `home-video-${videoId}`
}

export function syncVideoPlayback(videos: VideoAsset[], activeId: string) {
  videos.forEach((video) => {
    const context = uni.createVideoContext(videoDomId(video.id))

    if (video.id === activeId) {
      context.seek(0)
      context.playbackRate(1)
      context.play()
      return
    }

    context.pause()
    context.playbackRate(1)
  })
}

export function toggleVideoPlayback(videoId: string, paused: boolean) {
  const context = uni.createVideoContext(videoDomId(videoId))

  if (paused) {
    context.play()
    return false
  }

  context.pause()
  return true
}

export function setVideoPlaybackRate(videoId: string, rate: number) {
  uni.createVideoContext(videoDomId(videoId)).playbackRate(rate)
}

export function playVideoFromStart(videoId: string) {
  const context = uni.createVideoContext(videoDomId(videoId))
  context.seek(0)
  context.playbackRate(1)
  context.play()
}

export function requestVideoFullscreen(videoId: string) {
  const context = uni.createVideoContext(videoDomId(videoId))
  context.requestFullScreen({
    direction: 90,
  })
}

export function pauseAllVideos(videos: VideoAsset[]) {
  videos.forEach((video) => {
    const context = uni.createVideoContext(videoDomId(video.id))
    context.pause()
    context.playbackRate(1)
  })
}
