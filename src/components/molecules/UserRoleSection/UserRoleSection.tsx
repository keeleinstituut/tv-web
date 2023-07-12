import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import SimpleDropdown, {
  SimpleDropdownOption,
} from 'components/molecules/SimpleDropdown/SimpleDropdown'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import useAuth from 'hooks/useAuth'

const UserRoleSection: FC = () => {
  const { t } = useTranslation()

  const { userInfo } = useAuth()

  const openInstitutionSelection = useCallback(
    () => showModal(ModalTypes.InstitutionSelect, {}),
    []
  )

  const options: SimpleDropdownOption[] = [
    { href: '/user-details', label: t('button.my_details') },
    {
      onClick: openInstitutionSelection,
      label: t('button.change_institution'),
    },
  ]

  const { forename, surname } = userInfo?.tolkevarav || {}

  const fullName = `${forename} ${surname}`

  return (
    <SimpleDropdown
      options={options}
      title={t('header.my_role')}
      label={fullName}
    />
  )
}

export default UserRoleSection
