export async function chooseVideos() {
  return new Promise<WechatMiniprogram.ChooseMediaSuccessCallbackResult>((resolve, reject) => {
    uni.chooseMedia({
      count: 9,
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

export async function saveVideoToAlbum(filePath: string) {
  return new Promise<void>((resolve, reject) => {
    uni.saveVideoToPhotosAlbum({
      filePath,
      success: () => resolve(),
      fail: reject,
    })
  })
}
