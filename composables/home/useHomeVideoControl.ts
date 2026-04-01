export interface VideoPlaybackTarget {
  domId: string
  videoId: string
}

export function videoDomId(id: string) {
  return `home-video-${id}`
}

export function syncVideoPlayback(targets: VideoPlaybackTarget[], activeId: string) {
  let activeTarget: VideoPlaybackTarget | null = null

  targets.forEach((target) => {
    const context = uni.createVideoContext(target.domId)
    context.pause()
    context.playbackRate(1)

    if (target.videoId === activeId) {
      activeTarget = target
    }
  })

  if (!activeTarget) {
    return
  }

  setTimeout(() => {
    const context = uni.createVideoContext(activeTarget!.domId)
    try {
      context.seek(0)
      context.playbackRate(1)
      context.play()
    } catch {
      // ignore transient play/pause race from the webview layer
    }
  }, 0)
}

export function toggleVideoPlayback(domId: string, paused: boolean) {
  const context = uni.createVideoContext(domId)

  if (paused) {
    context.play()
    return false
  }

  context.pause()
  return true
}

export function setVideoPlaybackRate(domId: string, rate: number) {
  uni.createVideoContext(domId).playbackRate(rate)
}

export function playVideoFromStart(domId: string) {
  const context = uni.createVideoContext(domId)
  context.seek(0)
  context.playbackRate(1)
  context.play()
}

export function requestVideoFullscreen(domId: string) {
  const context = uni.createVideoContext(domId)
  context.requestFullScreen({
    direction: 90,
  })
}

export function seekVideoToTime(domId: string, time: number) {
  const context = uni.createVideoContext(domId)
  context.seek(Math.max(0, time))
  context.playbackRate(1)
  context.play()
}

export function pauseAllVideos(targets: VideoPlaybackTarget[]) {
  targets.forEach((target) => {
    const context = uni.createVideoContext(target.domId)
    context.pause()
    context.playbackRate(1)
  })
}
