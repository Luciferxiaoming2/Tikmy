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
      circular
      :current="playerStore.currentIndex"
      @change="handleSwiperChange"
    >
      <swiper-item v-for="video in feedVideos" :key="video.id" class="video-slide">
        <view
          class="video-stage"
          @tap="handleStageTap(video.id)"
          @longpress="handleStageLongPress(video.id)"
          @touchstart="handleStageTouchStart(video.id, $event)"
          @touchmove="handleStageTouchMove(video.id, $event)"
          @touchend="handleStageTouchEnd(video.id)"
          @touchcancel="handleStageTouchEnd(video.id)"
        >
          <video
            :id="videoDomId(video.id)"
            class="video-player"
            :style="videoPlayerInlineStyle(video.id)"
            :src="video.localPath"
            :poster="video.posterPath || undefined"
            :show-center-play-btn="false"
            :show-play-btn="false"
            :show-fullscreen-btn="false"
            :controls="false"
            :loop="false"
            :muted="false"
            :autoplay="false"
            object-fit="contain"
            @timeupdate="handleTimeUpdate(video.id, $event)"
            @play="handleVideoPlay(video.id)"
            @ended="handleVideoEnded(video.id)"
            @error="handleVideoError(video)"
            @fullscreenchange="handleFullscreenChange"
          />

          <view class="video-scrim" />

          <view v-if="video.id === activeVideoId" class="danmaku-layer">
            <view
              v-for="item in activeDanmakuItems"
              :key="item.id"
              class="danmaku-item"
              :style="item.style"
            >
              <text class="danmaku-item__text">{{ item.content }}</text>
            </view>
          </view>

          <HomeActionRail
            :liked="video.isLiked"
            :favorited="video.isFavorite"
            :play-count="video.playCount"
            :comment-count="commentsForVideo(video.id).length"
            :panel-style="sideButtonStyle"
            :text-primary-style="textPrimaryStyle"
            @toggle-like="toggleLike(video.id)"
            @toggle-favorite="toggleFavorite(video.id)"
            @open-info="openSheet('info')"
            @open-comments="openSheet('comments')"
          />

          <view
            v-if="video.id === activeVideoId && shouldShowFullscreenButton(video)"
            class="fullscreen-trigger"
            @tap.stop="handleFullscreen(video.id)"
          >
            <text class="fullscreen-trigger__icon">[]</text>
            <text class="fullscreen-trigger__text">{{ '\u5168\u5c4f\u89c2\u770b' }}</text>
          </view>

          <view
            v-if="video.id === activeVideoId && isActiveVideoPaused"
            class="pause-indicator glass-panel"
            :style="panelInlineStyle"
          >
            <text class="pause-indicator__icon">II</text>
            <text class="pause-indicator__label" :style="textPrimaryStyle">{{ '\u5df2\u6682\u505c' }}</text>
          </view>
        </view>
      </swiper-item>
    </swiper>

    <view v-if="homeCategoryTabs.length" class="video-topbar">
      <view class="video-topbar__nav">
        <view class="video-topbar__menu" @tap.stop="handleMenuPlaceholder">
          <text class="video-topbar__menu-icon">&#9776;</text>
        </view>

        <scroll-view scroll-x class="video-topbar__tabs" show-scrollbar="false">
          <view class="video-topbar__tabs-track">
            <view
              v-for="option in homeCategoryTabs"
              :key="option.id"
              class="video-topbar__tab"
              :class="{ 'video-topbar__tab--active': option.id === playbackCategoryId }"
              :style="option.id === playbackCategoryId ? textPrimaryStyle : textMutedStyle"
              @tap.stop="handleHomeCategoryTap(option.id)"
            >
              <text
                class="video-topbar__tab-text"
                :style="option.id === playbackCategoryId ? textPrimaryStyle : textMutedStyle"
              >
                {{ option.name }}
              </text>
            </view>

            <view class="video-topbar__search video-topbar__search--inline" @tap.stop="handleSearchPlaceholder">
              <view class="video-topbar__search-icon" aria-hidden="true">
                <view class="video-topbar__search-lens" />
                <view class="video-topbar__search-handle" />
              </view>
            </view>

            <view
              class="video-topbar__tab video-topbar__tab--mode"
              :class="{ 'video-topbar__tab--active': playbackMode === 'sequential' }"
              :style="playbackMode === 'sequential' ? textPrimaryStyle : textMutedStyle"
              @tap.stop="handleHomeModeTap('sequential')"
            >
              <text
                class="video-topbar__tab-text video-topbar__tab-text--mode"
                :style="playbackMode === 'sequential' ? textPrimaryStyle : textMutedStyle"
              >
                {{ '\u987a\u5e8f' }}
              </text>
            </view>

            <view
              class="video-topbar__tab video-topbar__tab--mode"
              :class="{ 'video-topbar__tab--active': playbackMode === 'random' }"
              :style="playbackMode === 'random' ? textPrimaryStyle : textMutedStyle"
              @tap.stop="handleHomeModeTap('random')"
            >
              <text
                class="video-topbar__tab-text video-topbar__tab-text--mode"
                :style="playbackMode === 'random' ? textPrimaryStyle : textMutedStyle"
              >
                {{ '\u968f\u673a' }}
              </text>
            </view>
          </view>
        </scroll-view>
      </view>
    </view>

    <view v-if="isSearchOpen" class="search-overlay">
      <view class="search-overlay__mask" @tap="closeSearchOverlay" />
      <view class="search-overlay__shell" :style="homeInlineStyle">
        <view class="search-overlay__bar glass-panel" :style="panelInlineStyle">
          <view class="search-overlay__back" @tap="closeSearchOverlay">
            <text class="search-overlay__back-icon" :style="textPrimaryStyle">&#8592;</text>
          </view>
          <view class="search-overlay__input-wrap" :style="inputInlineStyle">
            <view class="search-overlay__icon" aria-hidden="true">
              <view class="search-overlay__icon-lens" />
              <view class="search-overlay__icon-handle" />
            </view>
            <input
              v-model="searchKeyword"
              class="search-overlay__input"
              :style="textPrimaryStyle"
              type="text"
              confirm-type="search"
              maxlength="40"
              :placeholder="searchUiText.placeholder"
              :placeholder-style="searchPlaceholderStyle"
            />
            <view v-if="searchKeyword" class="search-overlay__clear" @tap="clearSearchKeyword">
              <text class="search-overlay__clear-icon" :style="textMutedStyle">×</text>
            </view>
          </view>
        </view>

        <view class="search-overlay__headline">
          <text class="search-overlay__title" :style="textPrimaryStyle">{{ searchUiText.title }}</text>
          <text class="search-overlay__meta" :style="textSecondaryStyle">{{ searchResultSummary }}</text>
        </view>

        <scroll-view scroll-y class="search-overlay__results">
          <view v-if="!normalizedSearchKeyword" class="search-overlay__empty glass-panel" :style="panelInlineStyle">
            <text class="search-overlay__empty-title" :style="textPrimaryStyle">{{ searchUiText.emptyIdleTitle }}</text>
            <text class="search-overlay__empty-copy" :style="textSecondaryStyle">
              {{ searchUiText.emptyIdleCopy }}
            </text>
          </view>

          <template v-else>
            <view
              v-if="!hasSearchResults"
              class="search-overlay__empty glass-panel"
              :style="panelInlineStyle"
            >
              <text class="search-overlay__empty-title" :style="textPrimaryStyle">{{ searchUiText.emptyResultTitle }}</text>
              <text class="search-overlay__empty-copy" :style="textSecondaryStyle">
                {{ searchUiText.emptyResultCopy }}
              </text>
            </view>

            <view v-if="searchCategoryResults.length" class="search-section">
              <text class="search-section__title" :style="textPrimaryStyle">{{ searchUiText.categories }}</text>
              <view
                v-for="category in searchCategoryResults"
                :key="category.id"
                class="search-result-card glass-panel"
                :style="panelInlineStyle"
                @tap="selectSearchCategory(category.id)"
              >
                <view class="search-result-card__main">
                  <text class="search-result-card__title" :style="textPrimaryStyle">{{ category.name }}</text>
                  <text class="search-result-card__meta" :style="textSecondaryStyle">
                    {{ category.videoCount }} {{ searchUiText.videoUnit }}
                  </text>
                </view>
                <text class="search-result-card__action" :style="textMutedStyle">{{ searchUiText.enterPlay }}</text>
              </view>
            </view>

            <view v-if="searchVideoResults.length" class="search-section">
              <text class="search-section__title" :style="textPrimaryStyle">{{ searchUiText.videos }}</text>
              <view
                v-for="video in searchVideoResults"
                :key="video.id"
                class="search-video-card glass-panel"
                :style="panelInlineStyle"
                @tap="selectSearchVideo(video.id)"
              >
                <view class="search-video-card__poster" :style="buildSearchPosterStyle(video.posterPath)">
                  <text v-if="!video.posterPath" class="search-video-card__poster-fallback">VIDEO</text>
                </view>
                <view class="search-video-card__body">
                  <text class="search-result-card__title" :style="textPrimaryStyle">{{ categoryNameFor(video.categoryId) }}</text>
                  <text class="search-result-card__meta" :style="textSecondaryStyle">
                    {{ formatDuration(video.duration) }} · {{ searchUiText.playCount }} {{ video.playCount }} {{ searchUiText.playUnit }}
                  </text>
                </view>
                <text class="search-result-card__action" :style="textMutedStyle">{{ searchUiText.open }}</text>
              </view>
            </view>

            <view v-if="searchCommentResults.length" class="search-section">
              <text class="search-section__title" :style="textPrimaryStyle">{{ searchUiText.comments }}</text>
              <view
                v-for="comment in searchCommentResults"
                :key="comment.id"
                class="search-result-card glass-panel"
                :style="panelInlineStyle"
                @tap="selectSearchComment(comment.videoId, comment.timestamp)"
              >
                <view class="search-result-card__main">
                  <text class="search-result-card__title" :style="textPrimaryStyle">{{ comment.content }}</text>
                  <text class="search-result-card__meta" :style="textSecondaryStyle">
                    {{ categoryNameFor(videoById(comment.videoId)?.categoryId || '') }} · {{ formatCommentTime(comment.timestamp) }}
                  </text>
                </view>
                <text class="search-result-card__action" :style="textMutedStyle">{{ searchUiText.locateVideo }}</text>
              </view>
            </view>
          </template>
        </scroll-view>
      </view>
    </view>

    <view v-if="activeSheet !== 'none'" class="sheet-mask" @tap="closeSheet" />
    <view v-if="activeSheet !== 'none' && activeVideo" class="sheet-host">
      <HomeInfoPanel
        v-if="activeSheet === 'info'"
        :category-name="categoryNameFor(activeVideo.categoryId)"
        :stats-text="infoStatsText"
        :hint="gestureHint"
        :danmaku-speed="danmakuSpeed"
        :panel-style="summaryStyle"
        :text-primary-style="textPrimaryStyle"
        :text-secondary-style="textSecondaryStyle"
        :text-muted-style="textMutedStyle"
        :active-chip-style="danmakuSpeedChipActiveStyle"
        :inactive-chip-style="danmakuSpeedChipStyle"
        :active-chip-text-style="danmakuSpeedChipTextStyle"
        @change-danmaku-speed="handleDanmakuSpeedChange"
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
  seekVideoToTime,
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

