import { FC, useMemo } from 'react'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import LanguageChanger from 'components/molecules/LanguageChanger/LanguageChanger'
import UserRoleSection from 'components/molecules/UserRoleSection/UserRoleSection'
import { useAuth } from 'components/contexts/AuthContext'
import { useInstitutionFetch } from 'hooks/requests/useInstitutions'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from 'api'
import { useCalendarRole } from 'hooks/useCalendarRole'

const Header: FC = () => {
  const { t } = useTranslation()
  const { logout, userInfo } = useAuth()
  const { isTPM, isClient, isTranslator } = useCalendarRole()
  const calendarRole = isTPM ? 'TPM' : isClient ? 'Client' : isTranslator ? 'Vendor' : 'Unknown'
  const { selectedInstitution } = userInfo?.tolkevarav || {}
  const institutionId = selectedInstitution?.id || ''
  const { institution } = useInstitutionFetch({
    id: institutionId,
  })

  const logoQuery = useQuery({
    enabled: !!institution,
    queryKey: ['institution', institution?.id, 'logo'],
    queryFn: () => {
      const logo_url = institution?.logo_url

      if (!logo_url) {
        return
      }
      return apiClient.get(logo_url, {}, { responseType: 'blob' })
    },
  })

  const logo = useMemo(() => {
    if (!logoQuery.data) {
      return ''
    }

    const urlCreator = window.URL || window.webkitURL
    return urlCreator.createObjectURL(logoQuery.data)
  }, [logoQuery])

  return (
    <header className={classes.header}>
      <img src={logo} alt={t('alt.header_logo')} />
      <div className={classes.rightSection}>
        {import.meta.env.DEV && (
          <span style={{ fontSize: 12, color: '#888', fontFamily: 'monospace' }}>
            [{calendarRole}]
          </span>
        )}
        <LanguageChanger />
        <div className={classes.separator} />
        <UserRoleSection />
        <div className={classes.separator} />
        <Button
          appearance={AppearanceTypes.Text}
          children={t('button.log_out')}
          onClick={logout}
          className={classes.logoutButton}
          size={SizeTypes.M}
        />
      </div>
    </header>
  )
}

export default Header
