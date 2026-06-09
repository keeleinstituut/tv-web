import type {
  ApiCalendarDayClientShape,
  ApiCalendarDayResponse,
  ApiCalendarDayTpmShape,
  ApiCalendarDayVendorShape,
  ApiCalendarLanguagesResponse,
  ApiCalendarMonthClientShape,
  ApiCalendarMonthResponse,
  ApiCalendarMonthTpmShape,
  ApiCalendarWeekClientShape,
  ApiCalendarWeekResponse,
  ApiCalendarWeekTpmShape,
  ApiCalendarWeekVendorShape,
  ApiUnassignedProject,
  ApiVendorCalendarEntry,
  ApiVendorExpand,
  BookedSlot,
  BookedSlotAssignment,
  CalendarDayResponse,
  CalendarLanguage,
  CalendarLanguagesResponse,
  CalendarMonthResponse,
  CalendarWeekResponse,
  VendorDayData,
  VendorMonthData,
  VendorMonthSlot,
  VendorWeekData,
  VendorWeekSlot,
} from './calendarTypes'
import {
  normalizeCalendarProjectStatus,
  normalizeCalendarSubProjectStatus,
} from 'helpers/calendarBookingStatus'
import { sortVendors } from 'helpers/calendar'

export function transformLanguages(
  api: ApiCalendarLanguagesResponse
): CalendarLanguagesResponse {
  const pinnedIds = new Set(
    api.pinned_languages?.map((p) => p.institution_main_language_id)
  )
  const seen = new Set<string>()
  const languages: CalendarLanguage[] = []

  for (const main of api.main_languages ?? []) {
    const lang = main.language
    if (seen.has(lang.id)) continue
    seen.add(lang.id)
    languages.push({
      language: {
        id: lang.id,
        institution_main_language_id: main.id,
        type: lang.type ?? 'LANGUAGE',
        value: lang.value,
        name: lang.name,
        meta: { iso3_code: lang.meta?.iso3_code ?? '' },
      },
      pinned: pinnedIds.has(main.id),
    })
  }

  for (const lang of api.project_languages ?? []) {
    if (seen.has(lang.id)) continue
    seen.add(lang.id)
    languages.push({
      language: {
        id: lang.id,
        institution_main_language_id: undefined,
        type: lang.type ?? 'LANGUAGE',
        value: lang.value,
        name: lang.name,
        meta: { iso3_code: lang.meta?.iso3_code ?? '' },
      },
      pinned: false,
    })
  }

  return { languages }
}

// ---- Day transforms ----

function isVendorDayShape(
  api: ApiCalendarDayResponse
): api is ApiCalendarDayVendorShape {
  return 'calendar_entries' in api && !('available_slots' in api)
}

function isTpmDayShape(
  api: ApiCalendarDayResponse,
  isTPM?: boolean
): api is ApiCalendarDayTpmShape {
  if (!('available_slots' in api)) return false
  const tpm = api as ApiCalendarDayTpmShape
  if (!Array.isArray(tpm.available_slots)) return false
  // Empty array: fall back to role hint
  if (tpm.available_slots.length === 0 && 'vendors' in api)
    return isTPM === true
  return 'vendor_ids' in (tpm.available_slots[0] ?? {})
}

/**
 * For TPM/client, use the project's event times instead of the calendar entry
 * times, since the entry includes buffer time padding.
 */
function entryTimesForNonVendor(e: ApiVendorCalendarEntry) {
  const proj = e.assignment?.subProject?.project
  return {
    start_at:
      e.type === 'assignment' && proj?.event_start_at
        ? proj.event_start_at
        : e.start_at,
    end_at:
      e.type === 'assignment' && proj?.event_end_at
        ? proj.event_end_at
        : e.end_at,
  }
}

