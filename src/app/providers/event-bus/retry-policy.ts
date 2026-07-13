export const MAX_RETRY_ATTEMPTS = 5

const BASE_DELAY_MS = 30_000
const MAX_DELAY_MS = 30 * 60_000

export function nextRetryDelayMs(attempts: number): number {
  return Math.min(BASE_DELAY_MS * 2 ** attempts, MAX_DELAY_MS)
}
