export function startBiometricAuth() {
  return uni.startSoterAuthentication({
    requestAuthModes: ['fingerPrint', 'facial'],
    challenge: 'mytik_unlock',
    authContent: '验证身份以解锁 MyTik',
  })
}
