import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import type { ServiceType } from 'types/calendar'

dayjs.extend(utc)

export function apiServiceTypeToForm(
  st?: 'REMOTE' | 'ON_SITE' | null
): ServiceType {
  if (st === 'REMOTE') return 'kaugtolge'
  if (st === 'ON_SITE') return 'kontakttolge'
  return ''
}

/** UTC ISO-8601 without fractional seconds (calendar API). */
export function toCalendarApiDateTime(isoOrLocal: string): string {
  const d = dayjs(isoOrLocal)
  if (!d.isValid()) return isoOrLocal
  return d.utc().format('YYYY-MM-DDTHH:mm:ss') + 'Z'
}

/** Compare two id lists regardless of order (e.g. domain tag ids). */
export function areSortedIdArraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  const sa = [...a].sort()
  const sb = [...b].sort()
  for (let i = 0; i < sa.length; i++) {
    if (sa[i] !== sb[i]) return false
  }
  return true
}

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

export function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function sortVendors<
  T extends { is_emo: boolean; institution_user: { name: string } }
>(vendors: T[]): T[] {
  return [...vendors].sort((a, b) => {
    if (a.is_emo !== b.is_emo) return a.is_emo ? -1 : 1
    return a.institution_user.name.localeCompare(b.institution_user.name)
  })
}
