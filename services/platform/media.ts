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

export function normalizeChosenVideos(result: WechatMiniprogram.ChooseMediaSuccessCallbackResult) {
  return (result.tempFiles || []) as Array<
    WechatMiniprogram.MediaFile & {
      thumbTempFilePath?: string
    }
  >
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
