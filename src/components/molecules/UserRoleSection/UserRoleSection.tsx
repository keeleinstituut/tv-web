import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import SimpleDropdown, {
  SimpleDropdownOption,
} from 'components/molecules/SimpleDropdown/SimpleDropdown'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import { size } from 'lodash'
import useAuth from 'hooks/useAuth'
import { useInstitutionsFetch } from 'hooks/requests/useInstitutions'

const UserRoleSection: FC = () => {
  const { t } = useTranslation()
  const { institutions: fetchedInstitutions, isLoading } =
    useInstitutionsFetch()

  const { userInfo } = useAuth()

  const openInstitutionSelection = useCallback(
    () =>
      showModal(ModalTypes.InstitutionSelect, {
        institutions: fetchedInstitutions,
        onSelect: () => {
          window.location.reload()
        },
      }),
    [fetchedInstitutions]
  )

  const shouldShowInstitutionSelection =
    size(fetchedInstitutions) > 1 && !isLoading

  const options: SimpleDropdownOption[] = [
    { href: '/user-details', label: t('button.my_details') },
    ...(shouldShowInstitutionSelection
      ? [
          {
            onClick: openInstitutionSelection,
            label: t('button.change_institution'),
          },
        ]
      : []),
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
