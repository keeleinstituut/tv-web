import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import RolesTabs from 'components/organisms/RolesTabs/RolesTabs'
import endpoints from 'api/endpoints'
import { useQuery } from '@tanstack/react-query'

// TODO: WIP - implement this page

const RolesManagement: FC = () => {
  const { t } = useTranslation()
  const { isLoading, error, data } = useQuery({
    queryKey: ['roles'],
    queryFn: () => fetch(endpoints.ROLES).then((res) => res.json()),
  })
  console.warn('request done with useQuery', isLoading, error, data)
  return (
    <>
      <h1>{t('roles.roles_management')}</h1>
      <RolesTabs />
    </>
  )
}

export default RolesManagement
