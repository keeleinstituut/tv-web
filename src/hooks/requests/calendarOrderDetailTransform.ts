import { normalizeCalendarSubProjectStatus } from 'helpers/calendarBookingStatus'
import type { CalendarOrderDetail } from 'types/calendar'

/** Walk nested `{ data: { id, ... } }` bodies from the translation-order API. */
export function unwrapCalendarProjectPayload(res: unknown): Record<string, unknown> {
  let cur: Record<string, unknown> =
    res && typeof res === 'object' && !Array.isArray(res)
      ? (res as Record<string, unknown>)
      : {}
  for (let i = 0; i < 5; i++) {
    const inner = cur.data
    if (
      inner &&
      typeof inner === 'object' &&
      !Array.isArray(inner) &&
      typeof (inner as Record<string, unknown>).id === 'string'
    ) {
      cur = inner as Record<string, unknown>
    } else {
      break
    }
  }
  return cur
}

/** Merge JSON:API-style `attributes` onto the root for field reads. */
function mergeResourceAttributes(
  raw: Record<string, unknown>
): Record<string, unknown> {
  const attrs = raw.attributes
  if (attrs && typeof attrs === 'object' && !Array.isArray(attrs)) {
    return { ...raw, ...(attrs as Record<string, unknown>) }
  }
  return raw
}

function pickOptionalIsoString(
  raw: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const k of keys) {
    const v = raw[k]
    if (typeof v === 'string' && v.length > 0) return v
  }
  return undefined
}

function pickCancelAt(raw: Record<string, unknown>): string | undefined {
  let v = pickOptionalIsoString(raw, 'cancel_at', 'cancelAt')
  if (v) return v
  const sps = raw.sub_projects
  if (!Array.isArray(sps)) return undefined
  for (const sp of sps) {
    if (!sp || typeof sp !== 'object' || Array.isArray(sp)) continue
    v = pickOptionalIsoString(sp as Record<string, unknown>, 'cancel_at', 'cancelAt')
    if (v) return v
  }
  return undefined
}

function mapProjectMediaList(
  raw: unknown
): NonNullable<CalendarOrderDetail['source_files']> {
  if (!Array.isArray(raw)) return []
  return raw.map((item) => {
    const f = item as Record<string, unknown>
    const cn = f.collection_name as string | undefined
    return {
      id: String(f.id ?? ''),
      name: String(f.name ?? ''),
      file_name: String(f.file_name ?? ''),
      size: Number(f.size ?? 0),
      collection_name:
        cn === 'help' || cn === 'source' || cn === 'final' ? cn : undefined,
    }
  })
}

/**
 * Transform GET /assignments/{id} response into CalendarOrderDetail.
 *
 * The assignment response nests: assignment → subProject → project.
 * We pull the project-level fields from the nested project object.
 */
export function transformAssignmentDetail(
  rawInput: Record<string, unknown>
): CalendarOrderDetail {
  const raw = mergeResourceAttributes(rawInput)
  const subProject = raw.subProject as Record<string, unknown> | undefined
  const project = subProject?.project as Record<string, unknown> | undefined

  const destLang = subProject?.destination_language_classifier_value as
    | { id: string; value: string; name: string }
    | undefined
  const lang = destLang ?? { id: '', value: '', name: '' }

  const clientUser = project?.client_institution_user as
    | {
        id: string
        email?: string
        phone?: string
        user?: { forename?: string; surname?: string }
        institution?: { name?: string }
      }
    | undefined

  const coordinatorUser = project?.manager_institution_user as
    | {
        email?: string
        phone?: string
        user?: { forename?: string; surname?: string }
      }
    | undefined

  const assigneeVendor = raw.assignee as
    | {
        institution_user?: {
          email?: string
          phone?: string
          user?: { forename?: string; surname?: string }
        }
      }
    | undefined
  const assigneeIU = assigneeVendor?.institution_user

  const sub_project_status = normalizeCalendarSubProjectStatus(
    (subProject?.status as string) ?? null
  )

  const projectStatus = (project?.status as string) ?? (raw.status as string)

  return {
    id: (project?.id as string) ?? (raw.id as string),
    ext_id: (project?.ext_id as string) ?? (raw.ext_id as string),
    status: projectStatus as CalendarOrderDetail['status'],
    sub_project_status,
    language: lang,
    start_at:
      (raw.event_start_at as string) ??
      (project?.event_start_at as string) ??
      '',
    end_at: (project?.event_end_at as string) ?? (raw.deadline_at as string) ?? '',
    service_type: (
      (project?.service_type as string) ?? ''
    ).toUpperCase() as 'REMOTE' | 'ON_SITE',
    location: project?.location as string | undefined,
    meeting_link: project?.meeting_link as string | undefined,
    reference_number: project?.reference_number as string | undefined,
    created_at: raw.created_at as string,
    updated_at: raw.updated_at as string | undefined,
    accepted_at: project?.accepted_at as string | undefined,
    cancel_at: pickOptionalIsoString(project ?? {}, 'cancel_at', 'cancelAt'),
    cancelled_at: pickOptionalIsoString(
      project ?? {},
      'cancelled_at',
      'cancelledAt'
    ),
    completed_at: project?.completed_at as string | undefined,
    client_institution_user: clientUser ? { id: clientUser.id } : undefined,
    client: clientUser
      ? {
          name:
            [clientUser.user?.forename, clientUser.user?.surname]
              .filter(Boolean)
              .join(' ') || '',
          institution: clientUser.institution?.name ?? '',
          email: clientUser.email ?? '',
          phone: clientUser.phone ?? '',
        }
      : undefined,
    coordinator: coordinatorUser
      ? {
          name:
            [coordinatorUser.user?.forename, coordinatorUser.user?.surname]
              .filter(Boolean)
              .join(' ') || '',
          email: coordinatorUser.email ?? '',
          phone: coordinatorUser.phone ?? '',
        }
      : undefined,
    vendor: assigneeIU
      ? {
          name:
            [assigneeIU.user?.forename, assigneeIU.user?.surname]
              .filter(Boolean)
              .join(' ') || '',
          email: assigneeIU.email ?? '',
          phone: assigneeIU.phone ?? '',
        }
      : undefined,
    tags: project?.tags as CalendarOrderDetail['tags'],
    source_files: [
      ...mapProjectMediaList(project?.help_files),
      ...mapProjectMediaList(project?.source_files),
      ...mapProjectMediaList(subProject?.source_files),
    ],
    files_count: 0,
    files_accessible: true,
    project_comments:
      project?.project_comments as CalendarOrderDetail['project_comments'],
  }
}

