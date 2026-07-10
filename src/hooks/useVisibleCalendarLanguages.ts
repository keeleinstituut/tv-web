import { useMemo } from 'react'
import { useFetchCalendarLanguages } from 'hooks/requests/useCalendar'
import { useCalendarPanel } from 'components/contexts/CalendarContext'

export function useVisibleCalendarLanguages(
  dateFrom?: string,
  dateTo?: string
) {
  const { focusedLanguageId } = useCalendarPanel()
  const { languages, isLoading, isError } = useFetchCalendarLanguages(
    dateFrom,
    dateTo
  )

  const visibleLanguages = useMemo(() => {
    const sorted = [...languages].sort(
      (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
    )
    return focusedLanguageId
      ? sorted.filter((l) => l.language.id === focusedLanguageId)
      : sorted
  }, [languages, focusedLanguageId])

  return { languages, visibleLanguages, isLoading, isError }
}
