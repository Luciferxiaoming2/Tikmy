<template>
  <view :class="['page-shell', 'mt-page', themeClass]" :style="pageInlineStyle">
    <view class="page-header">
      <text class="eyebrow" :style="accentStyle">LIBRARY</text>
      <text class="title" :style="textPrimaryStyle">素材库</text>
      <text class="description" :style="textSecondaryStyle">
        先完成分类管理和本地视频导入，再在分类里像相册一样整理所有视频。
      </text>
    </view>

    <view class="hero glass-panel" :style="panelInlineStyle">
      <view class="hero-copy">
        <text class="hero-title" :style="textPrimaryStyle">当前已收纳 {{ totalVideoCount }} 个视频</text>
        <text class="hero-description" :style="textSecondaryStyle">
          从“全部”或自定义分类开始导入，后续可在分类相册里查看详情、复制和移动视频。
        </text>
        <text class="hero-meta" :style="textMutedStyle">{{ storageSummaryText }}</text>
      </view>
      <view class="hero-actions">
        <view class="action action--primary" :style="primaryActionStyle" @tap="handleQuickImport">
          <text class="action-text action-text--primary">导入视频</text>
        </view>
        <view class="action" :style="secondaryActionStyle" @tap="openCreateCategory">
          <text class="action-text" :style="textPrimaryStyle">新建分类</text>
        </view>
      </view>
    </view>

    <view v-if="storageUsage.warning" class="storage-alert glass-panel" :style="warningPanelStyle">
      <text class="storage-alert__title">本地存储空间接近上限</text>
      <text class="storage-alert__copy" :style="textSecondaryStyle">
        当前已保存 {{ formatReadableBytes(storageUsage.usedBytes) }}，建议及时整理分类或减少重复导入。
      </text>
    </view>

    <view class="section-header">
      <text class="section-title" :style="textPrimaryStyle">分类列表</text>
      <text class="section-meta" :style="textMutedStyle">{{ categories.length }} 个分类</text>
    </view>

    <view v-if="!categories.length" class="empty-state glass-panel" :style="panelInlineStyle">
      <text class="empty-title" :style="textPrimaryStyle">还没有分类</text>
      <text class="empty-copy" :style="textSecondaryStyle">先创建一个分类，然后往里面导入视频。</text>
      <view class="empty-actions">
        <view class="action action--primary" :style="primaryActionStyle" @tap="openCreateCategory">
          <text class="action-text action-text--primary">创建分类</text>
        </view>
      </view>
    </view>

    <view v-else class="category-list-shell" :style="categoryListShellStyle">
      <scroll-view scroll-y enable-flex show-scrollbar class="category-list-scroll">
        <view class="category-list">
      <view
        v-for="category in categories"
        :key="category.id"
        class="category-card glass-panel"
        :style="panelInlineStyle"
        @tap="openCategoryGallery(category)"
      >
        <view class="category-cover" :style="buildCategoryCoverStyle(category)">
          <text v-if="!category.coverPath" class="category-cover__fallback">{{ category.name.slice(0, 2) }}</text>
        </view>
        <view class="category-content">
          <view class="category-head">
            <view class="category-head__main">
              <text class="category-name" :style="textPrimaryStyle">{{ category.name }}</text>
              <text class="category-count" :style="textMutedStyle">{{ category.videoCount }} 个视频</text>
            </view>
            <view
              v-if="!isProtectedCategory(category.id)"
              class="category-more"
              :style="secondaryActionStyle"
              @tap.stop="openCategoryActions(category)"
            >
              <text class="category-more__text" :style="textMutedStyle">管理</text>
            </view>
          </view>
          <text class="category-note" :style="textSecondaryStyle">{{ getCategoryNote(category) }}</text>
          <view class="category-actions">
            <view
              v-if="canImportToCategory(category.id)"
              class="action action--compact"
              :style="primaryActionStyle"
              @tap.stop="handleImport(category.id)"
            >
              <text class="action-text action-text--primary">导入到此分类</text>
            </view>
          </view>
        </view>
      </view>
        </view>
      </scroll-view>
    </view>

    <view v-if="showCategorySheet" class="sheet-mask" @tap="closeCategorySheet" />
    <view :class="['sheet-panel', showCategorySheet ? 'sheet-panel--open' : '']" :style="sheetInlineStyle">
      <view class="sheet-handle" />
      <view class="sheet-header">
        <text class="sheet-title" :style="textPrimaryStyle">{{ sheetTitle }}</text>
        <text class="sheet-close" :style="textMutedStyle" @tap="closeCategorySheet">关闭</text>
      </view>

      <view v-if="sheetMode === 'form'" class="sheet-body">
        <text class="sheet-label" :style="textSecondaryStyle">分类名称</text>
        <input
          v-model="categoryDraftName"
          class="sheet-input"
          :style="inputInlineStyle"
          maxlength="20"
          placeholder="输入分类名"
          placeholder-style="color: #8e8e93;"
          :focus="showCategorySheet"
          confirm-type="done"
          @confirm="submitCategoryForm"
        />
        <text class="sheet-hint" :style="textMutedStyle">例如：旅行、音乐、收藏、练习素材</text>
      </view>

      <view v-else class="sheet-menu">
        <view class="sheet-menu__item" @tap="startRenameCategory">
          <text class="sheet-menu__text" :style="textPrimaryStyle">重命名分类</text>
        </view>
        <view class="sheet-menu__item sheet-menu__item--danger" @tap="confirmDeleteCategory">
          <text class="sheet-menu__text sheet-menu__text--danger">删除分类</text>
          <text class="sheet-menu__hint" :style="textMutedStyle">分类中的视频会自动转移到“全部”。</text>
        </view>
      </view>

      <view v-if="sheetMode === 'form'" class="sheet-footer">
        <view class="action action--sheet" :style="primaryActionStyle" @tap="submitCategoryForm">
          <text class="action-text action-text--primary">{{ sheetSubmitLabel }}</text>
        </view>
      </view>
    </view>

    <CategoryGallerySheet
      :open="showGallerySheet"
      :title="activeCategory?.name || '分类相册'"
      :subtitle="gallerySubtitle"
      :videos="activeCategoryVideos"
      :allow-import="canImportToCategory(activeCategory?.id || '')"
      :sheet-style="sheetInlineStyle"
      :card-style="panelInlineStyle"
      :text-primary-style="textPrimaryStyle"
      :text-secondary-style="textSecondaryStyle"
      :text-muted-style="textMutedStyle"
      :primary-action-style="primaryActionStyle"
      :duration-badge-style="durationBadgeStyle"
      @close="closeGallerySheet"
      @import-category="handleGalleryImport"
      @select-video="openVideoDetail"
    />

    <LibraryVideoDetailSheet
      :open="showVideoDetailSheet"
      :video="activeVideo"
      :category-name="activeCategory?.name || '全部'"
      :sheet-style="sheetInlineStyle"
      :card-style="panelInlineStyle"
      :text-primary-style="textPrimaryStyle"
      :text-muted-style="textMutedStyle"
      :primary-action-style="primaryActionStyle"
      :secondary-action-style="secondaryActionStyle"
      @close="closeVideoDetailSheet"
      @copy="startVideoTransfer('copy')"
      @move="startVideoTransfer('move')"
      @download="handleVideoDownload"
      @delete="confirmDeleteVideo"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { storeToRefs } from 'pinia'