function buildAssignmentFromEntry(
  e: ApiVendorCalendarEntry
): BookedSlotAssignment | null {
  if (!e.assignment_id) return null
  const subProj = e.assignment?.subProject
  const proj = subProj?.project
  const clientUser = proj?.client_institution_user
  const managerUser = proj?.manager_institution_user
  const projectId =
    proj?.id ??
    subProj?.project_id ??
    e.assignment?.sub_project_id ??
    e.assignment_id
  return {
    id: e.assignment_id,
    vendor_id: e.vendor_id || undefined,
    status: e.assignment?.status as BookedSlotAssignment['status'],
    project_status: normalizeCalendarProjectStatus(proj?.status ?? null),
    service_type: proj?.service_type,
    location: proj?.location,
    meeting_link: proj?.meeting_link,
    reference_number: proj?.reference_number,
    client: clientUser
      ? {
          name: [clientUser.user?.forename, clientUser.user?.surname]
            .filter(Boolean)
            .join(' '),
          institution: clientUser.institution?.name ?? '',
          email: clientUser.email ?? '',
          phone: clientUser.phone ?? '',
        }
      : undefined,
    coordinator: managerUser
      ? {
          name: [managerUser.user?.forename, managerUser.user?.surname]
            .filter(Boolean)
            .join(' '),
          email: managerUser.email ?? '',
          phone: managerUser.phone ?? '',
        }
      : undefined,
    sub_project: {
      id: projectId,
      ext_id: proj?.ext_id ?? e.assignment?.ext_id ?? '',
      source_language: { id: '', value: '', name: '' },
      destination_language: { id: '', value: '', name: '' },
      status: normalizeCalendarSubProjectStatus(subProj?.status ?? null),
    },
  }
}

function destinationLangIdsFromCalendarEntry(
  e: ApiVendorCalendarEntry
): string[] {
  const id = e.assignment?.subProject?.destination_language_classifier_value_id
  return id ? [id] : []
}

function appendClientBookingIfNew(
  byLanguage: Record<string, BookedSlot[]>,
  langId: string,
  slot: BookedSlot,
  dedupeAssignmentId: string
) {
  if (!byLanguage[langId]) byLanguage[langId] = []
  const exists = byLanguage[langId].some(
    (s) => s.type === 'assignment' && s.assignment?.id === dedupeAssignmentId
  )
  if (!exists) byLanguage[langId].push(slot)
}

