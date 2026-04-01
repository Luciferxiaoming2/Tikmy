const MINI_PROGRAM_STORAGE_LIMIT_BYTES = 200 * 1024 * 1024
const MINI_PROGRAM_STORAGE_WARNING_BYTES = 160 * 1024 * 1024

export interface SavedFileUsageSummary {
  available: boolean
  fileCount: number
  usedBytes: number
  limitBytes: number
  warning: boolean
}

interface SavedFileEntry {
  size?: number
}

function getMiniProgramFileSystemManager() {
  if (typeof wx !== 'undefined' && typeof wx.getFileSystemManager === 'function') {
    return wx.getFileSystemManager()
  }

  return null
}

export async function persistMediaFile(tempFilePath: string) {
  const fileSystemManager = getMiniProgramFileSystemManager()

  try {
    const result = await new Promise<{ savedFilePath: string }>((resolve, reject) => {
      if (fileSystemManager) {
        fileSystemManager.saveFile({
          tempFilePath,
          success: resolve,
          fail: reject,
        })
        return
      }

      uni.saveFile({
        tempFilePath,
        success: resolve,
        fail: reject,
      })
    })

    return {
      persisted: true,
      path: result.savedFilePath,
    }
  } catch {
    return {
      persisted: false,
      path: tempFilePath,
    }
  }
}

export async function getSavedFileUsageSummary(): Promise<SavedFileUsageSummary> {
  const fileSystemManager = getMiniProgramFileSystemManager()

  try {
    const result = await new Promise<{ fileList: SavedFileEntry[] }>((resolve, reject) => {
      if (fileSystemManager) {
        fileSystemManager.getSavedFileList({
          success: resolve,
          fail: reject,
        })
        return
      }

      uni.getSavedFileList({
        success: resolve,
        fail: reject,
      })
    })

    const usedBytes = result.fileList.reduce((total, file) => total + Number(file.size || 0), 0)

    return {
      available: true,
      fileCount: result.fileList.length,
      usedBytes,
      limitBytes: MINI_PROGRAM_STORAGE_LIMIT_BYTES,
      warning: usedBytes >= MINI_PROGRAM_STORAGE_WARNING_BYTES,
    }
  } catch {
    return {
      available: false,
      fileCount: 0,
      usedBytes: 0,
      limitBytes: MINI_PROGRAM_STORAGE_LIMIT_BYTES,
      warning: false,
    }
  }
}

export async function removePersistedFile(filePath: string) {
  if (!filePath || !filePath.startsWith('wxfile://')) {
    return {
      removed: false,
    }
  }

  try {
    const fileSystemManager = getMiniProgramFileSystemManager()

    await new Promise<void>((resolve, reject) => {
      if (fileSystemManager) {
        fileSystemManager.removeSavedFile({
          filePath,
          success: () => resolve(),
          fail: reject,
        })
        return
      }

      uni.removeSavedFile({
        filePath,
        success: () => resolve(),
        fail: reject,
      })
    })

    return {
      removed: true,
    }
  } catch {
    return {
      removed: false,
    }
  }
}

export function estimateMediaFilesSize(
  mediaFiles: Array<WechatMiniprogram.MediaFile & { size?: number }>,
) {
  return mediaFiles.reduce((total, file) => total + Number(file.size || 0), 0)
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