import CategoryGallerySheet from '@/components/business/library/CategoryGallerySheet.vue'
import LibraryVideoDetailSheet from '@/components/business/library/LibraryVideoDetailSheet.vue'
import { DEFAULT_CATEGORY_ID, FAVORITES_CATEGORY_ID } from '@/repositories/library'
import { useLibraryStore } from '@/stores/library'
import { useUserStore } from '@/stores/user'
import {
  estimateMediaFilesSize,
  formatBytes,
  getSavedFileUsageSummary,
  persistMediaFile,
  removePersistedFile,
} from '@/services/platform/file-system'
import { chooseVideos, normalizeChosenVideos, saveVideoToAlbum } from '@/services/platform/media'
import { getThemeOption } from '@/theme/presets'
import type { SavedFileUsageSummary } from '@/services/platform/file-system'
import type { Category, VideoAsset } from '@/types/domain'

type CategorySheetMode = 'form' | 'actions'
type CategoryFormMode = 'create' | 'rename'
type VideoTransferMode = 'copy' | 'move'

const DEFAULT_IMPORT_CATEGORY_ID = DEFAULT_CATEGORY_ID
const protectedCategoryIds = [DEFAULT_CATEGORY_ID, FAVORITES_CATEGORY_ID]

const userStore = useUserStore()
const libraryStore = useLibraryStore()