export function transformDayResponse(
  api: ApiCalendarDayResponse,
  isTPM?: boolean
): CalendarDayResponse {
  if (isVendorDayShape(api)) {
    // Translator shape: own calendar entries, no language breakdown available
    const vendorShape = api as ApiCalendarDayVendorShape
    return {
      current_time: new Date().toISOString(),
      booked_slots: vendorShape.calendar_entries.map((e) => ({
        start_at: e.start_at,
        end_at: e.end_at,
        type: e.type,
        assignment: buildAssignmentFromEntry(e),
      })),
      booked_slots_by_language: {},
    }
  }

  if (isTpmDayShape(api, isTPM)) {
    const tpm = api as ApiCalendarDayTpmShape
    const vendorsByLanguage = new Map<string, VendorDayData[]>()
    for (const v of tpm.vendors) {
      for (const langId of v.languages) {
        const langEntries = (v.calendar_entries ?? []).filter((e) => {
          if (e.type !== 'assignment') return true
          const destLangId =
            e.assignment?.subProject?.destination_language_classifier_value_id
          return !destLangId || destLangId === langId
        })
        const vendorData: VendorDayData = {
          id: v.id,
          institution_user: {
            id: v.institutionUser?.id ?? v.id,
            name: v.institutionUser
              ? `${v.institutionUser.user.forename} ${v.institutionUser.user.surname}`.trim()
              : v.id,
          },
          is_emo: v.emergency_schedules.length > 0,
          booked_slots: langEntries.map((e) => {
            const times = entryTimesForNonVendor(e)
            return {
              start_at: times.start_at,
              end_at: times.end_at,
              type: e.type,
              assignment: buildAssignmentFromEntry(e),
            }
          }),
          available_slots: tpm.available_slots
            .filter((s) => s.vendor_ids.includes(v.id))
            .map((s) => ({ start_at: s.start_at, end_at: s.end_at })),
        }
        if (!vendorsByLanguage.has(langId)) vendorsByLanguage.set(langId, [])
        vendorsByLanguage.get(langId)!.push(vendorData)
      }
    }

    const languageIds = Array.from(
      new Set(tpm.vendors.flatMap((v) => v.languages))
    )
    const tpmVendors = languageIds.map((langId) => ({
      language_id: langId,
      vendors: sortVendors(vendorsByLanguage.get(langId) ?? []),
    }))

    return {
      current_time: new Date().toISOString(),
      booked_slots: [],
      booked_slots_by_language: {},
      tpm_vendors: tpmVendors,
    }
  }

  // Client shape: booked_slots grouped by language_id
  const clientShape = api as ApiCalendarDayClientShape

  const assignmentEntries = (clientShape.calendar_entries ?? []).filter(
    (e) => e.type === 'assignment' && e.assignment_id
  )

  const findOverlappingEntry = (startAt: string, endAt: string) =>
    assignmentEntries.find(
      (e) =>
        new Date(e.start_at) < new Date(endAt) &&
        new Date(e.end_at) > new Date(startAt)
    )

  const unassigned = clientShape.unassigned_projects ?? []
  const findOverlappingUnassigned = (startAt: string, endAt: string) =>
    unassigned.find((p) => {
      const pStart = new Date(p.event_start_at)
      const pEnd = p.event_end_at ? new Date(p.event_end_at) : null
      if (pEnd) {
        return pStart < new Date(endAt) && pEnd > new Date(startAt)
      }
      return pStart >= new Date(startAt) && pStart < new Date(endAt)
    })

  function buildAssignmentFromUnassigned(
    p: ApiUnassignedProject
  ): BookedSlotAssignment {
    return {
      id: p.id,
      project_status: normalizeCalendarProjectStatus(p.status),
      sub_project: {
        id: p.id,
        ext_id: p.ext_id,
        source_language: { id: '', value: '', name: '' },
        destination_language: { id: '', value: '', name: '' },
      },
      service_type: (p.service_type as 'REMOTE' | 'ON_SITE') ?? undefined,
      location: p.location ?? undefined,
      meeting_link: p.meeting_link ?? undefined,
    }
  }

  const byLanguage: Record<string, BookedSlot[]> = {}
  for (const slot of clientShape.booked_slots ?? []) {
    const entry = findOverlappingEntry(slot.start_at, slot.end_at)
    const unassignedProject = !entry
      ? findOverlappingUnassigned(slot.start_at, slot.end_at)
      : null
    const isOwn = !!entry || !!unassignedProject
    // Client should only see their own orders, not other vendors' busy slots
    if (!isOwn) continue
    for (const langId of slot.languages) {
      if (!byLanguage[langId]) byLanguage[langId] = []
      const entryTimes = entry ? entryTimesForNonVendor(entry) : null
      byLanguage[langId].push({
        start_at: entryTimes?.start_at ?? slot.start_at,
        end_at: entryTimes?.end_at ?? slot.end_at,
        type: entry?.type ?? 'assignment',
        assignment: entry
          ? buildAssignmentFromEntry(entry)
          : unassignedProject
            ? buildAssignmentFromUnassigned(unassignedProject)
            : null,
      })
    }
  }

  // When the API omits vendor busy windows in booked_slots (common for clients),
  // calendar_entries + unassigned_projects still list the user's orders — merge
  // them so rows show clickable assignment blocks instead of generic "Hõivatud".
  const assignedProjectIds = new Set(
    assignmentEntries
      .map((e) => e.assignment?.subProject?.project?.id)
      .filter((id): id is string => !!id)
  )

  for (const e of assignmentEntries) {
    const built = buildAssignmentFromEntry(e)
    if (!built || !e.assignment_id) continue
    const times = entryTimesForNonVendor(e)
    const slot: BookedSlot = {
      start_at: times.start_at,
      end_at: times.end_at,
      type: 'assignment',
      assignment: built,
    }
    for (const langId of destinationLangIdsFromCalendarEntry(e)) {
      appendClientBookingIfNew(byLanguage, langId, slot, e.assignment_id)
    }
  }

  for (const p of unassigned) {
    if (assignedProjectIds.has(p.id)) continue
    const slot: BookedSlot = {
      start_at: p.event_start_at,
      end_at: p.event_end_at ?? p.event_start_at,
      type: 'assignment',
      assignment: buildAssignmentFromUnassigned(p),
    }
    for (const langId of p.destination_language_classifier_value_ids ?? []) {
      appendClientBookingIfNew(byLanguage, langId, slot, p.id)
    }
  }

  const availByLanguage: Record<
    string,
    Array<{ start_at: string; end_at: string }>
  > = {}
  for (const slot of clientShape.available_slots ?? []) {
    for (const langId of slot.languages) {
      if (!availByLanguage[langId]) availByLanguage[langId] = []
      availByLanguage[langId].push({
        start_at: slot.start_at,
        end_at: slot.end_at,
      })
    }
  }
  return {
    current_time: new Date().toISOString(),
    booked_slots: [],
    booked_slots_by_language: byLanguage,
    available_slots_by_language: availByLanguage,
  }
}

