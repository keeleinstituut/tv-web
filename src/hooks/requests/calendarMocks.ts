import dayjs from 'dayjs'
import {
  CalendarLanguagesResponse,
  CalendarWeekVendorsResponse,
  CalendarMonthVendorsResponse,
} from 'types/calendar'

export const MOCK_LANGUAGES: CalendarLanguagesResponse = {
  languages: [
    {
      language: {
        id: 'lang-ru',
        type: 'LANGUAGE',
        value: 'ru',
        name: 'Vene keel',
        meta: { iso3_code: 'rus' },
      },
      pinned: true,
    },
    {
      language: {
        id: 'lang-en',
        type: 'LANGUAGE',
        value: 'en',
        name: 'Inglise keel',
        meta: { iso3_code: 'eng' },
      },
      pinned: true,
    },
    {
      language: {
        id: 'lang-de',
        type: 'LANGUAGE',
        value: 'de',
        name: 'Saksa keel',
        meta: { iso3_code: 'deu' },
      },
      pinned: false,
    },
    {
      language: {
        id: 'lang-fi',
        type: 'LANGUAGE',
        value: 'fi',
        name: 'Soome keel',
        meta: { iso3_code: 'fin' },
      },
      pinned: false,
      is_rare: true,
    },
  ],
}

export const MOCK_VENDORS = [
  { id: 'v1', institution_user: { id: 'u1', name: 'Anna Bergmann' }, is_internal: true },
  { id: 'v2', institution_user: { id: 'u2', name: 'Boris Dmitrov' }, is_internal: true },
  { id: 'v3', institution_user: { id: 'u3', name: 'Fiona Hall' }, is_internal: false },
  { id: 'v4', institution_user: { id: 'u4', name: 'Karl Liiv' }, is_internal: true },
  { id: 'v5', institution_user: { id: 'u5', name: 'Mari Vaher' }, is_internal: false },
  { id: 'v6', institution_user: { id: 'u6', name: 'Mati Tamm' }, is_internal: true },
  { id: 'v7', institution_user: { id: 'u7', name: 'Raili Lepp' }, is_internal: false },
]

// Deterministic pseudo-random based on a numeric seed
const seededRandom = (seed: number): number => {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

export const mockWeekVendors = (
  date: string,
  languageId: string
): CalendarWeekVendorsResponse => {
  const d = dayjs(date)
  const dow = d.day()
  const monday = d.add(dow === 0 ? -6 : 1 - dow, 'day')
  const days = Array.from({ length: 7 }, (_, i) =>
    monday.add(i, 'day').format('YYYY-MM-DD')
  )
  const blocks = ['00:00', '06:00', '12:00', '18:00']
  return {
    language_id: languageId,
    week_start: days[0],
    week_end: days[6],
    vendors: MOCK_VENDORS.map((v, vi) => ({
      ...v,
      slots: days.flatMap((day, di) =>
        blocks.map((block, bi) => {
          const onVacation =
            vi === 2 && (di === 0 || (di === 1 && bi === 1) || di === 2)
          return {
            start_at: `${day}T${block}:00Z`,
            end_at: `${day}T${blocks[(bi + 1) % 4] || '24:00'}:00Z`,
            available: onVacation
              ? false
              : vi === 0
                ? false
                : bi === 1 || bi === 2
                  ? seededRandom(vi * 31 + di * 7 + bi) > 0.3
                  : false,
            booked_hours: onVacation ? undefined : vi === 0 ? 6 : undefined,
            on_vacation: onVacation || undefined,
          }
        })
      ),
    })),
  }
}

export const mockMonthVendors = (
  date: string,
  languageId: string
): CalendarMonthVendorsResponse => {
  const d = dayjs(date)
  const monthStart = d.startOf('month')
  const daysInMonth = d.daysInMonth()
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    monthStart.add(i, 'day').format('YYYY-MM-DD')
  )
  return {
    language_id: languageId,
    month: d.format('YYYY-MM'),
    vendors: MOCK_VENDORS.map((v, vi) => ({
      ...v,
      slots: days.map((day, di) => {
        const dow = dayjs(day).day()
        const isWeekend = dow === 0 || dow === 6
        const isAB = vi === 0
        return {
          date: day,
          available: !isWeekend,
          booked_hours: isWeekend
            ? undefined
            : isAB
              ? 7
              : Math.floor(seededRandom(vi * 37 + di + 100) * 6),
        }
      }),
    })),
  }
}
