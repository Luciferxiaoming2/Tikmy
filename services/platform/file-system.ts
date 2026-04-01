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

function getMiniProgramUserDataPath() {
  if (typeof wx !== 'undefined' && wx.env?.USER_DATA_PATH) {
    return wx.env.USER_DATA_PATH
  }

  return ''
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

export async function ensureUserDataDirectory(dirName: string) {
  const fileSystemManager = getMiniProgramFileSystemManager()
  const userDataPath = getMiniProgramUserDataPath()

  if (!fileSystemManager || !userDataPath) {
    throw new Error('当前环境不支持本地目录创建')
  }

  const targetPath = `${userDataPath}/${dirName}`

  await new Promise<void>((resolve, reject) => {
    fileSystemManager.mkdir({
      dirPath: targetPath,
      recursive: true,
      success: () => resolve(),
      fail: (error) => {
        const message = String(error?.errMsg || '')

        if (message.includes('file already exists')) {
          resolve()
          return
        }

        reject(error)
      },
    })
  })

  return targetPath
}

export async function writeUserDataTextFile(filePath: string, content: string) {
  const fileSystemManager = getMiniProgramFileSystemManager()

  if (!fileSystemManager) {
    throw new Error('当前环境不支持本地文件写入')
  }

  await new Promise<void>((resolve, reject) => {
    fileSystemManager.writeFile({
      filePath,
      data: content,
      encoding: 'utf8',
      success: () => resolve(),
      fail: reject,
    })
  })
}

export async function readTextFile(filePath: string) {
  const fileSystemManager = getMiniProgramFileSystemManager()

  if (!fileSystemManager) {
    throw new Error('当前环境不支持本地文件读取')
  }

  const result = await new Promise<{ data: string | ArrayBuffer }>((resolve, reject) => {
    fileSystemManager.readFile({
      filePath,
      encoding: 'utf8',
      success: resolve,
      fail: reject,
    })
  })

  return typeof result.data === 'string' ? result.data : ''
}

export async function checkFileExists(filePath: string) {
  if (!filePath) {
    return false
  }

  const fileSystemManager = getMiniProgramFileSystemManager()

  if (!fileSystemManager) {
    return false
  }

  try {
    await new Promise<void>((resolve, reject) => {
      fileSystemManager.access({
        path: filePath,
        success: () => resolve(),
        fail: reject,
      })
    })

    return true
  } catch {
    return false
  }
}

export function getUserDataPath() {
  return getMiniProgramUserDataPath()
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
