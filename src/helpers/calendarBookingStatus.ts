import type {
  CalendarProjectStatus,
  CalendarSubProjectStatus,
} from 'types/calendarTypes'

const SUB_STATUS_SET = new Set<string>([
  'REGISTERED',
  'CANCELLED',
  'TASKS_SUBMITTED_TO_VENDORS',
  'TASKS_IN_PROGRESS',
  'TASKS_COMPLETED',
  'COMPLETED',
])

const PROJECT_STATUS_SET = new Set<string>([
  'NEW',
  'REGISTERED',
  'IN_PROGRESS',
  'CANCELLED',
  'SUBMITTED_TO_CLIENT',
  'REJECTED',
  'CORRECTED',
  'ACCEPTED',
])

function normalizeEnum<T extends string>(
  raw: string | undefined | null,
  allowed: Set<string>
): T | undefined {
  if (raw == null || typeof raw !== 'string') return undefined
  const u = raw.trim().toUpperCase().replace(/-/g, '_')
  return allowed.has(u) ? (u as T) : undefined
}

export function normalizeCalendarSubProjectStatus(
  raw: string | undefined | null
): CalendarSubProjectStatus | undefined {
  return normalizeEnum<CalendarSubProjectStatus>(raw, SUB_STATUS_SET)
}

export function normalizeCalendarProjectStatus(
  raw: string | undefined | null
): CalendarProjectStatus | undefined {
  return normalizeEnum<CalendarProjectStatus>(raw, PROJECT_STATUS_SET)
}

export type CalendarBookingStatusRole = 'translator' | 'client' | 'tpm'

/**
 * When project is NEW or REGISTERED, calendar / booking UI shows sub-project status.
 * Otherwise project status. Time slot is not considered.
 * CANCELLED on either level shows cancelled.
 */
export function calendarBookingStatusLabelKey(
  projectStatusRaw: string | undefined | null,
  subProjectStatusRaw: string | undefined | null,
  role: CalendarBookingStatusRole = 'client'
): string {
  const projectStatus = normalizeCalendarProjectStatus(projectStatusRaw)
  const subProjectStatus = normalizeCalendarSubProjectStatus(subProjectStatusRaw)

  if (projectStatus === 'CANCELLED' || subProjectStatus === 'CANCELLED') {
    return 'calendar.status_cancelled'
  }

  if (projectStatus === 'NEW' || projectStatus === 'REGISTERED') {
    return subProjectStatusToLabelKey(subProjectStatus)
  }

  return projectStatusToLabelKey(projectStatus, role)
}

function subProjectStatusToLabelKey(
  sub: CalendarSubProjectStatus | undefined
): string {
  switch (sub) {
    case 'REGISTERED':
      return 'calendar.subproject_status_registered'
    case 'TASKS_SUBMITTED_TO_VENDORS':
      return 'calendar.status_forwarded'
    case 'TASKS_IN_PROGRESS':
      return 'calendar.subproject_status_tasks_in_progress'
    case 'TASKS_COMPLETED':
      return 'calendar.subproject_status_tasks_completed'
    case 'COMPLETED':
      return 'calendar.subproject_status_completed'
    default:
      return 'calendar.status_pending'
  }
}

function projectStatusToLabelKey(
  project: CalendarProjectStatus | undefined,
  role: CalendarBookingStatusRole
): string {
  switch (project) {
    case 'NEW':
      return 'calendar.status_pending'
    case 'REGISTERED':
      return 'calendar.subproject_status_registered'
    case 'IN_PROGRESS':
      return 'calendar.status_in_progress'
    case 'CANCELLED':
      return 'calendar.status_cancelled'
    case 'SUBMITTED_TO_CLIENT':
      return 'calendar.project_status_submitted_to_client'
    case 'REJECTED':
      return 'calendar.project_status_rejected'
    case 'CORRECTED':
      return 'calendar.project_status_corrected'
    case 'ACCEPTED':
      return 'calendar.project_status_accepted'
    default:
      return role === 'translator'
        ? 'calendar.status_ongoing'
        : 'calendar.status_confirmed'
  }
}
