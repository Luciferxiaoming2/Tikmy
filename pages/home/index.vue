<template>
  <view :class="['home-page', 'mt-page', themeClass]" :style="homeInlineStyle">
    <view v-if="!feedVideos.length" class="empty-shell">
      <view class="empty-card glass-panel" :style="panelInlineStyle">
        <text class="empty-tag" :style="accentStyle">HOME</text>
        <text class="empty-title" :style="textPrimaryStyle">还没有可播放的视频</text>
        <text class="empty-copy" :style="textSecondaryStyle">
          先去素材库导入本地视频，随后回到 Home 页就能开始上下刷视频。
        </text>
        <view class="empty-action" :style="primaryActionStyle" @tap="goToLibrary">
          <text class="empty-action__text">前往素材库</text>
        </view>
      </view>
    </view>

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
            :show-play-btn="true"
            :controls="false"
            :loop="false"
            :muted="false"
            :autoplay="video.id === activeVideoId"
            object-fit="contain"
            @timeupdate="handleTimeUpdate(video.id, $event)"
            @play="handleVideoPlay(video.id)"
          />

          <view class="video-scrim" />

          <view class="video-topbar">
            <text class="video-topbar__tag" :style="accentStyle">Private Home</text>
            <text class="video-topbar__meta" :style="textMutedStyle">
              {{ playbackModeLabel }} · {{ activeIndexLabel(video.id) }}
            </text>
          </view>

          <view class="video-side-actions">
            <view class="side-button glass-panel" :style="sideButtonStyle" @tap.stop="toggleLike(video.id)">
              <text class="side-button__icon">{{ video.isLiked ? '♥' : '♡' }}</text>
              <text class="side-button__text" :style="textPrimaryStyle">{{ video.isLiked ? '已喜欢' : '喜欢' }}</text>
            </view>
            <view class="side-button glass-panel" :style="sideButtonStyle">
              <text class="side-button__icon">▶</text>
              <text class="side-button__text" :style="textPrimaryStyle">{{ video.playCount }}</text>
            </view>
            <view class="side-button glass-panel" :style="sideButtonStyle">
              <text class="side-button__icon">评</text>
              <text class="side-button__text" :style="textPrimaryStyle">{{ commentsForVideo(video.id).length }}</text>
            </view>
          </view>

          <view class="video-bottom">
            <view class="video-summary glass-panel" :style="summaryStyle">
              <text class="video-category" :style="textPrimaryStyle">{{ categoryNameFor(video.categoryId) }}</text>
              <text class="video-stats" :style="textSecondaryStyle">
                时长 {{ formatDuration(video.duration) }} · 已观看 {{ formatWatchTime(video.totalWatchTime) }}
              </text>
              <text class="video-hint" :style="textMutedStyle">
                {{ gestureHint }}
              </text>
            </view>

            <view class="comment-panel glass-panel" :style="summaryStyle">
              <text class="comment-panel__title" :style="textPrimaryStyle">我的评论</text>
              <view v-if="commentsForVideo(video.id).length" class="comment-list">
                <view
                  v-for="comment in commentsForVideo(video.id).slice(-3)"
                  :key="comment.id"
                  class="comment-item"
                >
                  <text class="comment-item__time" :style="accentStyle">{{ formatCommentTime(comment.timestamp) }}</text>
                  <text class="comment-item__content" :style="textPrimaryStyle">{{ comment.content }}</text>
                </view>
              </view>
              <text v-else class="comment-empty" :style="textMutedStyle">还没有评论，发一条给未来再次刷到的自己。</text>

              <view v-if="video.id === activeVideoId" class="comment-editor">
                <input
                  v-model="commentDraft"
                  class="comment-input"
                  :style="inputInlineStyle"
                  maxlength="40"
                  placeholder="写一句想在下次刷到时看到的话"
                  placeholder-style="color: #8e8e93;"
                  confirm-type="send"
                  @confirm="submitComment"
                />
                <view class="comment-send" :style="primaryActionStyle" @tap="submitComment">
                  <text class="comment-send__text">发送</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useCommentStore } from '@/stores/comments'
import { useLibraryStore } from '@/stores/library'
import { usePlayerStore } from '@/stores/player'
import { useUserStore } from '@/stores/user'
import { getThemeOption } from '@/theme/presets'
import type { PlaybackMode, VideoAsset } from '@/types/domain'

const userStore = useUserStore()
const libraryStore = useLibraryStore()
const playerStore = usePlayerStore()
const commentStore = useCommentStore()

const { gestures, likeWeight, playbackMode, theme } = storeToRefs(userStore)
const { categories, videos } = storeToRefs(libraryStore)
const { activeVideoId } = storeToRefs(playerStore)

const commentDraft = ref('')
const watchProgress = ref<Record<string, number>>({})
const playedVideoIds = ref<string[]>([])
const feedVideos = ref<VideoAsset[]>([])
const lastTapState = ref<{ videoId: string; time: number } | null>(null)
const speedBoostVideoId = ref('')

const activeTheme = computed(() => getThemeOption(theme.value))
const themeClass = computed(() => `theme--${theme.value}`)
const playbackModeLabel = computed(() => (playbackMode.value === 'random' ? '随机播放' : '顺序播放'))
const gestureHint = computed(() => {
  const hints: string[] = []

  if (gestures.value.doubleTapLike) {
    hints.push('双击可点赞')
  }

  if (gestures.value.longPressSpeed) {
    hints.push('长按 2 倍速')
  }

  if (!hints.length) {
    return '当前未启用快捷手势，可在设置页随时调整。'
  }

  return `当前支持${hints.join('，')}。`
})
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

