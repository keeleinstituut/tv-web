import { FORALL_LANGUAGE } from 'helpers/calendar'
import {
  useFetchCalendarLanguages,
  useFetchCalendarTranslatorLanguages,
} from 'hooks/requests/useCalendar'
import { useCalendarPanel } from 'components/contexts/CalendarContext'
import { useCalendarRole } from 'hooks/useCalendarRole'

export function useVisibleCalendarLanguages() {
  const { focusedLanguageId } = useCalendarPanel()
  const { isTranslator } = useCalendarRole()
  const { languages: allLanguages, isLoading, isError } = useFetchCalendarLanguages()
  const { languages: translatorLanguages, isLoading: isTranslatorLoading, isError: isTranslatorError } = useFetchCalendarTranslatorLanguages()

  const languages = isTranslator ? translatorLanguages : allLanguages

  const sorted = [...languages].sort(
    (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
  )

  const withFallback =
    isTranslator && sorted.length === 0 ? [FORALL_LANGUAGE] : sorted

  const visibleLanguages = focusedLanguageId
    ? withFallback.filter((l) => l.language.id === focusedLanguageId)
    : withFallback

  return {
    languages,
    visibleLanguages,
    isLoading: isTranslator ? isTranslatorLoading : isLoading,
    isError: isTranslator ? isTranslatorError : isError,
  }
}