const { gestures, likeWeight, playbackCategoryId, playbackEndAction, playbackMode, theme } = storeToRefs(userStore)
const { categories, videos } = storeToRefs(libraryStore)
const { activeVideoId } = storeToRefs(playerStore)
const { comments } = storeToRefs(commentStore)

const commentDraft = ref('')
const watchProgress = ref<Record<string, number>>({})
const playedVideoIds = ref<string[]>([])
const feedVideos = ref<VideoAsset[]>([])
const isSearchOpen = ref(false)
const searchKeyword = ref('')
const pendingSearchVideoId = ref('')
const pendingSearchTimestamp = ref<number | null>(null)
const lastTapState = ref<{ videoId: string; time: number } | null>(null)
const pendingSingleTapTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const speedBoostVideoId = ref('')
const activeSheet = ref<'none' | 'info' | 'comments'>('none')
const isActiveVideoPaused = ref(false)
const isPageVisible = ref(false)
const compatibilityPromptedVideoIds = ref<string[]>([])
const playbackSyncToken = ref(0)
const isVideoFullscreen = ref(false)
const zoomScale = ref(1)
const pinchStartDistance = ref(0)
const pinchStartScale = ref(1)
const pinchZoomVideoId = ref('')
const suppressTapAfterPinch = ref(false)
const activeDanmakuItems = ref<Array<{ id: string; content: string; style: Record<string, string> }>>([])
const danmakuSequence = ref(0)
const danmakuLaneCursor = ref(0)
const danmakuSpeed = ref<'slow' | 'normal' | 'fast'>('normal')

