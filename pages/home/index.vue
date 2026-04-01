<template>
  <view :class="['home-page', 'mt-page', themeClass]" :style="homeInlineStyle">
    <HomeEmptyState
      v-if="!feedVideos.length"
      :panel-style="panelInlineStyle"
      :accent-style="accentStyle"
      :text-primary-style="textPrimaryStyle"
      :text-secondary-style="textSecondaryStyle"
      :primary-action-style="primaryActionStyle"
      @go-library="goToLibrary"
    />

    <swiper
      v-else
      class="video-swiper"
      vertical
      :current="playerStore.currentIndex"
      @change="handleSwiperChange"
    >
      <swiper-item v-for="video in feedVideos" :key="video.id" class="video-slide">
        <view
          class="video-stage"
          @tap="handleStageTap(video.id)"
          @longpress="handleStageLongPress(video.id)"
          @touchend="handleStageTouchEnd(video.id)"
        >
          <video
            :id="videoDomId(video.id)"
            class="video-player"
            :src="video.localPath"
            :poster="video.posterPath || undefined"
            :show-center-play-btn="false"
            :show-play-btn="false"
            :controls="false"
            :loop="false"
            :muted="false"
            :autoplay="video.id === activeVideoId && !isActiveVideoPaused"
            object-fit="contain"
            @timeupdate="handleTimeUpdate(video.id, $event)"
            @play="handleVideoPlay(video.id)"
            @ended="handleVideoEnded(video.id)"
            @error="handleVideoError(video)"
          />

          <view class="video-scrim" />

          <view class="video-topbar">
            <text class="video-topbar__tag" :style="accentStyle">Private Home</text>
            <text class="video-topbar__meta" :style="textMutedStyle">
              {{ playbackCategoryLabel }} · {{ playbackModeLabel }} · {{ activeIndexLabel(video.id) }}
            </text>
          </view>

          <HomeActionRail
            :liked="video.isLiked"
            :play-count="video.playCount"
            :comment-count="commentsForVideo(video.id).length"
            :panel-style="sideButtonStyle"
            :text-primary-style="textPrimaryStyle"
            @toggle-like="toggleLike(video.id)"
            @open-info="openSheet('info')"
            @open-comments="openSheet('comments')"
          />

          <view
            v-if="video.id === activeVideoId && shouldShowFullscreenButton(video)"
            class="fullscreen-trigger glass-panel"
            :style="panelInlineStyle"
            @tap.stop="handleFullscreen(video.id)"
          >
            <text class="fullscreen-trigger__icon">⤢</text>
            <text class="fullscreen-trigger__text" :style="textPrimaryStyle">全屏观看</text>
          </view>

          <view
            v-if="video.id === activeVideoId && isActiveVideoPaused"
            class="pause-indicator glass-panel"
            :style="panelInlineStyle"
          >
            <text class="pause-indicator__icon">II</text>
            <text class="pause-indicator__label" :style="textPrimaryStyle">已暂停</text>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <view v-if="activeSheet !== 'none'" class="sheet-mask" @tap="closeSheet" />
    <view v-if="activeSheet !== 'none' && activeVideo" class="sheet-host">
      <HomeInfoPanel
        v-if="activeSheet === 'info'"
        :category-name="categoryNameFor(activeVideo.categoryId)"
        :stats-text="infoStatsText"
        :hint="gestureHint"
        :panel-style="summaryStyle"
        :text-primary-style="textPrimaryStyle"
        :text-secondary-style="textSecondaryStyle"
        :text-muted-style="textMutedStyle"
        @close="closeSheet"
      />

      <HomeCommentPanel
        v-else
        :active="Boolean(activeVideoId)"
        :draft="commentDraft"
        :comments="commentPreviewFor(activeVideo.id)"
        :panel-style="summaryStyle"
        :text-primary-style="textPrimaryStyle"
        :text-secondary-style="textSecondaryStyle"
        :text-muted-style="textMutedStyle"
        :accent-style="accentStyle"
        :input-style="inputInlineStyle"
        :primary-action-style="primaryActionStyle"
        @close="closeSheet"
        @submit="submitComment"
        @update:draft="commentDraft = $event"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { onHide, onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import HomeActionRail from '@/components/business/home/HomeActionRail.vue'
import HomeCommentPanel from '@/components/business/home/HomeCommentPanel.vue'
import HomeEmptyState from '@/components/business/home/HomeEmptyState.vue'
import HomeInfoPanel from '@/components/business/home/HomeInfoPanel.vue'
import {
  buildHomeFeed,
  formatCommentTime,
  formatDuration,
  formatWatchTime,
  getGestureHint,
  getPlaybackModeLabel,
} from '@/composables/home/useHomeFeed'
import {
  playVideoFromStart,
  pauseAllVideos,
  requestVideoFullscreen,
  setVideoPlaybackRate,
  syncVideoPlayback,
  toggleVideoPlayback,
  videoDomId,
} from '@/composables/home/useHomeVideoControl'
import { useCommentStore } from '@/stores/comments'
import { useLibraryStore } from '@/stores/library'
import { usePlayerStore } from '@/stores/player'
import { useUserStore } from '@/stores/user'
import { getThemeOption } from '@/theme/presets'
import type { VideoAsset } from '@/types/domain'

const userStore = useUserStore()
const libraryStore = useLibraryStore()
const playerStore = usePlayerStore()
const commentStore = useCommentStore()

const { gestures, likeWeight, playbackCategoryId, playbackMode, theme } = storeToRefs(userStore)
const { categories, videos } = storeToRefs(libraryStore)
const { activeVideoId } = storeToRefs(playerStore)

const commentDraft = ref('')
const watchProgress = ref<Record<string, number>>({})
const playedVideoIds = ref<string[]>([])
const feedVideos = ref<VideoAsset[]>([])
const lastTapState = ref<{ videoId: string; time: number } | null>(null)
const pendingSingleTapTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const speedBoostVideoId = ref('')
const activeSheet = ref<'none' | 'info' | 'comments'>('none')
const isActiveVideoPaused = ref(false)
const isPageVisible = ref(false)
const compatibilityPromptedVideoIds = ref<string[]>([])

const activeTheme = computed(() => getThemeOption(theme.value))
const themeClass = computed(() => `theme--${theme.value}`)
const playbackModeLabel = computed(() => getPlaybackModeLabel(playbackMode.value))
const playbackCategoryLabel = computed(
  () => categories.value.find((category) => category.id === playbackCategoryId.value)?.name || '全部',
)
const gestureHint = computed(() => getGestureHint(gestures.value))
const homeInlineStyle = computed(() => ({
  background: activeTheme.value.homeBackground,
  color: activeTheme.value.textPrimary,
}))
const panelInlineStyle = computed(() => ({
  background: activeTheme.value.surface,
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
  boxShadow: activeTheme.value.shadowSoft,
  backdropFilter: 'blur(20px)',
}))
const summaryStyle = computed(() => ({
  background: activeTheme.value.surface,
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
  boxShadow: activeTheme.value.shadowSoft,
  backdropFilter: 'blur(20px)',
}))
const inputInlineStyle = computed(() => ({
  color: activeTheme.value.textPrimary,
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
  background: activeTheme.value.themeOptionBackground,
}))
const sideButtonStyle = computed(() => ({
  background: activeTheme.value.surface,
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
  boxShadow: activeTheme.value.shadowSoft,
  backdropFilter: 'blur(20px)',
}))
const textPrimaryStyle = computed(() => ({ color: activeTheme.value.textPrimary }))
const textSecondaryStyle = computed(() => ({ color: activeTheme.value.textSecondary }))
const textMutedStyle = computed(() => ({ color: activeTheme.value.textMuted }))
const accentStyle = computed(() => ({ color: activeTheme.value.primary }))
const primaryActionStyle = computed(() => ({
  background: activeTheme.value.primary,
  border: `1rpx solid ${activeTheme.value.primary}`,
}))
const activeVideo = computed(() => feedVideos.value.find((video) => video.id === activeVideoId.value) || null)
const infoStatsText = computed(() => {
  if (!activeVideo.value) {
    return ''
  }

  return `时长 ${formatDuration(activeVideo.value.duration)} · 已观看 ${formatWatchTime(activeVideo.value.totalWatchTime)} · 播放 ${activeVideo.value.playCount} 次`
})
const feedSignature = computed(() =>
  videos.value
    .map((video) => `${video.id}:${video.categoryId}:${video.isLiked ? 1 : 0}:${video.playCount}:${video.createdAt}`)
    .join('|'),
)

watch(
  [feedSignature, playbackCategoryId, playbackMode, likeWeight],
  () => {
    feedVideos.value = buildHomeFeed(videos.value, playbackCategoryId.value, playbackMode.value, likeWeight.value)
  },
  {
    immediate: true,
  },
)

watch(
  categories,
  (nextCategories) => {
    if (!nextCategories.some((category) => category.id === playbackCategoryId.value)) {
      userStore.setPlaybackCategory(nextCategories[0]?.id || '')
    }
  },
  {
    immediate: true,
  },
)

watch(
  feedVideos,
  (nextVideos) => {
    if (!isPageVisible.value || !nextVideos.length) {
      return
    }

    const currentVideo =
      nextVideos.find((video) => video.id === playerStore.activeVideoId) ||
      nextVideos[playerStore.currentIndex] ||
      nextVideos[0]

    const nextIndex = nextVideos.findIndex((video) => video.id === currentVideo.id)
    activateVideo(currentVideo.id, nextIndex >= 0 ? nextIndex : 0)
  },
  {
    immediate: true,
  },
)

watch(
  () => playerStore.activeVideoId,
  async (videoId) => {
    if (!videoId || !isPageVisible.value) {
      return
    }

    await nextTick()
    syncVideoPlayback(feedVideos.value, videoId)
    isActiveVideoPaused.value = false
  },
)

onShow(() => {
  isPageVisible.value = true

  if (!feedVideos.value.length) {
    return
  }

  const currentVideo =
    feedVideos.value.find((video) => video.id === playerStore.activeVideoId) ||
    feedVideos.value[playerStore.currentIndex] ||
    feedVideos.value[0]

  if (!currentVideo) {
    return
  }

  const nextIndex = feedVideos.value.findIndex((video) => video.id === currentVideo.id)
  activateVideo(currentVideo.id, nextIndex >= 0 ? nextIndex : 0)
})

onHide(() => {
  isPageVisible.value = false
  clearPendingSingleTap()
  speedBoostVideoId.value = ''
  activeSheet.value = 'none'
  pauseAllVideos(feedVideos.value)
})

function activateVideo(videoId: string, index: number) {
  playerStore.setActiveVideo(videoId, index)
  watchProgress.value = {
    ...watchProgress.value,
    [videoId]: 0,
  }
  isActiveVideoPaused.value = false
  activeSheet.value = 'none'
  clearPendingSingleTap()
  speedBoostVideoId.value = ''
  commentDraft.value = ''

  if (!playedVideoIds.value.includes(videoId)) {
    playedVideoIds.value = [...playedVideoIds.value, videoId]
    libraryStore.incrementPlayCount(videoId)
  }
}

function handleSwiperChange(event: { detail?: { current?: number } }) {
  const nextIndex = Number(event.detail?.current || 0)
  const video = feedVideos.value[nextIndex]

  if (!video) {
    return
  }

  activateVideo(video.id, nextIndex)
}

function handleVideoPlay(videoId: string) {
  const index = feedVideos.value.findIndex((video) => video.id === videoId)

  if (index >= 0) {
    playerStore.setActiveVideo(videoId, index)
    isActiveVideoPaused.value = false
  }
}

function handleVideoEnded(videoId: string) {
  if (videoId !== activeVideoId.value || !feedVideos.value.length) {
    return
  }

  if (playbackMode.value === 'random') {
    const nextIndex = getRandomNextIndex()
    const nextVideo = feedVideos.value[nextIndex]

    if (!nextVideo) {
      return
    }

    activateVideo(nextVideo.id, nextIndex)
    if (nextVideo.id === videoId) {
      playVideoFromStart(videoId)
    }
    return
  }

  const currentIndex = feedVideos.value.findIndex((video) => video.id === videoId)
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % feedVideos.value.length : 0
  const nextVideo = feedVideos.value[nextIndex]

  if (!nextVideo) {
    return
  }

  activateVideo(nextVideo.id, nextIndex)
  if (nextVideo.id === videoId) {
    playVideoFromStart(videoId)
  }
}

function handleVideoError(video: VideoAsset) {
  if (compatibilityPromptedVideoIds.value.includes(video.id)) {
    return
  }

  compatibilityPromptedVideoIds.value = [...compatibilityPromptedVideoIds.value, video.id]

  uni.showModal({
    title: '播放兼容性提示',
    content:
      video.importHint ||
      '当前视频可能是微信小程序不完全支持的编码格式。若播放时只有声音没有画面，建议转为 H.264 编码的 MP4 后重新导入。',
    showCancel: false,
  })
}

function handleTimeUpdate(
  videoId: string,
  event: Event & {
    detail?: {
      currentTime?: number
    }
  },
) {
  if (videoId !== activeVideoId.value) {
    return
  }

  const currentTime = Number(event.detail?.currentTime || 0)
  const previousTime = watchProgress.value[videoId] || 0
  const delta = currentTime - previousTime

  if (delta > 0 && delta <= 2) {
    libraryStore.addWatchTime(videoId, delta)
  }

  watchProgress.value = {
    ...watchProgress.value,
    [videoId]: currentTime,
  }
  playerStore.setCurrentTime(currentTime)
}

function handleStageTap(videoId: string) {
  if (videoId !== activeVideoId.value) {
    return
  }

  if (!gestures.value.doubleTapLike) {
    togglePause(videoId)
    return
  }

  const now = Date.now()
  const lastTap = lastTapState.value

  if (lastTap && lastTap.videoId === videoId && now - lastTap.time < 260) {
    clearPendingSingleTap()
    lastTapState.value = null
    toggleLike(videoId)
    return
  }

  lastTapState.value = { videoId, time: now }
  clearPendingSingleTap()
  pendingSingleTapTimer.value = setTimeout(() => {
    togglePause(videoId)
    lastTapState.value = null
    pendingSingleTapTimer.value = null
  }, 260)
}

function handleStageLongPress(videoId: string) {
  if (!gestures.value.longPressSpeed || videoId !== activeVideoId.value || isActiveVideoPaused.value) {
    return
  }

  speedBoostVideoId.value = videoId

  try {
    setVideoPlaybackRate(videoId, 2)
  } catch (error) {
    console.warn('Failed to enable speed boost', error)
  }
}

function handleStageTouchEnd(videoId: string) {
  if (!gestures.value.longPressSpeed || speedBoostVideoId.value !== videoId) {
    return
  }

  speedBoostVideoId.value = ''

  try {
    setVideoPlaybackRate(videoId, 1)
  } catch (error) {
    console.warn('Failed to reset speed boost', error)
  }
}

function togglePause(videoId: string) {
  try {
    isActiveVideoPaused.value = toggleVideoPlayback(videoId, isActiveVideoPaused.value)
  } catch (error) {
    console.warn('Failed to toggle playback', error)
  }
}

function openSheet(type: 'info' | 'comments') {
  activeSheet.value = type
}

function closeSheet() {
  activeSheet.value = 'none'
}

function clearPendingSingleTap() {
  if (pendingSingleTapTimer.value) {
    clearTimeout(pendingSingleTapTimer.value)
    pendingSingleTapTimer.value = null
  }
}

function getRandomNextIndex() {
  if (feedVideos.value.length <= 1) {
    return 0
  }

  const currentIndex = playerStore.currentIndex
  let nextIndex = currentIndex

  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * feedVideos.value.length)
  }

  return nextIndex
}

