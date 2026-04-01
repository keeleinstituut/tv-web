import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'components/contexts/AuthContext'
import { useFetchInstitutionUserVendor } from 'hooks/requests/useVendors'
import Loader from 'components/atoms/Loader/Loader'
import PageNotFound from 'pages/PageNotFound/PageNotFound'
import CalendarSettings from 'components/organisms/CalendarSettings/CalendarSettings'

const CalendarSettingsPage: FC = () => {
  const { t } = useTranslation()
  const { userInfo } = useAuth()
  const userId = userInfo?.tolkevarav?.institutionUserId || ''
  const { isLoading, vendor } = useFetchInstitutionUserVendor(userId)

  if (isLoading) return <Loader loading />
  if (!vendor?.is_internal) return <PageNotFound />

  return (
    <>
      <h1>{t('calendar_settings.title')}</h1>
      <CalendarSettings />
    </>
  )
}

export default CalendarSettingsPage
