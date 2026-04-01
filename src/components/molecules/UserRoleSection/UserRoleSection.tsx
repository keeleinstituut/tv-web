import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import SimpleDropdown, {
  SimpleDropdownOption,
} from 'components/molecules/SimpleDropdown/SimpleDropdown'
import { size } from 'lodash'
import { useAuth } from 'components/contexts/AuthContext'
import { useFetchInstitutionUserVendor } from 'hooks/requests/useVendors'

const UserRoleSection: FC = () => {
  const { t } = useTranslation()
  const { userInfo, institutions, openInstitutionSelectModal } = useAuth()
  const userId = userInfo?.tolkevarav?.institutionUserId || ''
  const { vendor } = useFetchInstitutionUserVendor(userId)

  const openInstitutionSelection = useCallback(() => {
    openInstitutionSelectModal({
      onSelect: (id: string) => {
        window.location.href = '/'
      },
    })
  }, [openInstitutionSelectModal])

  const shouldShowInstitutionSelection = size(institutions) > 1

  const dropDownOptions: SimpleDropdownOption[] = [
    { href: '/user-details', label: t('button.my_details') },
  ]

  if (vendor?.is_internal) {
    dropDownOptions.push({
      href: '/calendar-settings',
      label: t('calendar_settings.title'),
    })
  }

  if (shouldShowInstitutionSelection) {
    dropDownOptions.push({
      onClick: openInstitutionSelection,
      label: t('button.change_institution'),
    })
  }

  const { forename, surname } = userInfo?.tolkevarav || {}

  const fullName = `${forename} ${surname}`

  return (
    <SimpleDropdown
      options={dropDownOptions}
      title={t('header.my_role')}
      label={fullName}
    />
  )
}

export default UserRoleSection