const { theme } = storeToRefs(userStore)
const { categories, totalVideoCount, videos } = storeToRefs(libraryStore)

const showCategorySheet = ref(false)
const sheetMode = ref<CategorySheetMode>('form')
const formMode = ref<CategoryFormMode>('create')
const categoryDraftName = ref('')
const activeCategory = ref<Category | null>(null)
const storageUsage = ref<SavedFileUsageSummary>({
  available: false,
  fileCount: 0,
  usedBytes: 0,
  limitBytes: 0,
  warning: false,
})
const showGallerySheet = ref(false)
const showVideoDetailSheet = ref(false)
const activeVideoId = ref('')
const isImporting = ref(false)

const activeTheme = computed(() => getThemeOption(theme.value))
const themeClass = computed(() => `theme--${theme.value}`)
const pageInlineStyle = computed(() => ({
  background: activeTheme.value.pageBackground,
  color: activeTheme.value.textPrimary,
}))
const panelInlineStyle = computed(() => ({
  background: activeTheme.value.surface,
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
  boxShadow: activeTheme.value.shadowSoft,
  backdropFilter: 'blur(20px)',
}))
const sheetInlineStyle = computed(() => ({
  background: activeTheme.value.surfaceHighest,
  boxShadow: activeTheme.value.shadowSoft,
  borderTop: `1rpx solid ${activeTheme.value.borderSubtle}`,
}))
const textPrimaryStyle = computed(() => ({ color: activeTheme.value.textPrimary }))
const textSecondaryStyle = computed(() => ({ color: activeTheme.value.textSecondary }))
const textMutedStyle = computed(() => ({ color: activeTheme.value.textMuted }))
const accentStyle = computed(() => ({ color: activeTheme.value.primary }))
const primaryActionStyle = computed(() => ({
  background: activeTheme.value.primary,
  border: `1rpx solid ${activeTheme.value.primary}`,
}))
const secondaryActionStyle = computed(() => ({
  background: 'transparent',
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
}))
const inputInlineStyle = computed(() => ({
  color: activeTheme.value.textPrimary,
  border: `1rpx solid ${activeTheme.value.borderSubtle}`,
  background: activeTheme.value.themeOptionBackground,
}))
const durationBadgeStyle = computed(() => ({
  color: '#ffffff',
  background: 'rgba(8, 8, 8, 0.68)',
}))
const warningPanelStyle = computed(() => ({
  background: 'rgba(255, 91, 87, 0.12)',
  border: '1rpx solid rgba(255, 91, 87, 0.24)',
  boxShadow: activeTheme.value.shadowSoft,
}))
const categoryListShellStyle = computed(() => ({
  background: 'transparent',
  border: 'none',
  boxShadow: 'none',
  backdropFilter: 'none',
}))
const storageSummaryText = computed(() => {
  if (!storageUsage.value.available) {
    return '当前未获取到本地存储统计，可继续导入并在微信开发者工具中观察容量。'
  }

  return `已保存 ${storageUsage.value.fileCount} 个文件，已用 ${formatReadableBytes(storageUsage.value.usedBytes)} / ${formatReadableBytes(storageUsage.value.limitBytes)}`
})
const sheetTitle = computed(() => {
  if (sheetMode.value === 'actions') {
    return activeCategory.value?.name || '分类管理'
  }

  return formMode.value === 'create' ? '创建分类' : '重命名分类'
})
const sheetSubmitLabel = computed(() => (formMode.value === 'create' ? '保存分类' : '更新分类'))
const activeCategoryVideos = computed(() =>
  activeCategory.value ? libraryStore.getVideosByCategory(activeCategory.value.id) : [],
)
const activeVideo = computed(
  () => activeCategoryVideos.value.find((video) => video.id === activeVideoId.value) || null,
)
const gallerySubtitle = computed(() => `${activeCategoryVideos.value.length} 个视频 · 点击封面查看详情`)

onShow(() => {
  void refreshStorageUsage()
})

function isProtectedCategory(categoryId: string) {
  return protectedCategoryIds.includes(categoryId)
}

function canImportToCategory(categoryId: string) {
  return Boolean(categoryId) && categoryId !== FAVORITES_CATEGORY_ID
}

