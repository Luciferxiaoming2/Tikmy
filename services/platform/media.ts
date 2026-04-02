type ChosenVideoFile = WechatMiniprogram.MediaFile & {
  thumbTempFilePath?: string
}

export async function chooseVideos(options?: { count?: number }) {
  return new Promise<WechatMiniprogram.ChooseMediaSuccessCallbackResult>((resolve, reject) => {
    uni.chooseMedia({
      count: Math.max(1, Math.min(20, Math.round(options?.count || 9))),
      mediaType: ['video'],
      sourceType: ['album'],
      success: resolve,
      fail: reject,
    })
  })
}

export async function chooseOriginalVideo() {
  return new Promise<{
    tempFilePath: string
    size?: number
    duration?: number
    width?: number
    height?: number
    fileType?: string
    thumbTempFilePath?: string
  }>((resolve, reject) => {
    uni.chooseVideo({
      sourceType: ['album'],
      compressed: false,
      success: (result) =>
        resolve({
          tempFilePath: result.tempFilePath,
          size: result.size,
          duration: result.duration,
          width: result.width,
          height: result.height,
          fileType: (result as { fileType?: string }).fileType,
          thumbTempFilePath: (result as { thumbTempFilePath?: string }).thumbTempFilePath,
        }),
      fail: reject,
    })
  })
}

export function normalizeChosenVideos(
  result:
    | WechatMiniprogram.ChooseMediaSuccessCallbackResult
    | {
        tempFilePath: string
        size?: number
        duration?: number
        width?: number
        height?: number
        fileType?: string
        thumbTempFilePath?: string
      },
) {
  if ('tempFiles' in result) {
    return (result.tempFiles || []) as ChosenVideoFile[]
  }

  if (!result.tempFilePath) {
    return []
  }

  return [
    {
      tempFilePath: result.tempFilePath,
      size: result.size,
      duration: result.duration,
      width: result.width,
      height: result.height,
      thumbTempFilePath: result.thumbTempFilePath,
      fileType: result.fileType || 'video',
    },
  ] as ChosenVideoFile[]
}

export function detectVideoImportHint(
  file: WechatMiniprogram.MediaFile & {
    tempFilePath?: string
    fileType?: string
    width?: number
    height?: number
  },
) {
  const source = `${file.tempFilePath || ''}|${file.fileType || ''}`.toLowerCase()
  const riskyContainer = ['.mov', '.mkv', '.avi', '.webm'].some((ext) => source.includes(ext))

  if (riskyContainer) {
    return '该视频容器格式在微信小程序里可能出现只有声音没有画面的情况，建议优先使用 H.264 编码的 MP4。'
  }

  if (!file.width || !file.height) {
    return '该视频缺少完整画面元数据，微信小程序内可能存在兼容性问题。'
  }

  return ''
}

export async function saveVideoToAlbum(filePath: string) {
  return new Promise<void>((resolve, reject) => {
    uni.saveVideoToPhotosAlbum({
      filePath,
      success: () => resolve(),
      fail: reject,
    })
  })
}
