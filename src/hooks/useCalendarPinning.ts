import {
  useFetchCalendarLanguages,
  useUpdatePinnedLanguages,
} from 'hooks/requests/useCalendar'

export function useCalendarPinning() {
  const { languages: allLanguages } = useFetchCalendarLanguages()
  const { mutate: updatePinned } = useUpdatePinnedLanguages()

  const pinnedCount = allLanguages.filter((l) => l.pinned).length

  const handleTogglePin = (langId: string) => {
    const lang = allLanguages.find((l) => l.language.id === langId)
    if (!lang) return
    const institution_main_language_id =
      lang.language.institution_main_language_id
    if (!institution_main_language_id) return
    const isPinned = lang.pinned
    if (!isPinned && pinnedCount >= 3) return
    updatePinned({ institution_main_language_id, pin: !isPinned })
  }

  return { handleTogglePin, pinnedCount }
}