function getCategoryNote(category: Category) {
  if (category.id === FAVORITES_CATEGORY_ID) {
    return category.videoCount
      ? '这里会自动汇总你已收藏的视频，无需重复导入或复制文件。'
      : '去播放页点击收藏，已收藏的视频会自动出现在这里。'
  }

  return category.videoCount
    ? '点开后可像相册一样查看此分类里的所有视频。'
    : '当前为空，可直接向该分类导入视频。'
}

function openCreateCategory() {
  formMode.value = 'create'
  sheetMode.value = 'form'
  activeCategory.value = null
  categoryDraftName.value = ''
  showCategorySheet.value = true
}

function openCategoryActions(category: Category) {
  activeCategory.value = category
  sheetMode.value = 'actions'
  showCategorySheet.value = true
}

function startRenameCategory() {
  if (!activeCategory.value) {
    return
  }

  formMode.value = 'rename'
  sheetMode.value = 'form'
  categoryDraftName.value = activeCategory.value.name
}

function closeCategorySheet() {
  showCategorySheet.value = false
  sheetMode.value = 'form'
  formMode.value = 'create'
  categoryDraftName.value = ''
  activeCategory.value = null
}

function submitCategoryForm() {
  try {
    if (formMode.value === 'create') {
      libraryStore.createCategory(categoryDraftName.value)
      uni.showToast({
        title: '分类已创建',
        icon: 'success',
      })
    } else {
      if (!activeCategory.value) {
        return
      }

      libraryStore.renameCategory(activeCategory.value.id, categoryDraftName.value)
      uni.showToast({
        title: '分类已更新',
        icon: 'success',
      })
    }

    closeCategorySheet()
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '分类保存失败',
      icon: 'none',
    })
  }
}

function confirmDeleteCategory() {
  if (!activeCategory.value) {
    return
  }

  const category = activeCategory.value

  uni.showModal({
    title: '删除分类',
    content: `删除“${category.name}”后，该分类中的视频会自动转移到“全部”。`,
    confirmColor: '#ff5e57',
    success: ({ confirm }) => {
      if (!confirm) {
        return
      }

      try {
        libraryStore.deleteCategory(category.id)
        uni.showToast({
          title: '分类已删除',
          icon: 'success',
        })
        closeCategorySheet()
      } catch (error) {
        uni.showToast({
          title: error instanceof Error ? error.message : '删除分类失败',
          icon: 'none',
        })
      }
    },
  })
}

function openCategoryGallery(category: Category) {
  activeCategory.value = category
  activeVideoId.value = ''
  showGallerySheet.value = true
}

function closeGallerySheet() {
  showGallerySheet.value = false
  showVideoDetailSheet.value = false
  activeVideoId.value = ''
}

function openVideoDetail(videoId: string) {
  activeVideoId.value = videoId
  showVideoDetailSheet.value = true
}

function closeVideoDetailSheet() {
  showVideoDetailSheet.value = false
  activeVideoId.value = ''
}

async function importToCategory(categoryId: string) {
  if (isImporting.value) {
    return
  }

  try {
    isImporting.value = true
    const result = await chooseVideos()
    const mediaFiles = normalizeChosenVideos(result)

    if (!mediaFiles.length) {
      return
    }

    const estimatedImportSize = estimateMediaFilesSize(mediaFiles)

    if (
      storageUsage.value.available &&
      storageUsage.value.usedBytes + estimatedImportSize > storageUsage.value.limitBytes
    ) {
      uni.showToast({
        title: '存储空间不足，建议先整理本地素材',
        icon: 'none',
      })
      return
    }

    const persistedMediaFiles: Array<
      WechatMiniprogram.MediaFile & {
        thumbTempFilePath?: string
        persistedPath?: string
      }
    > = []

    const total = mediaFiles.length

    for (const [index, file] of mediaFiles.entries()) {
      uni.showLoading({
        title: `导入 ${index + 1}/${total}`,
        mask: true,
      })

      const persisted = await persistMediaFile(file.tempFilePath)

      persistedMediaFiles.push({
        ...file,
        persistedPath: persisted.path,
      })
    }

    const imported = libraryStore.addVideosToCategory(categoryId, persistedMediaFiles)
    await refreshStorageUsage()

    const riskyVideos = imported.filter((video) => video.importHint)

    uni.showToast({
      title: `已导入 ${imported.length} 个视频`,
      icon: 'success',
    })

    if (riskyVideos.length) {
      uni.showModal({
        title: '导入完成',
        content: `其中 ${riskyVideos.length} 个视频可能存在微信小程序兼容性问题，若播放时只有声音没有画面，建议转为 H.264 编码的 MP4 后再导入。`,
        showCancel: false,
      })
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message.toLowerCase().includes('cancel')) {
      return
    }

    uni.showToast({
      title: '导入视频失败',
      icon: 'none',
    })
  } finally {
    uni.hideLoading()
    isImporting.value = false
  }
}

