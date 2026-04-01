import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { STORAGE_KEYS } from '@/constants/storage'
import { getStorageItem, setStorageItem } from '@/services/storage/kv'
import type { CommentItem } from '@/types/domain'

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export const useCommentStore = defineStore('comments', () => {
  const comments = ref<CommentItem[]>(getStorageItem<CommentItem[]>(STORAGE_KEYS.comments, []))

  function persistComments() {
    setStorageItem(STORAGE_KEYS.comments, comments.value)
  }

  function getCommentsByVideoId(videoId: string) {
    return comments.value
      .filter((comment) => comment.videoId === videoId)
      .sort((left, right) => left.timestamp - right.timestamp)
  }

  function addComment(videoId: string, content: string, timestamp: number) {
    const normalizedContent = content.trim()

    if (!normalizedContent) {
      throw new Error('评论内容不能为空')
    }

    const item: CommentItem = {
      id: createId('comment'),
      videoId,
      content: normalizedContent,
      timestamp,
      source: 'self',
      createdAt: Date.now(),
    }

    comments.value = [...comments.value, item]
    persistComments()

    return item
  }

  function replaceComments(nextComments: CommentItem[]) {
    comments.value = Array.isArray(nextComments) ? nextComments : []
    persistComments()
  }

  function importBackupComments(nextComments: CommentItem[], videoIdMap: Map<string, string>) {
    const importedComments = nextComments.flatMap((comment, index) => {
      const nextVideoId = videoIdMap.get(comment.videoId)

      if (!nextVideoId) {
        return []
      }

      return [
        {
          ...comment,
          id: createId(`comment_import_${index}`),
          videoId: nextVideoId,
          createdAt: Date.now() + index,
        },
      ]
    })

    if (!importedComments.length) {
      return 0
    }

    comments.value = [...comments.value, ...importedComments]
    persistComments()

    return importedComments.length
  }

  const totalCommentCount = computed(() => comments.value.length)

  return {
    comments,
    totalCommentCount,
    getCommentsByVideoId,
    addComment,
    replaceComments,
    importBackupComments,
  }
})
