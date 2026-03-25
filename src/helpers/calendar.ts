import dayjs from 'dayjs'

export function formatDuration(startIso: string, endIso: string): string {
  const minutes = dayjs(endIso).diff(dayjs(startIso), 'minute')
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

const TOTAL_THRESHOLD_MINUTES = 160 * 60 // >160h shown as ">160h"

export function formatMinutes(minutes: number): string {
  if (minutes >= TOTAL_THRESHOLD_MINUTES) return '>160h'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export function formatDurationMins(mins: number): string {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const hLabel = h === 1 ? 'tund' : 'tundi'
  if (h === 0) return `${m} minutit`
  if (m === 0) return `${h} ${hLabel}`
  return `${h} ${hLabel} ja ${m} minutit`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