function handleQuickImport() {
  void importToCategory(DEFAULT_IMPORT_CATEGORY_ID)
}

function handleImport(categoryId: string) {
  void importToCategory(categoryId)
}

function handleGalleryImport() {
  if (!activeCategory.value || !canImportToCategory(activeCategory.value.id)) {
    return
  }

  void importToCategory(activeCategory.value.id)
}

function startVideoTransfer(mode: VideoTransferMode) {
  const video = activeVideo.value

  if (!video) {
    return
  }

  const destinationCategories = categories.value.filter(
    (category) => category.id !== video.categoryId && category.id !== FAVORITES_CATEGORY_ID,
  )

  if (!destinationCategories.length) {
    uni.showToast({
      title: '没有可用的目标分类',
      icon: 'none',
    })
    return
  }

  uni.showActionSheet({
    itemList: destinationCategories.map((category) => category.name),
    success: ({ tapIndex }) => {
      const targetCategory = destinationCategories[tapIndex]

      if (!targetCategory) {
        return
      }

      try {
        if (mode === 'copy') {
          libraryStore.copyVideoToCategory(video.id, targetCategory.id)
          uni.showToast({
            title: `已复制到${targetCategory.name}`,
            icon: 'success',
          })
        } else {
          libraryStore.moveVideoToCategory(video.id, targetCategory.id)
          uni.showToast({
            title: `已移动到${targetCategory.name}`,
            icon: 'success',
          })
          closeVideoDetailSheet()
        }
      } catch (error) {
        uni.showToast({
          title: error instanceof Error ? error.message : '整理视频失败',
          icon: 'none',
        })
      }
    },
  })
}

