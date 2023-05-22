import { FC, useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { isEmpty, map, includes } from 'lodash'
import RoleForm from 'components/organisms/RoleForm/RoleForm'
import { useRolesFetch } from 'hooks/requests/roles'
import Loader from 'components/atoms/Loader/Loader'
import Tabs from 'components/molecules/Tabs/Tabs'
import classes from './styles.module.scss'
import useAuth from 'hooks/useAuth'
import { RoleType } from 'types/roles'

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
  const { userPrivileges } = useAuth()
  const [activeTab, setActiveTab] = useState<string>()
  const [tabNames, setTabNames] = useState({})

  const [temporaryRoles, setTemporaryRoles] = useState<RoleType[]>([])

  useEffect(() => {
    if (!isEmpty(existingRoles) && !activeTab) {
      setActiveTab(existingRoles[0].id)
    }
  }, [activeTab, existingRoles])

  // const onTabNameEdit = useCallback(
  //   (id: string, newName: string) => {
  //     setTabNames({
  //       ...tabNames,
  //       [id]: newName,
  //     })
  //   },
  //   [tabNames]
  // )

  const addTemporaryTab = () => {
    // TODO
  }

  if (loading) {
    return <Loader loading />
  }
  if (isError) {
    // TODO: might add actual error pages or might just not show RoleForm
    return <div />
  }
  // TODO: we will map roles once we have tabs
  return (
    <>
      <Tabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={[...existingRoles, ...temporaryRoles]}
        className={classes.tabsContainer}
        // onEditInput={onTabNameEdit}
        onAddPress={addTemporaryTab}
        addLabel={t('button.add_new_role')}
        addDisabled={!includes(userPrivileges, 'ADD_ROLE')}
      />
      {map([...existingRoles, ...temporaryRoles], (role) => {
        return (
          <RoleForm
            hidden={activeTab !== role.id}
            key={role.id}
            {...role}
            // name={tabNames[role.id] || role.name}
            allPrivileges={allPrivileges}
          />
        )
      })}
    </>
  )
}

export default RolesTabs