// ---- Vendor data builders ----

function vendorName(v: ApiVendorExpand): string {
  const u = v.institutionUser?.user
  return [u?.forename, u?.surname].filter(Boolean).join(' ')
}

function buildVendorWeekData(
  v: ApiVendorExpand,
  langSlots: Array<{ start_at: string; end_at: string; vendor_ids: string[] }>,
  weekStart: string
): VendorWeekData {
  const slots: VendorWeekSlot[] = []
  if (weekStart) {
    for (let day = 0; day < 7; day++) {
      for (let block = 0; block < 4; block++) {
        const blockHour = block * 6
        const matchingSlot = langSlots.find((s) => {
          const h = new Date(s.start_at).getUTCHours()
          const d = s.start_at.slice(0, 10)
          const wd = new Date(new Date(weekStart).getTime() + day * 86400000)
            .toISOString()
            .slice(0, 10)
          return d === wd && h === blockHour
        })
        const available = matchingSlot
          ? matchingSlot.vendor_ids.includes(v.id)
          : false
        const dateStr = new Date(new Date(weekStart).getTime() + day * 86400000)
          .toISOString()
          .slice(0, 10)
        const onVacation = v.emergency_schedules.some(
          (es) => dateStr >= es.start_date && dateStr <= es.end_date
        )
        const bookedHours = (v.calendar_entries ?? [])
          .filter((e) => {
            if (e.type !== 'assignment') return false
            const times = entryTimesForNonVendor(e)
            const eDate = times.start_at.slice(0, 10)
            const eHour = new Date(times.start_at).getUTCHours()
            return (
              eDate === dateStr && eHour >= blockHour && eHour < blockHour + 6
            )
          })
          .reduce((sum, e) => {
            const times = entryTimesForNonVendor(e)
            return (
              sum +
              (new Date(times.end_at).getTime() -
                new Date(times.start_at).getTime()) /
                3600000
            )
          }, 0)
        slots.push({
          start_at: new Date(
            new Date(weekStart).getTime() + day * 86400000 + blockHour * 3600000
          ).toISOString(),
          end_at: new Date(
            new Date(weekStart).getTime() +
              day * 86400000 +
              (blockHour + 6) * 3600000
          ).toISOString(),
          available,
          ...(onVacation ? { on_vacation: true } : {}),
          ...(bookedHours > 0 ? { booked_hours: bookedHours } : {}),
        })
      }
    }
  }
  return {
    id: v.id,
    institution_user: { id: v.institutionUser?.id ?? '', name: vendorName(v) },
    is_emo: v.emergency_schedules.length > 0,
    slots,
  }
}

