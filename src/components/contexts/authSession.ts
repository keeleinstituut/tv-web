export interface AuthContextData {
  authenticated?: boolean
  sessionExpiry?: number
}

export const SESSION_NOTIFICATION_THRESHOLDS = [3600, 1800, 60, 30]

export function isSessionExpiredAt(
  now: number,
  sessionExpiry: number | undefined
): boolean {
  if (sessionExpiry === undefined) {
    return false
  }

  return now >= sessionExpiry
}

export function shouldLogoutAfterExpiryCheck(
  now: number,
  freshContext: AuthContextData | undefined
): boolean {
  if (!freshContext?.authenticated) {
    return true
  }

  return isSessionExpiredAt(now, freshContext.sessionExpiry)
}

export function getNotificationThreshold(
  remainingSeconds: number
): number | undefined {
  return SESSION_NOTIFICATION_THRESHOLDS.filter((i) => remainingSeconds >= i)[0]
}