const activeTheme = computed(() => getThemeOption(theme.value))
const themeClass = computed(() => `theme--${theme.value}`)
const playbackModeLabel = computed(() => getPlaybackModeLabel(playbackMode.value))
const playbackCategoryLabel = computed(
  () => categories.value.find((category) => category.id === playbackCategoryId.value)?.name || 'All',
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
  background: 'transparent',
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
  boxShadow: 'none',
  backdropFilter: 'none',
}))
const danmakuSpeedChipStyle = computed(() => ({
  background: 'transparent',
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
}))
const danmakuSpeedChipActiveStyle = computed(() => ({
  background: activeTheme.value.primary,
  border: `1rpx solid ${activeTheme.value.primary}`,
}))
const danmakuSpeedChipTextStyle = computed(() => ({
  color: '#08110c',
}))
const activeVideoZoomStyle = computed(() => ({
  transform: `scale(${zoomScale.value})`,
}))
const textPrimaryStyle = computed(() => ({ color: activeTheme.value.textPrimary }))
const textSecondaryStyle = computed(() => ({ color: activeTheme.value.textSecondary }))
const textMutedStyle = computed(() => ({ color: activeTheme.value.textMuted }))
const accentStyle = computed(() => ({ color: activeTheme.value.primary }))
const searchPlaceholderStyle = computed(() => `color:${activeTheme.value.textMuted};font-size:28rpx;`)
const primaryActionStyle = computed(() => ({
  background: activeTheme.value.primary,
  border: `1rpx solid ${activeTheme.value.primary}`,
}))
const activeVideo = computed(() => feedVideos.value.find((video) => video.id === activeVideoId.value) || null)
const homeCategoryTabs = computed(() =>
  categories.value.map((category) => ({
    id: category.id,
    name: category.name,
  })),
)
const playbackTargets = computed(() =>
  feedVideos.value.map((video) => ({
    domId: videoDomId(video.id),
    videoId: video.id,
  })),
)
const normalizedSearchKeyword = computed(() => searchKeyword.value.trim().toLowerCase())
const searchUiText = {
  title: '\u672c\u5730\u641c\u7d22',
  placeholder: '\u641c\u7d22\u5206\u7c7b\u3001\u8bc4\u8bba\u548c\u672c\u5730\u89c6\u9891',
  emptyIdleTitle: '\u8f93\u5165\u5173\u952e\u8bcd\u5f00\u59cb\u641c\u7d22',
  emptyIdleCopy: '\u652f\u6301\u641c\u7d22\u5206\u7c7b\u540d\u79f0\u3001\u8bc4\u8bba\u5185\u5bb9\u4ee5\u53ca\u672c\u5730\u89c6\u9891\u6240\u5c5e\u5206\u7c7b\u3002',
  emptyResultTitle: '\u6ca1\u6709\u5339\u914d\u7ed3\u679c',
  emptyResultCopy: '\u8bd5\u8bd5\u66f4\u77ed\u7684\u5173\u952e\u8bcd\uff0c\u6216\u4ece\u5206\u7c7b\u540d\u79f0\u3001\u8bc4\u8bba\u5185\u5bb9\u5f00\u59cb\u641c\u7d22\u3002',
  categories: '\u5206\u7c7b',
  videos: '\u89c6\u9891',
  comments: '\u8bc4\u8bba',
  videoUnit: '\u4e2a\u89c6\u9891',
  playCount: '\u64ad\u653e',
  playUnit: '\u6b21',
  enterPlay: '\u8fdb\u5165\u64ad\u653e',
  open: '\u6253\u5f00',
  locateVideo: '\u5b9a\u4f4d\u89c6\u9891',
} as const
const searchCategoryResults = computed(() => {
  if (!normalizedSearchKeyword.value) {
    return []
  }

  return categories.value.filter((category) => category.name.toLowerCase().includes(normalizedSearchKeyword.value))
})
const searchVideoResults = computed(() => {
  if (!normalizedSearchKeyword.value) {
    return []
  }

  return videos.value
    .filter((video) => categoryNameFor(video.categoryId).toLowerCase().includes(normalizedSearchKeyword.value))
    .slice(0, 12)
})
const searchCommentResults = computed(() => {
  if (!normalizedSearchKeyword.value) {
    return []
  }

  return comments.value
    .filter((comment) => comment.content.toLowerCase().includes(normalizedSearchKeyword.value))
    .sort((left, right) => right.createdAt - left.createdAt)
    .slice(0, 12)
})
const hasSearchResults = computed(
  () =>
    searchCategoryResults.value.length > 0 ||
    searchVideoResults.value.length > 0 ||
    searchCommentResults.value.length > 0,
)
const searchResultSummary = computed(() => {
  if (!normalizedSearchKeyword.value) {
    return `\u5171 ${categories.value.length} \u4e2a\u5206\u7c7b\uff0c${videos.value.length} \u4e2a\u89c6\u9891\uff0c${comments.value.length} \u6761\u8bc4\u8bba`
  }

  return `\u627e\u5230 ${searchCategoryResults.value.length + searchVideoResults.value.length + searchCommentResults.value.length} \u6761\u7ed3\u679c`
})
const infoStatsText = computed(() => {
  if (!activeVideo.value) {
    return ''
  }

  return `时长 ${formatDuration(activeVideo.value.duration)} | 已看 ${formatWatchTime(activeVideo.value.totalWatchTime)} | 播放 ${activeVideo.value.playCount} 次`
})
const feedSignature = computed(() =>
  videos.value
    .map(
      (video) =>
        `${video.id}:${video.categoryId}:${video.isLiked ? 1 : 0}:${video.isFavorite ? 1 : 0}:${video.playCount}:${video.createdAt}`,
    )
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

    if (pendingSearchVideoId.value) {
      const pendingIndex = nextVideos.findIndex((video) => video.id === pendingSearchVideoId.value)

      if (pendingIndex >= 0) {
        const nextVideoId = pendingSearchVideoId.value
        pendingSearchVideoId.value = ''
        activateVideo(nextVideoId, pendingIndex)
        return
      }
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
    resetPinchZoom()
    resetDanmaku()

    if (!videoId || !isPageVisible.value) {
      return
    }

    const token = playbackSyncToken.value + 1
    playbackSyncToken.value = token

    await nextTick()

    if (token !== playbackSyncToken.value) {
      return
    }

    syncVideoPlayback(playbackTargets.value, videoId)
    isActiveVideoPaused.value = false
    applyPendingSearchSeek(videoId)
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
  playbackSyncToken.value += 1
  clearPendingSingleTap()
  speedBoostVideoId.value = ''
  activeSheet.value = 'none'
  pauseAllVideos(playbackTargets.value)
  resetDanmaku()
})

