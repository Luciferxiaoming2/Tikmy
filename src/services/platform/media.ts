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
