<template>
  <view :class="['home-page', 'mt-page', themeClass]" :style="homeInlineStyle">
    <view v-if="!videos.length" class="empty-shell">
      <view class="empty-card glass-panel" :style="panelInlineStyle">
        <text class="empty-tag" :style="accentStyle">HOME</text>
        <text class="empty-title" :style="textPrimaryStyle">还没有可播放的视频</text>
        <text class="empty-copy" :style="textSecondaryStyle">
          先去素材库导入视频，Home 首版会在这里提供沉浸式上下滑动播放。
        </text>
        <view class="empty-action" :style="primaryActionStyle" @tap="goToLibrary">
          <text class="empty-action__text">去素材库导入</text>
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
      <swiper-item v-for="video in videos" :key="video.id" class="video-slide">
        <view class="video-stage">
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
              {{ activeIndexLabel(video.id) }}
            </text>
          </view>

          <view class="video-side-actions">
            <view class="side-button glass-panel" :style="sideButtonStyle" @tap="toggleLike(video.id)">
              <text class="side-button__icon">{{ video.isLiked ? '♥' : '♡' }}</text>
              <text class="side-button__text" :style="textPrimaryStyle">{{ video.isLiked ? '已喜欢' : '喜欢' }}</text>
            </view>
            <view class="side-button glass-panel" :style="sideButtonStyle">
              <text class="side-button__icon">▶</text>
              <text class="side-button__text" :style="textPrimaryStyle">{{ video.playCount }}</text>
            </view>
            <view class="side-button glass-panel" :style="sideButtonStyle">
              <text class="side-button__icon">✎</text>
              <text class="side-button__text" :style="textPrimaryStyle">{{ commentsForVideo(video.id).length }}</text>
            </view>
          </view>

          <view class="video-bottom">
            <view class="video-summary glass-panel" :style="summaryStyle">
              <text class="video-category" :style="textPrimaryStyle">{{ categoryNameFor(video.categoryId) }}</text>
              <text class="video-stats" :style="textSecondaryStyle">
                时长 {{ formatDuration(video.duration) }} · 观看 {{ formatWatchTime(video.totalWatchTime) }}
              </text>
              <text class="video-hint" :style="textMutedStyle">
                支持上下滑切换、点赞、本地评论保存与历史回显。
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
              <text v-else class="comment-empty" :style="textMutedStyle">还没有给这个视频留下评论。</text>

              <view v-if="video.id === activeVideoId" class="comment-editor">
                <input
                  v-model="commentDraft"
                  class="comment-input"
                  :style="inputInlineStyle"
                  maxlength="40"
                  placeholder="写一句下次刷到时还会看到的话"
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

const userStore = useUserStore()
const libraryStore = useLibraryStore()
const playerStore = usePlayerStore()
const commentStore = useCommentStore()

const { theme } = storeToRefs(userStore)
const { categories, videos } = storeToRefs(libraryStore)
const { activeVideoId } = storeToRefs(playerStore)

const commentDraft = ref('')
const watchProgress = ref<Record<string, number>>({})
const playedVideoIds = ref<string[]>([])

const activeTheme = computed(() => getThemeOption(theme.value))
const themeClass = computed(() => `theme--${theme.value}`)
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
  videos,
  (nextVideos) => {
    if (!nextVideos.length) {
      return
    }

    const currentVideo = nextVideos[playerStore.currentIndex] || nextVideos[0]

    if (!playerStore.activeVideoId || !nextVideos.some((video) => video.id === playerStore.activeVideoId)) {
      activateVideo(currentVideo.id, nextVideos.findIndex((video) => video.id === currentVideo.id))
    }
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
  const video = videos.value[nextIndex]

  if (!video) {
    return
  }

  activateVideo(video.id, nextIndex)
  commentDraft.value = ''
}

function handleVideoPlay(videoId: string) {
  const index = videos.value.findIndex((video) => video.id === videoId)

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
  const index = videos.value.findIndex((video) => video.id === videoId)
  const total = videos.value.length

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
  videos.value.forEach((video) => {
    const context = uni.createVideoContext(videoDomId(video.id))

    if (video.id === activeId) {
      context.seek(0)
      context.play()
      return
    }

    context.pause()
  })
}

function videoDomId(videoId: string) {
  return `home-video-${videoId}`
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