function toggleLike(videoId: string) {
  libraryStore.toggleLike(videoId)
}

function shouldShowFullscreenButton(video: VideoAsset) {
  if (typeof video.width === 'number' && typeof video.height === 'number') {
    return video.width / Math.max(video.height, 1) >= 1.2
  }

  return false
}

function handleFullscreen(videoId: string) {
  try {
    requestVideoFullscreen(videoId)
  } catch (error) {
    console.warn('Failed to request fullscreen playback', error)
    uni.showToast({
      title: '暂时无法进入全屏',
      icon: 'none',
    })
  }
}

function submitComment() {
  const videoId = activeVideoId.value

  if (!videoId) {
    return
  }

  try {
    commentStore.addComment(videoId, commentDraft.value, playerStore.currentTime)
    commentDraft.value = ''
    uni.showToast({
      title: '评论已保存',
      icon: 'success',
    })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '评论保存失败',
      icon: 'none',
    })
  }
}

function commentsForVideo(videoId: string) {
  return commentStore.getCommentsByVideoId(videoId)
}

function commentPreviewFor(videoId: string) {
  return commentsForVideo(videoId)
    .slice(-3)
    .map((comment) => ({
      id: comment.id,
      timeLabel: formatCommentTime(comment.timestamp),
      content: comment.content,
    }))
}

