import {
  useFetchCalendarLanguages,
  useUpdatePinnedLanguages,
} from 'hooks/requests/useCalendar'

export function useCalendarPinning() {
  const { languages: allLanguages } = useFetchCalendarLanguages()
  const { mutate: updatePinned } = useUpdatePinnedLanguages()

  const pinnedCount = allLanguages.filter((l) => l.pinned).length

  const handleTogglePin = (langId: string) => {
    const currentPinned = allLanguages
      .filter((l) => l.pinned)
      .map((l) => l.language.id)
    if (!currentPinned.includes(langId) && currentPinned.length >= 3) return
    const newPinned = currentPinned.includes(langId)
      ? currentPinned.filter((id) => id !== langId)
      : [...currentPinned, langId]
    updatePinned(newPinned)
  }

  return { handleTogglePin, pinnedCount }
}