function buildVendorMonthData(
  v: ApiVendorExpand,
  langSlots: Array<{ date: string; vendor_hours: Record<string, number> }>,
  month: string
): VendorMonthData {
  const slots: VendorMonthSlot[] = []
  if (month) {
    const start = new Date(`${month}-01`)
    const year = start.getUTCFullYear()
    const mon = start.getUTCMonth()
    const daysInMonth = new Date(year, mon + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${month}-${String(d).padStart(2, '0')}`
      const daySlot = langSlots.find((s) => s.date === dateStr)
      const bookedHours = daySlot?.vendor_hours[v.id] ?? 0
      const available = daySlot !== undefined
      const onVacation = v.emergency_schedules.some(
        (es) => dateStr >= es.start_date && dateStr <= es.end_date
      )
      slots.push({
        date: dateStr,
        available,
        ...(bookedHours > 0 ? { booked_hours: bookedHours } : {}),
        ...(onVacation ? { on_vacation: true } : {}),
      })
    }
  }
  return {
    id: v.id,
    institution_user: { id: v.institutionUser?.id ?? '', name: vendorName(v) },
    is_emo: v.emergency_schedules.length > 0,
    slots,
  }
}

// ---- Week transforms ----

function isWeekTpmShape(
  api: ApiCalendarWeekResponse
): api is ApiCalendarWeekTpmShape {
  return 'available_slots' in api && 'vendors' in api
}

function isWeekVendorShape(
  api: ApiCalendarWeekResponse
): api is ApiCalendarWeekVendorShape {
  if (!('slots' in api)) return false
  const s = (api as ApiCalendarWeekVendorShape).slots
  return Array.isArray(s) && (s.length === 0 || 'calendar_entries' in s[0])
}

export function transformWeekResponse(
  api: ApiCalendarWeekResponse,
  weekStart?: string,
  weekEnd?: string
): CalendarWeekResponse {
  const wStart = weekStart ?? ''
  const wEnd = weekEnd ?? ''

  if (isWeekTpmShape(api)) {
    const tpm = api as ApiCalendarWeekTpmShape
    const languageIds = Array.from(
      new Set(tpm.available_slots.map((s) => s.language_id))
    )
    const tpmVendors = languageIds.map((langId) => {
      const langSlots = tpm.available_slots.filter(
        (s) => s.language_id === langId
      )
      const langVendorIds = Array.from(
        new Set(langSlots.flatMap((s) => s.vendor_ids))
      )
      return {
        language_id: langId,
        vendors: sortVendors(
          tpm.vendors
            .filter((v) => langVendorIds.includes(v.id))
            .map((v) => buildVendorWeekData(v, langSlots, wStart))
        ),
      }
    })
    return {
      current_time: new Date().toISOString(),
      week_start: wStart,
      week_end: wEnd,
      languages: languageIds.map((langId) => {
        const langSlots = tpm.available_slots.filter(
          (s) => s.language_id === langId
        )
        return {
          language_id: langId,
          total_vendors: tpm.vendors.filter((v) => v.languages.includes(langId))
            .length,
          slots: langSlots.map((s) => ({
            start_at: s.start_at,
            end_at: s.end_at,
            working_hours: 6,
            available_vendors: s.vendor_ids.length,
            my_bookings_count: 0,
          })),
        }
      }),
      tpm_vendors: tpmVendors,
    }
  }

  if (isWeekVendorShape(api)) {
    const vendor = api as ApiCalendarWeekVendorShape
    const languageIds = Array.from(
      new Set(vendor.slots.map((s) => s.language_id))
    )
    const assignmentHours = (entries: ApiVendorCalendarEntry[]) =>
      entries
        .filter((e) => e.type === 'assignment')
        .reduce(
          (sum, e) =>
            sum +
            (new Date(e.end_at).getTime() - new Date(e.start_at).getTime()) /
              3600000,
          0
        )
    return {
      current_time: new Date().toISOString(),
      week_start: wStart,
      week_end: wEnd,
      languages: languageIds.map((langId) => ({
        language_id: langId,
        total_vendors: 0,
        slots: vendor.slots
          .filter((s) => s.language_id === langId)
          .map((s) => {
            const entries = s.calendar_entries ?? []
            const assignmentEntries = entries.filter(
              (e) => e.type === 'assignment'
            )
            const bookingCount = assignmentEntries.length
            return {
              start_at: s.start_at,
              end_at: s.end_at,
              working_hours: assignmentHours(entries),
              available_vendors: 0,
              my_bookings_count: bookingCount,
              my_bookings: assignmentEntries.map((e) => ({
                start_at: e.start_at,
                end_at: e.end_at,
                type: e.type,
                assignment: buildAssignmentFromEntry(e),
              })),
            }
          }),
      })),
    }
  }

  // Client shape
  const client = api as ApiCalendarWeekClientShape
  const languageIds = Array.from(
    new Set(client.slots.map((s) => s.language_id))
  )
  return {
    current_time: new Date().toISOString(),
    week_start: wStart,
    week_end: wEnd,
    languages: languageIds.map((langId) => ({
      language_id: langId,
      total_vendors:
        client.slots.find((s) => s.language_id === langId)?.total_vendors ?? 0,
      slots: client.slots
        .filter((s) => s.language_id === langId)
        .map((s) => ({
          start_at: s.start_at,
          end_at: s.end_at,
          working_hours: 6,
          available_vendors: s.available_vendors,
          my_bookings_count: 0,
        })),
    })),
  }
}

// ---- Month transforms ----

function isMonthTpmShape(
  api: ApiCalendarMonthResponse
): api is ApiCalendarMonthTpmShape {
  return 'available_slots' in api && 'vendors' in api
}

export function transformMonthResponse(
  api: ApiCalendarMonthResponse,
  month?: string
): CalendarMonthResponse {
  const m = month ?? ''

  if (isMonthTpmShape(api)) {
    const tpm = api as ApiCalendarMonthTpmShape
    const languageIds = Array.from(
      new Set(tpm.available_slots.map((s) => s.language_id))
    )
    const tpmVendors = languageIds.map((langId) => {
      const langSlots = tpm.available_slots.filter(
        (s) => s.language_id === langId
      )
      const langVendorIds = Array.from(
        new Set(langSlots.flatMap((s) => Object.keys(s.vendor_hours)))
      )
      return {
        language_id: langId,
        vendors: sortVendors(
          tpm.vendors
            .filter((v) => langVendorIds.includes(v.id))
            .map((v) => buildVendorMonthData(v, langSlots, m))
        ),
      }
    })
    return {
      current_time: new Date().toISOString(),
      month: m,
      languages: languageIds.map((langId) => ({
        language_id: langId,
        total_vendors: tpm.vendors.filter((v) => v.languages.includes(langId))
          .length,
        slots: tpm.available_slots
          .filter((s) => s.language_id === langId)
          .map((s) => ({
            date: s.date,
            working_hours: 8,
            available_vendors: Object.keys(s.vendor_hours).length,
            my_bookings_count: 0,
          })),
      })),
      tpm_vendors: tpmVendors,
    }
  }

  // Vendor/Client shape
  const client = api as ApiCalendarMonthClientShape
  const languageIds = Array.from(
    new Set(client.slots.map((s) => s.language_id))
  )
  return {
    current_time: new Date().toISOString(),
    month: m,
    languages: languageIds.map((langId) => ({
      language_id: langId,
      total_vendors: 0,
      slots: client.slots
        .filter((s) => s.language_id === langId)
        .map((s) => ({
          date: s.date,
          working_hours: s.vendor_hours,
          available_vendors: 0,
          my_bookings_count: 0,
        })),
    })),
  }
}
