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

  const sorted = [...languages].sort(
    (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
  )

  const visibleLanguages = focusedLanguageId
    ? sorted.filter((l) => l.language.id === focusedLanguageId)
    : sorted

  return {
    languages,
    visibleLanguages,
    isLoading,
    isError,
  }
}
