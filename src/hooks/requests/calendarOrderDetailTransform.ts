import type { CalendarOrderDetail } from 'types/calendar'

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

export function transformProjectDetail(
  raw: Record<string, unknown>
): CalendarOrderDetail {
  const langs =
    (raw.destination_languages_classifier_values as Array<{
      id: string
      value: string
      name: string
    }>) ?? []
  const subProjects = (raw.sub_projects ?? []) as Array<{
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

  return {
    id: raw.id as string,
    ext_id: raw.ext_id as string,
    status: raw.status as CalendarOrderDetail['status'],
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
    cancel_at: raw.cancel_at as string | undefined,
    cancelled_at: raw.cancelled_at as string | undefined,
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