function activateVideo(videoId: string, index: number) {
  playerStore.setActiveVideo(videoId, index)
  watchProgress.value = {
    ...watchProgress.value,
    [videoId]: 0,
  }
  isActiveVideoPaused.value = false
  activeSheet.value = 'none'
  resetDanmaku()
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

  if (playbackEndAction.value === 'loop') {
    playVideoFromStart(videoDomId(videoId))
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
      playVideoFromStart(videoDomId(videoId))
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
    playVideoFromStart(videoDomId(videoId))
  }
}

function handleVideoError(video: VideoAsset) {
  if (compatibilityPromptedVideoIds.value.includes(video.id)) {
    return
  }

  compatibilityPromptedVideoIds.value = [...compatibilityPromptedVideoIds.value, video.id]

  uni.showModal({
    title: 'Playback notice',
    content:
      video.importHint ||
      'This video may use a codec that is not fully supported in WeChat Mini Program. If it plays audio without video, convert it to H.264 MP4 and import again.',
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

  emitDanmakuForRange(videoId, previousTime, currentTime)

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

  if (suppressTapAfterPinch.value) {
    suppressTapAfterPinch.value = false
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
  if (
    !gestures.value.longPressSpeed ||
    videoId !== activeVideoId.value ||
    isActiveVideoPaused.value ||
    pinchZoomVideoId.value === videoId
  ) {
    return
  }

  speedBoostVideoId.value = videoId

  try {
    setVideoPlaybackRate(videoDomId(videoId), 2)
  } catch (error) {
    console.warn('Failed to enable speed boost', error)
  }
}

function handleStageTouchEnd(videoId: string) {
  if (pinchZoomVideoId.value === videoId) {
    pinchZoomVideoId.value = ''
    pinchStartDistance.value = 0
    pinchStartScale.value = zoomScale.value
    suppressTapAfterPinch.value = true
  }

  if (!gestures.value.longPressSpeed || speedBoostVideoId.value !== videoId) {
    return
  }

  speedBoostVideoId.value = ''

  try {
    setVideoPlaybackRate(videoDomId(videoId), 1)
  } catch (error) {
    console.warn('Failed to reset speed boost', error)
  }
}

function togglePause(videoId: string) {
  try {
    isActiveVideoPaused.value = toggleVideoPlayback(videoDomId(videoId), isActiveVideoPaused.value)
  } catch (error) {
    console.warn('Failed to toggle playback', error)
  }
}

function videoPlayerInlineStyle(videoId: string) {
  if (videoId !== activeVideoId.value) {
    return null
  }

  return activeVideoZoomStyle.value
}

function resetPinchZoom() {
  zoomScale.value = 1
  pinchStartDistance.value = 0
  pinchStartScale.value = 1
  pinchZoomVideoId.value = ''
  suppressTapAfterPinch.value = false
}

function resetDanmaku() {
  activeDanmakuItems.value = []
  danmakuSequence.value = 0
  danmakuLaneCursor.value = 0
}

function emitDanmakuForRange(videoId: string, previousTime: number, currentTime: number) {
  if (videoId !== activeVideoId.value) {
    return
  }

  if (currentTime <= 0 || currentTime < previousTime || currentTime - previousTime > 2.5) {
    return
  }

  const matchedComments = commentsForVideo(videoId).filter(
    (comment) => comment.timestamp > previousTime && comment.timestamp <= currentTime,
  )

  matchedComments.forEach((comment) => {
    pushDanmaku(comment.content)
  })
}

function pushDanmaku(content: string) {
  const laneHeight = 72
  const laneTop = 176 + (danmakuLaneCursor.value % 4) * laneHeight
  const id = `danmaku_${Date.now()}_${danmakuSequence.value}`
  const animationDuration =
    danmakuSpeed.value === 'slow' ? '8.6s' : danmakuSpeed.value === 'fast' ? '4.8s' : '6.2s'

  danmakuSequence.value += 1
  danmakuLaneCursor.value = (danmakuLaneCursor.value + 1) % 4

  activeDanmakuItems.value = [
    ...activeDanmakuItems.value,
    {
      id,
      content,
      style: {
        top: `${laneTop}rpx`,
        animationDelay: '0s',
        animationDuration,
      },
    },
  ]

  setTimeout(() => {
    activeDanmakuItems.value = activeDanmakuItems.value.filter((item) => item.id !== id)
  }, Number.parseFloat(animationDuration) * 1000)
}

function handleDanmakuSpeedChange(nextSpeed: 'slow' | 'normal' | 'fast') {
  danmakuSpeed.value = nextSpeed
}

function getTouchDistance(touches: Array<{ clientX?: number; clientY?: number }>) {
  if (touches.length < 2) {
    return 0
  }

  const [firstTouch, secondTouch] = touches
  const deltaX = Number(firstTouch.clientX || 0) - Number(secondTouch.clientX || 0)
  const deltaY = Number(firstTouch.clientY || 0) - Number(secondTouch.clientY || 0)

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY)
}

function normalizeTouchPoints(touches: TouchList | ArrayLike<Touch> | undefined) {
  if (!touches) {
    return []
  }

  return Array.from(touches).map((touch) => ({
    clientX: touch.clientX,
    clientY: touch.clientY,
  }))
}

function clampZoomScale(scale: number) {
  return Math.min(2.5, Math.max(1, Number(scale.toFixed(3))))
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

function handleStageTouchStart(
  videoId: string,
  event: TouchEvent,
) {
  if (videoId !== activeVideoId.value) {
    return
  }

  const touches = normalizeTouchPoints(event.touches)

  if (touches.length < 2) {
    return
  }

  clearPendingSingleTap()
  lastTapState.value = null
  pinchZoomVideoId.value = videoId
  pinchStartDistance.value = getTouchDistance(touches)
  pinchStartScale.value = zoomScale.value

  if (speedBoostVideoId.value === videoId) {
    speedBoostVideoId.value = ''

    try {
      setVideoPlaybackRate(videoDomId(videoId), 1)
    } catch (error) {
      console.warn('Failed to reset speed boost for pinch zoom', error)
    }
  }
}

function handleStageTouchMove(
  videoId: string,
  event: TouchEvent,
) {
  if (pinchZoomVideoId.value !== videoId) {
    return
  }

  const touches = normalizeTouchPoints(event.touches)

  if (touches.length < 2 || pinchStartDistance.value <= 0) {
    return
  }

  const nextDistance = getTouchDistance(touches)

  if (!nextDistance) {
    return
  }

  const nextScale = pinchStartScale.value * (nextDistance / pinchStartDistance.value)
  zoomScale.value = clampZoomScale(nextScale)
}

function toggleFavorite(videoId: string) {
  libraryStore.toggleFavorite(videoId)
}

function handleHomeCategoryTap(categoryId: string) {
  userStore.setPlaybackCategory(categoryId)
}

function handleHomeModeTap(mode: 'sequential' | 'random') {
  userStore.setPlaybackMode(mode)
}

function handleSearchPlaceholder() {
  clearPendingSingleTap()
  activeSheet.value = 'none'
  searchKeyword.value = ''
  isSearchOpen.value = true
  pauseAllVideos(playbackTargets.value)
  isActiveVideoPaused.value = true
  resetDanmaku()
}

function handleMenuPlaceholder() {
  uni.showToast({
    title: '\u83dc\u5355\u529f\u80fd\u5f00\u53d1\u4e2d',
    icon: 'none',
  })
}

function applyPendingSearchSeek(videoId: string) {
  if (pendingSearchTimestamp.value === null) {
    return
  }

  const seekTime = pendingSearchTimestamp.value
  pendingSearchTimestamp.value = null

  setTimeout(() => {
    try {
      seekVideoToTime(videoDomId(videoId), seekTime)
      watchProgress.value = {
        ...watchProgress.value,
        [videoId]: seekTime,
      }
      playerStore.setCurrentTime(seekTime)
    } catch (error) {
      console.warn('Failed to seek video from search result', error)
    }
  }, 80)
}

function shouldShowFullscreenButton(video: VideoAsset) {
  if (typeof video.width === 'number' && typeof video.height === 'number') {
    return video.width / Math.max(video.height, 1) >= 1.2
  }

  return false
}

function handleFullscreen(videoId: string) {
  try {
    requestVideoFullscreen(videoDomId(videoId))
  } catch (error) {
    console.warn('Failed to request fullscreen playback', error)
    uni.showToast({
      title: 'Devtools may be unstable. Please verify on a real device.',
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
      title: 'Comment saved',
      icon: 'success',
    })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : 'Failed to save comment',
      icon: 'none',
    })
  }
}

function commentsForVideo(videoId: string) {
  return commentStore.getCommentsByVideoId(videoId)
}

function clearSearchKeyword() {
  searchKeyword.value = ''
}

function dismissSearchOverlay() {
  searchKeyword.value = ''
  isSearchOpen.value = false
}

function closeSearchOverlay() {
  dismissSearchOverlay()

  if (!isPageVisible.value || !activeVideoId.value) {
    return
  }

  syncVideoPlayback(playbackTargets.value, activeVideoId.value)
  isActiveVideoPaused.value = false
}

function selectSearchCategory(categoryId: string) {
  userStore.setPlaybackCategory(categoryId)
  dismissSearchOverlay()
}

function selectSearchVideo(videoId: string, timestamp?: number) {
  const targetVideo = videoById(videoId)

  if (!targetVideo) {
    return
  }

  pendingSearchVideoId.value = videoId
  pendingSearchTimestamp.value = typeof timestamp === 'number' ? timestamp : null
  dismissSearchOverlay()

  if (playbackCategoryId.value === targetVideo.categoryId) {
    const nextIndex = feedVideos.value.findIndex((video) => video.id === videoId)

    if (nextIndex >= 0) {
      pendingSearchVideoId.value = ''
      activateVideo(videoId, nextIndex)

      if (pendingSearchTimestamp.value !== null || activeVideoId.value === videoId) {
        setTimeout(() => {
          applyPendingSearchSeek(videoId)
        }, 120)
      }
    }

    return
  }

  userStore.setPlaybackCategory(targetVideo.categoryId)
}

function selectSearchComment(videoId: string, timestamp: number) {
  selectSearchVideo(videoId, timestamp)
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
  return categories.value.find((category) => category.id === categoryId)?.name || 'All'
}

function videoById(videoId: string) {
  return videos.value.find((video) => video.id === videoId) || null
}

function buildSearchPosterStyle(posterPath: string) {
  if (!posterPath) {
    return {}
  }

  return {
    backgroundImage: `url(${posterPath})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
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

function handleFullscreenChange(
  event: Event & {
    detail?: {
      fullScreen?: boolean
      direction?: number
    }
  },
) {
  isVideoFullscreen.value = Boolean(event.detail?.fullScreen)

  if (!isVideoFullscreen.value || !activeVideoId.value) {
    return
  }

  const currentVideoId = activeVideoId.value
  isActiveVideoPaused.value = false

  setTimeout(() => {
    if (!isVideoFullscreen.value || activeVideoId.value !== currentVideoId) {
      return
    }

    try {
      toggleVideoPlayback(videoDomId(currentVideoId), true)
    } catch (error) {
      console.warn('Failed to resume playback after entering fullscreen', error)
    }
  }, 80)
}
</script>

<style scoped lang="scss">
.home-page {
  position: relative;
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
  position: fixed;
  top: 78rpx;
  left: 18rpx;
  right: 18rpx;
  z-index: 12;
}

.video-topbar__nav {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.video-topbar__menu,
.video-topbar__search {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64rpx;
  height: 64rpx;
  flex: 0 0 64rpx;
}

.video-topbar__menu-icon,
.video-topbar__search-icon {
  color: rgba(255, 255, 255, 0.96);
  line-height: 1;
  font-weight: 500;
}

.video-topbar__menu-icon {
  font-size: 34rpx;
}

.video-topbar__search-icon {
  position: relative;
  width: 34rpx;
  height: 34rpx;
}

.video-topbar__search--inline {
  width: 52rpx;
  height: 52rpx;
  flex: 0 0 52rpx;
}

.video-topbar__search-lens {
  position: absolute;
  top: 4rpx;
  left: 3rpx;
  width: 18rpx;
  height: 18rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.96);
  border-radius: 9999rpx;
}

.video-topbar__search-handle {
  position: absolute;
  right: 4rpx;
  bottom: 4rpx;
  width: 11rpx;
  height: 4rpx;
  border-radius: 9999rpx;
  background: rgba(255, 255, 255, 0.96);
  transform: rotate(45deg);
  transform-origin: center;
}

.video-topbar__tabs {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
}

.video-topbar__tabs-track {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: max-content;
  gap: 26rpx;
  padding: 0 8rpx 4rpx;
}

.video-topbar__tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: fit-content;
  padding: 6rpx 0 16rpx;
}

.video-topbar__tab--active::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 30rpx;
  height: 5rpx;
  border-radius: 9999rpx;
  background: currentColor;
  transform: translateX(-50%);
}

.video-topbar__tab-text {
  font-size: 30rpx;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.video-topbar__tab-text--mode {
  font-size: 26rpx;
  font-weight: 700;
}

.search-overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
}

.search-overlay__mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.72);
}

.search-overlay__shell {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 76rpx 24rpx 40rpx;
}

.search-overlay__bar {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 16rpx;
  border-radius: 28rpx;
}

.search-overlay__back {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60rpx;
  height: 60rpx;
  flex: 0 0 60rpx;
}

.search-overlay__back-icon {
  font-size: 40rpx;
  line-height: 1;
}

.search-overlay__input-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 14rpx;
  min-height: 72rpx;
  padding: 0 20rpx;
  border-radius: 9999rpx;
}

.search-overlay__icon {
  position: relative;
  width: 28rpx;
  height: 28rpx;
  flex: 0 0 28rpx;
}

.search-overlay__icon-lens {
  position: absolute;
  top: 2rpx;
  left: 1rpx;
  width: 16rpx;
  height: 16rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.65);
  border-radius: 9999rpx;
}

.search-overlay__icon-handle {
  position: absolute;
  right: 2rpx;
  bottom: 3rpx;
  width: 10rpx;
  height: 4rpx;
  border-radius: 9999rpx;
  background: rgba(255, 255, 255, 0.65);
  transform: rotate(45deg);
  transform-origin: center;
}

.search-overlay__input {
  flex: 1;
  height: 72rpx;
  font-size: 28rpx;
}

.search-overlay__clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  height: 40rpx;
}

.search-overlay__clear-icon {
  font-size: 28rpx;
  line-height: 1;
}

.search-overlay__headline {
  margin-top: 28rpx;
}

.search-overlay__title {
  display: block;
  font-size: 48rpx;
  font-weight: 700;
}

.search-overlay__meta {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
}

.search-overlay__results {
  height: calc(100vh - 246rpx);
  margin-top: 28rpx;
}

.search-overlay__empty {
  padding: 32rpx 28rpx;
  border-radius: 28rpx;
}

.search-overlay__empty-title {
  display: block;
  font-size: 30rpx;
  font-weight: 700;
}

.search-overlay__empty-copy {
  display: block;
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.search-section + .search-section {
  margin-top: 28rpx;
}

.search-section__title {
  display: block;
  margin-bottom: 16rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.search-result-card,
.search-video-card {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 24rpx;
  border-radius: 28rpx;
}

.search-result-card + .search-result-card,
.search-video-card + .search-video-card {
  margin-top: 14rpx;
}

.search-result-card__main,
.search-video-card__body {
  flex: 1;
  min-width: 0;
}

.search-result-card__title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.5;
}

.search-result-card__meta {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.5;
}

.search-result-card__action {
  font-size: 22rpx;
}

.search-video-card__poster {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 112rpx;
  height: 156rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
}

.search-video-card__poster-fallback {
  color: rgba(255, 255, 255, 0.65);
  font-size: 20rpx;
  letter-spacing: 0.08em;
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

.danmaku-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.danmaku-item {
  position: absolute;
  left: 0;
  max-width: 72vw;
  animation: danmaku-fly 6.2s linear forwards;
}

.danmaku-item__text {
  color: rgba(255, 255, 255, 0.98);
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.45);
}

.video-player {
  transform-origin: center center;
  transition: transform 0.12s ease-out;
}

@keyframes danmaku-fly {
  from {
    transform: translateX(110vw);
  }

  to {
    transform: translateX(-140vw);
  }
}

.fullscreen-trigger {
  position: absolute;
  left: 50%;
  bottom: 252rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  min-width: 188rpx;
  height: 64rpx;
  padding: 0 24rpx;
  border-radius: 9999rpx;
  background: rgba(17, 17, 18, 0.82);
  border: 1rpx solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12rpx 32rpx rgba(0, 0, 0, 0.28);
  transform: translateX(-50%);
  backdrop-filter: blur(16px);
}

.fullscreen-trigger__icon {
  color: rgba(255, 255, 255, 0.96);
  font-size: 24rpx;
  line-height: 1;
}

.fullscreen-trigger__text {
  color: rgba(255, 255, 255, 0.96);
  font-size: 22rpx;
  font-weight: 500;
  letter-spacing: 0.01em;
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
