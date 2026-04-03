export const PRIVACY_PASSCODE_LENGTH = 6

export function normalizePrivacyPasscode(value: string) {
  return (value || '').replace(/\D/g, '').slice(0, PRIVACY_PASSCODE_LENGTH)
}

export function validatePrivacyPasscode(value: string) {
  const normalized = normalizePrivacyPasscode(value)

  if (!normalized) {
    return '\u8bf7\u5148\u8f93\u5165 6 \u4f4d\u5bc6\u7801'
  }

  if (normalized.length !== PRIVACY_PASSCODE_LENGTH) {
    return '\u9690\u79c1\u5bc6\u7801\u9700\u8981 6 \u4f4d\u6570\u5b57'
  }

  return ''
}

export function comparePrivacyPasscodes(firstValue: string, secondValue: string) {
  const first = normalizePrivacyPasscode(firstValue)
  const second = normalizePrivacyPasscode(secondValue)

  if (!second) {
    return '\u8bf7\u518d\u786e\u8ba4\u4e00\u6b21\u9690\u79c1\u5bc6\u7801'
  }

  if (first !== second) {
    return '\u4e24\u6b21\u8f93\u5165\u7684\u5bc6\u7801\u4e0d\u4e00\u81f4'
  }

  return ''
}
