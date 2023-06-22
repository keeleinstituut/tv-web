import { FC, useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { isEmpty, map, includes, omit, filter } from 'lodash'
import RoleForm from 'components/organisms/forms/RoleForm/RoleForm'
import { v4 as uuidv4 } from 'uuid'
import { useRolesFetch } from 'hooks/requests/useRoles'
import Loader from 'components/atoms/Loader/Loader'
import Tabs from 'components/molecules/Tabs/Tabs'
import classes from './styles.module.scss'
import useAuth from 'hooks/useAuth'
import { RoleType } from 'types/roles'
import { Privileges } from 'types/privileges'

interface ObjectType {
  [key: string]: string
}

// TODO: this logic needs improvements

const RolesTabs: FC = () => {
  const { t } = useTranslation()
  const {
    existingRoles = [],
    allPrivileges = [],
    isLoading,
    isError,
  } = useRolesFetch()
  const { userPrivileges } = useAuth()
  const [activeTab, setActiveTab] = useState<string>()
  const [tabNames, setTabNames] = useState<ObjectType>({})
  const [temporaryRoles, setTemporaryRoles] = useState<RoleType[]>([])

  useEffect(() => {
    if (!isEmpty(existingRoles) && !activeTab) {
      setActiveTab(existingRoles[0].id)
    }
  }, [activeTab, existingRoles])

  const addTemporaryTab = () => {
    const newTemporaryRole = {
      id: `temp-${uuidv4()}`,
      name: undefined,
      privileges: [],
    }
    setTemporaryRoles([...temporaryRoles, newTemporaryRole])
    setActiveTab(newTemporaryRole.id)
  }

  const onChangeName = useCallback(
    (id: string, newValue: string) => {
      setTabNames({
        ...tabNames,
        [id]: newValue,
      })
    },
    [tabNames]
  )

  const onResetForm = useCallback(
    (id: string) => {
      setTabNames(omit(tabNames, id))
    },
    [tabNames]
  )

  const removeTemporaryRole = useCallback(
    (id: string, newId?: string) => {
      setTemporaryRoles(
        filter(temporaryRoles, ({ id: roleId }) => roleId !== id)
      )
      setActiveTab(newId || existingRoles[0].id)
    },
    [existingRoles, temporaryRoles]
  )

  if (isLoading) {
    return <Loader loading />
  }
  if (isError) {
    // TODO: might add actual error pages or might just not show RoleForm
    return <div />
  }

  console.log('existingRoles', existingRoles)

  const filteredArray = filter(existingRoles, {
    name: 'Test roll',
  })

  console.log('filteredArray', filteredArray)

  const mappedFilteredArray = map(filteredArray, (mainUserId) => {
    return mainUserId?.id
  })

  console.log('mappedFilteredArray', mappedFilteredArray)

  return (
    <>
      <Tabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={[...existingRoles, ...temporaryRoles]}
        className={classes.tabsContainer}
        onChangeName={onChangeName}
        tabNames={tabNames}
        onAddPress={addTemporaryTab}
        addLabel={t('button.add_new_role')}
        addDisabled={!includes(userPrivileges, Privileges.AddRole)}
      />
      {map([...existingRoles, ...temporaryRoles], (role) => {
        console.log('[...existingRoles, ...temporaryRoles]', [
          ...existingRoles,
          ...temporaryRoles,
        ])
        if (!role?.id) return null
        // We render all RoleForms, instead of just the visible one
        // This is for making sure than the internal state of the useForm inside RoleForm
        // will keep its dirty state, when switching between tabs

        const checkIfMainUserExistsInArray = includes(
          mappedFilteredArray,
          role.id
        )

        console.log('role.id', role.id)
        console.log(
          'checkIfMainUserExistsInArray',
          checkIfMainUserExistsInArray
        )
        return (
          <RoleForm
            hidden={activeTab !== role.id}
            key={role.id}
            onReset={onResetForm}
            onSubmitSuccess={removeTemporaryRole}
            {...role}
            temporaryName={tabNames[role.id]}
            allPrivileges={allPrivileges}
            isMainUser={checkIfMainUserExistsInArray}
          />
        )
      })}
    </>
  )
}

export default RolesTabs
