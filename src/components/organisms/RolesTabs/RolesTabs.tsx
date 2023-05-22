import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import RoleForm from 'components/organisms/RoleForm/RoleForm'
import { useRolesFetch } from 'hooks/requests/roles'
import Loader from 'components/atoms/Loader/Loader'

const RolesTabs: FC = () => {
  const { t } = useTranslation()
  // TODO: create separate hook wrapper for most queries later to avoid automatic running
  // instead get the fetch function from them and call manually during mount
  const {
    existingRoles = [],
    allPrivileges = [],
    loading,
    isError,
  } = useRolesFetch()

  if (loading) {
    return <Loader loading />
  }
  if (isError) {
    // TODO: might add actual error pages or might just not show RoleForm
    return <div />
  }
  // TODO: we will map roles once we have tabs
  return <RoleForm {...existingRoles?.[0]} allPrivileges={allPrivileges} />
}

export default RolesTabs
