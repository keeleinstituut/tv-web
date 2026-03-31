import { useTranslation } from 'react-i18next'
import {
  useFetchCalendarLanguages,
  useUpdatePinnedLanguages,
} from 'hooks/requests/useCalendar'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'

export function useCalendarPinning() {
  const { t } = useTranslation()
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
    if (!isPinned && pinnedCount >= 3) {
      showNotification({
        type: NotificationTypes.Warning,
        title: t('notification.announcement'),
        content: t('calendar.pin_limit_reached'),
      })
      return
    }
    updatePinned({ institution_main_language_id, pin: !isPinned })
  }

  return { handleTogglePin, pinnedCount }
}