export function transformProjectDetail(
  rawInput: Record<string, unknown>
): CalendarOrderDetail {
  const raw = mergeResourceAttributes(rawInput)
  const langs =
    (raw.destination_languages_classifier_values as Array<{
      id: string
      value: string
      name: string
    }>) ?? []
  const subProjects = (raw.sub_projects ?? []) as Array<{
    status?: string
    destination_language_classifier_value?: {
      id: string
      value: string
      name: string
    }
  }>
  const lang = langs[0] ??
    subProjects[0]?.destination_language_classifier_value ?? {
      id: '',
      value: '',
      name: '',
    }

  const clientUser = raw.client_institution_user as
    | {
        id: string
        email?: string
        phone?: string
        user?: { forename?: string; surname?: string }
        institution?: { name?: string }
      }
    | undefined

  const coordinatorUser = raw.manager_institution_user as
    | {
        email?: string
        phone?: string
        user?: { forename?: string; surname?: string }
      }
    | undefined

  const assignments = (subProjects[0] as Record<string, unknown> | undefined)
    ?.assignments as Array<Record<string, unknown>> | undefined
  const translationAssignment = assignments?.find((a) => {
    const jd = a?.job_definition as { job_key?: string } | undefined
    return jd?.job_key === 'job_translation'
  })
  const assignee = translationAssignment?.assignee as
    | {
        institution_user?: {
          email?: string
          phone?: string
          user?: { forename?: string; surname?: string }
        }
      }
    | undefined
  const candidates = translationAssignment?.candidates as
    | Array<{
        vendor?: {
          institution_user?: {
            email?: string
            phone?: string
            user?: { forename?: string; surname?: string }
          }
        }
      }>
    | undefined
  const vendorIU =
    assignee?.institution_user ?? candidates?.[0]?.vendor?.institution_user

  const sub_project_status = normalizeCalendarSubProjectStatus(
    subProjects[0]?.status ?? null
  )

  return {
    id: raw.id as string,
    ext_id: raw.ext_id as string,
    status: raw.status as CalendarOrderDetail['status'],
    sub_project_status,
    language: lang,
    start_at: (raw.event_start_at as string) ?? (raw.start_at as string),
    end_at: (raw.event_end_at as string) ?? (raw.end_at as string),
    service_type: ((raw.service_type as string) ?? '').toUpperCase() as
      | 'REMOTE'
      | 'ON_SITE',
    location: raw.location as string | undefined,
    meeting_link: raw.meeting_link as string | undefined,
    reference_number: raw.reference_number as string | undefined,
    created_at: raw.created_at as string,
    updated_at: raw.updated_at as string | undefined,
    accepted_at: raw.accepted_at as string | undefined,
    cancel_at: pickCancelAt(raw),
    cancelled_at: pickOptionalIsoString(raw, 'cancelled_at', 'cancelledAt'),
    completed_at: raw.completed_at as string | undefined,
    client_institution_user: clientUser ? { id: clientUser.id } : undefined,
    client: clientUser
      ? {
          name:
            [clientUser.user?.forename, clientUser.user?.surname]
              .filter(Boolean)
              .join(' ') || '',
          institution: clientUser.institution?.name ?? '',
          email: clientUser.email ?? '',
          phone: clientUser.phone ?? '',
        }
      : undefined,
    coordinator: coordinatorUser
      ? {
          name:
            [coordinatorUser.user?.forename, coordinatorUser.user?.surname]
              .filter(Boolean)
              .join(' ') || '',
          email: coordinatorUser.email ?? '',
          phone: coordinatorUser.phone ?? '',
        }
      : undefined,
    vendor: vendorIU
      ? {
          name:
            [vendorIU.user?.forename, vendorIU.user?.surname]
              .filter(Boolean)
              .join(' ') || '',
          email: vendorIU.email ?? '',
          phone: vendorIU.phone ?? '',
        }
      : undefined,
    tags: raw.tags as CalendarOrderDetail['tags'],
    source_files: [
      ...mapProjectMediaList(raw.help_files),
      ...mapProjectMediaList(raw.source_files),
    ],
    files_count: (raw.files_count as number) ?? 0,
    files_accessible: (raw.files_accessible as boolean) ?? false,
    project_comments:
      raw.project_comments as CalendarOrderDetail['project_comments'],
  }
}