watch(
  [videos, playbackMode, likeWeight],
  () => {
    rebuildFeed()
  },
  {
    immediate: true,
    deep: true,
  },
)

watch(
  feedVideos,
  (nextVideos) => {
    if (!nextVideos.length) {
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
    if (!videoId) {
      return
    }

    await nextTick()
    syncVideoPlayback(videoId)
  },
)

function rebuildFeed() {
  const nextVideos =
    playbackMode.value === 'random'
      ? buildRandomFeed(videos.value, likeWeight.value)
      : buildSequentialFeed(videos.value)

  feedVideos.value = nextVideos
}

function activateVideo(videoId: string, index: number) {
  playerStore.setActiveVideo(videoId, index)
  watchProgress.value = {
    ...watchProgress.value,
    [videoId]: 0,
  }

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
  commentDraft.value = ''
}

function handleVideoPlay(videoId: string) {
  const index = feedVideos.value.findIndex((video) => video.id === videoId)

  if (index >= 0) {
    activateVideo(videoId, index)
  }
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
  if (!gestures.value.doubleTapLike) {
    return
  }

  const now = Date.now()
  const lastTap = lastTapState.value

  if (lastTap && lastTap.videoId === videoId && now - lastTap.time < 260) {
    toggleLike(videoId)
    lastTapState.value = null
    return
  }

  lastTapState.value = {
    videoId,
    time: now,
  }
}

function handleStageLongPress(videoId: string) {
  if (!gestures.value.longPressSpeed || videoId !== activeVideoId.value) {
    return
  }

  speedBoostVideoId.value = videoId

  try {
    uni.createVideoContext(videoDomId(videoId)).playbackRate(2)
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
    uni.createVideoContext(videoDomId(videoId)).playbackRate(1)
  } catch (error) {
    console.warn('Failed to reset speed boost', error)
  }
}

function toggleLike(videoId: string) {
  libraryStore.toggleLike(videoId)
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

function formatDuration(duration: number) {
  const totalSeconds = Math.max(0, Math.round(duration))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatWatchTime(seconds: number) {
  if (seconds < 60) {
    return `${Math.round(seconds)} 秒`
  }

  return `${(seconds / 60).toFixed(1)} 分钟`
}

function formatCommentTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const restSeconds = safeSeconds % 60

  return `${minutes}:${String(restSeconds).padStart(2, '0')}`
}

function goToLibrary() {
  uni.switchTab({
    url: '/pages/library/index',
  })
}

function syncVideoPlayback(activeId: string) {
  feedVideos.value.forEach((video) => {
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

  speedBoostVideoId.value = ''
}

function videoDomId(videoId: string) {
  return `home-video-${videoId}`
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
</script>

<style scoped lang="scss">
.home-page {
  min-height: 100vh;
  background: var(--mt-home-background);
}

.empty-shell {
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  padding: 48rpx 40rpx;
}

.empty-card {
  width: 100%;
  padding: 40rpx 36rpx;
  border-radius: var(--mt-radius-card);
}

.empty-tag {
  display: block;
  font-size: 24rpx;
  letter-spacing: 0.18em;
}

.empty-title {
  display: block;
  margin-top: 18rpx;
  font-size: 48rpx;
  font-weight: 700;
}

.empty-copy {
  display: block;
  margin-top: 18rpx;
  font-size: 28rpx;
  line-height: 1.7;
}

.empty-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 220rpx;
  margin-top: 28rpx;
  padding: 22rpx 30rpx;
  border-radius: 9999rpx;
}

.empty-action__text {
  color: #08110c;
  font-size: 24rpx;
  font-weight: 700;
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
}

.video-topbar__tag,
.video-topbar__meta {
  font-size: 24rpx;
}

.video-side-actions {
  position: absolute;
  right: 22rpx;
  bottom: 320rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.side-button {
  width: 120rpx;
  padding: 18rpx 12rpx;
  border-radius: 26rpx;
  text-align: center;
}

.side-button__icon {
  display: block;
  color: #fff;
  font-size: 32rpx;
  line-height: 1;
}

.side-button__text {
  display: block;
  margin-top: 10rpx;
  font-size: 20rpx;
}

.video-bottom {
  position: absolute;
  left: 20rpx;
  right: 20rpx;
  bottom: calc(28rpx + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.video-summary,
.comment-panel {
  padding: 26rpx;
  border-radius: 28rpx;
}

.video-category {
  display: block;
  font-size: 34rpx;
  font-weight: 700;
}

.video-stats {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
}

.video-hint {
  display: block;
  margin-top: 12rpx;
  font-size: 22rpx;
  line-height: 1.6;
}

.comment-panel__title {
  display: block;
  font-size: 28rpx;
  font-weight: 700;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin-top: 14rpx;
}

.comment-item {
  display: flex;
  gap: 14rpx;
  align-items: flex-start;
}

.comment-item__time {
  min-width: 68rpx;
  font-size: 22rpx;
  font-weight: 700;
}

.comment-item__content {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  line-height: 1.6;
}

.comment-empty {
  display: block;
  margin-top: 14rpx;
  font-size: 22rpx;
}

.comment-editor {
  display: flex;
  gap: 14rpx;
  align-items: center;
  margin-top: 18rpx;
}

.comment-input {
  flex: 1;
  min-height: 84rpx;
  box-sizing: border-box;
  padding: 0 24rpx;
  border-radius: 22rpx;
  font-size: 26rpx;
}

.comment-send {
  display: flex;
  min-width: 136rpx;
  min-height: 84rpx;
  align-items: center;
  justify-content: center;
  border-radius: 22rpx;
}

.comment-send__text {
  color: #08110c;
  font-size: 24rpx;
  font-weight: 700;
}
</style>
