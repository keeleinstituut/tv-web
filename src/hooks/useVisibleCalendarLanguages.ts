import { FORALL_LANGUAGE } from 'helpers/calendar'
import {
  useFetchCalendarLanguages,
  useFetchCalendarTranslatorLanguages,
} from 'hooks/requests/useCalendar'
import { useCalendarContext } from 'components/contexts/CalendarContext'
import { useCalendarRole } from 'hooks/useCalendarRole'

export function useVisibleCalendarLanguages() {
  const { focusedLanguageId } = useCalendarContext()
  const { isTranslator } = useCalendarRole()
  const { languages: allLanguages } = useFetchCalendarLanguages()
  const { languages: translatorLanguages } = useFetchCalendarTranslatorLanguages()

  const languages = isTranslator ? translatorLanguages : allLanguages

  const sorted = [...languages].sort(
    (a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
  )

  const withFallback =
    isTranslator && sorted.length === 0 ? [FORALL_LANGUAGE] : sorted

  const visibleLanguages = focusedLanguageId
    ? withFallback.filter((l) => l.language.id === focusedLanguageId)
    : withFallback

  return { languages, allLanguages, visibleLanguages }
}