async function handleVideoDownload() {
  const video = activeVideo.value

  if (!video) {
    return
  }

  try {
    await saveVideoToAlbum(video.localPath)
    uni.showToast({
      title: '已保存到系统相册',
      icon: 'success',
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    uni.showToast({
      title: message.toLowerCase().includes('deny') ? '请允许保存到相册权限' : '保存视频失败',
      icon: 'none',
    })
  }
}

function confirmDeleteVideo() {
  const video = activeVideo.value

  if (!video) {
    return
  }

  uni.showModal({
    title: '删除视频',
    content: '删除后将从当前素材库中移除，且不可撤销。',
    confirmColor: '#ff5e57',
    success: ({ confirm }) => {
      if (!confirm) {
        return
      }

      void handleDeleteVideo(video)
    },
  })
}

async function handleDeleteVideo(video: VideoAsset) {
  try {
    const deletedVideo = libraryStore.deleteVideo(video.id)
    const hasSameLocalPath = videos.value.some((item) => item.localPath === deletedVideo.localPath)

    if (!hasSameLocalPath) {
      await removePersistedFile(deletedVideo.localPath)
    }

    await refreshStorageUsage()
    closeVideoDetailSheet()

    uni.showToast({
      title: '视频已删除',
      icon: 'success',
    })
  } catch (error) {
    uni.showToast({
      title: error instanceof Error ? error.message : '删除视频失败',
      icon: 'none',
    })
  }
}

function buildCategoryCoverStyle(category: Category) {
  if (category.coverPath) {
    return {
      backgroundImage: `url(${category.coverPath})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }

  return {
    background: activeTheme.value.themeOptionBackground,
    border: `1rpx solid ${activeTheme.value.borderSubtle}`,
  }
}

async function refreshStorageUsage() {
  storageUsage.value = await getSavedFileUsageSummary()
}

function formatReadableBytes(bytes: number) {
  return formatBytes(bytes)
}
</script>

<style scoped lang="scss">
.page-shell {
  height: 100vh;
  padding: 96rpx 40rpx 48rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  flex-shrink: 0;
}

eyebrow {
  font-size: 24rpx;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.title {
  font-size: 56rpx;
  font-weight: 700;
}

.description {
  font-size: 28rpx;
  line-height: 1.6;
}

.hero,
.empty-state,
.category-list-shell,
.category-card,
.storage-alert {
  border-radius: var(--mt-radius-card);
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
  margin-top: 28rpx;
  padding: 34rpx 32rpx;
  flex-shrink: 0;
}

.hero-copy {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.hero-title {
  font-size: 32rpx;
  font-weight: 700;
}

.hero-description,
.hero-meta,
.section-meta,
.category-count,
.category-note,
.storage-alert__copy,
.sheet-label,
.sheet-hint,
.sheet-menu__hint {
  font-size: 22rpx;
  line-height: 1.6;
}

.hero-actions,
.empty-actions,
.category-actions,
.sheet-footer {
  display: flex;
  gap: 16rpx;
}

.action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 220rpx;
  min-height: 84rpx;
  padding: 0 28rpx;
  border-radius: 9999rpx;
}

.action--primary {
  box-shadow: 0 20rpx 48rpx rgba(86, 228, 114, 0.22);
}

.action--compact,
.action--sheet {
  min-width: 0;
  flex: 1;
}

.action-text {
  font-size: 24rpx;
}

.action-text--primary {
  color: #08110c;
  font-weight: 700;
}

.storage-alert {
  margin-top: 22rpx;
  padding: 24rpx 28rpx;
  flex-shrink: 0;
}

.storage-alert__title {
  color: #ff5b57;
  font-size: 24rpx;
  font-weight: 700;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 38rpx;
  flex-shrink: 0;
}

.section-title {
  font-size: 38rpx;
  font-weight: 700;
}

.empty-state {
  margin-top: 20rpx;
  padding: 30rpx 28rpx;
}

.empty-title {
  font-size: 30rpx;
  font-weight: 700;
}

.empty-copy {
  margin-top: 12rpx;
  font-size: 24rpx;
  line-height: 1.6;
}

.empty-actions {
  margin-top: 24rpx;
}

.category-list-shell {
  margin-top: 18rpx;
  padding: 18rpx 14rpx 18rpx 18rpx;
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;
}

.category-list-scroll {
  flex: 1;
  height: 100%;
  min-height: 0;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding-right: 8rpx;
}

.category-card {
  display: flex;
  gap: 22rpx;
  padding: 22rpx;
}

.category-cover {
  width: 148rpx;
  height: 148rpx;
  border-radius: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.category-cover__fallback {
  color: rgba(255, 255, 255, 0.72);
  font-size: 28rpx;
  font-weight: 700;
}

.category-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  min-width: 0;
}

.category-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16rpx;
}

.category-head__main {
  flex: 1;
  min-width: 0;
}

.category-name {
  display: block;
  font-size: 32rpx;
  font-weight: 700;
}

.category-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 104rpx;
  min-height: 62rpx;
  padding: 0 20rpx;
  border-radius: 9999rpx;
}

.category-more__text,
.sheet-close {
  font-size: 22rpx;
}

.sheet-mask {
  position: fixed;
  inset: 0;
  background: rgba(8, 8, 8, 0.22);
}

.sheet-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  transform: translateY(102%);
  transition: transform 0.24s ease;
  padding: 20rpx 32rpx calc(34rpx + env(safe-area-inset-bottom));
  border-top-left-radius: 36rpx;
  border-top-right-radius: 36rpx;
  z-index: 20;
}

.sheet-panel--open {
  transform: translateY(0);
}

.sheet-handle {
  width: 84rpx;
  height: 8rpx;
  margin: 0 auto 24rpx;
  border-radius: 9999rpx;
  background: rgba(142, 142, 147, 0.35);
}

.sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

.sheet-title {
  font-size: 30rpx;
  font-weight: 700;
}

.sheet-body,
.sheet-menu {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  margin-top: 26rpx;
}

.sheet-input {
  width: 100%;
  min-height: 92rpx;
  padding: 0 24rpx;
  border-radius: 28rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.sheet-menu__item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  padding: 24rpx 8rpx;
}

.sheet-menu__text {
  font-size: 26rpx;
}

.sheet-menu__item--danger {
  border-top: 1rpx solid rgba(142, 142, 147, 0.18);
}

.sheet-menu__text--danger {
  color: #ff5e57;
  font-weight: 700;
}

.sheet-footer {
  margin-top: 28rpx;
}
</style>