function categoryNameFor(categoryId: string) {
  return categories.value.find((category) => category.id === categoryId)?.name || '全部'
}

function activeIndexLabel(videoId: string) {
  const index = feedVideos.value.findIndex((video) => video.id === videoId)
  const total = feedVideos.value.length

  if (index < 0) {
    return ''
  }

  return `${index + 1} / ${total}`
}

function goToLibrary() {
  uni.switchTab({
    url: '/pages/library/index',
  })
}
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  background: var(--mt-home-background);
}

.video-swiper,
.video-slide,
.video-stage {
  height: 100vh;
}

.video-stage {
  position: relative;
  overflow: hidden;
  background: #050505;
}

.video-player {
  width: 100%;
  height: 100%;
}

.video-scrim {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.28) 0%, rgba(0, 0, 0, 0.05) 28%, rgba(0, 0, 0, 0.24) 100%);
  pointer-events: none;
}

.video-topbar {
  position: absolute;
  top: 88rpx;
  left: 28rpx;
  right: 28rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}

.video-topbar__tag,
.video-topbar__meta {
  font-size: 24rpx;
}

.pause-indicator {
  position: absolute;
  left: 50%;
  top: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 180rpx;
  height: 180rpx;
  border-radius: 9999rpx;
  transform: translate(-50%, -50%);
}

.pause-indicator__icon {
  color: #fff;
  font-size: 54rpx;
  line-height: 1;
}

.pause-indicator__label {
  margin-top: 12rpx;
  font-size: 22rpx;
}

.fullscreen-trigger {
  position: absolute;
  left: 28rpx;
  right: 132rpx;
  bottom: 112rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  min-height: 76rpx;
  border-radius: 9999rpx;
}

.fullscreen-trigger__icon {
  color: #fff;
  font-size: 28rpx;
  line-height: 1;
}

.fullscreen-trigger__text {
  font-size: 24rpx;
  font-weight: 600;
}

.sheet-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
}

.sheet-host {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
}
</style>
