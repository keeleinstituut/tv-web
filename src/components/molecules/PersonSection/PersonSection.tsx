import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import classes from './classes.module.scss'
import useAuth from 'hooks/useAuth'
import { map, uniqBy, concat, compact, find, includes, join } from 'lodash'
import {
  InputTypes,
  FormInput,
} from 'components/organisms/DynamicForm/DynamicForm'
import {
  useFetchInfiniteProjectPerson,
  useFetchUser,
} from 'hooks/requests/useUsers'
import DetailsRow from 'components/atoms/DetailsRow/DetailsRow'
import { Control, FieldValues, Path } from 'react-hook-form'
import { UserType } from 'types/users'
import { Privileges } from 'types/privileges'

type UserDetailsProps = Pick<UserType, 'email' | 'phone'> & {
  institution?: UserType['institution']
  department?: string
  valueClass?: string
}

const UserDetails: FC<UserDetailsProps> = ({
  department,
  institution,
  email,
  phone,
  valueClass,
}) => {
  const { t } = useTranslation()
  return (
    <>
      {map(
        { institution, department, email, phone },
        (value, key: keyof Omit<UserDetailsProps, 'valueClass'>) => (
          <DetailsRow
            label={t(`label.${key}`)}
            key={key}
            hidden={!value}
            labelClass={classes.labelClass}
            valueClass={valueClass}
            value={typeof value === 'string' ? value : value?.name}
          />
        )
      )}
    </>
  )
}

export enum PersonSectionTypes {
  Manager = 'MANAGER',
  Client = 'CLIENT',
}

interface PersonSectionProps<TFormValues extends FieldValues> {
  type: PersonSectionTypes
  control: Control<TFormValues>
  selectedUserId?: string
  selectedUser?: UserType
  isEditable?: boolean
  hideDetails?: boolean
}

const PersonSection = <TFormValues extends FieldValues>({
  type,
  control,
  selectedUserId,
  selectedUser,
  isEditable,
  hideDetails,
}: PersonSectionProps<TFormValues>) => {
  const { t } = useTranslation()
  const { institutionUserId, userPrivileges } = useAuth()
  // fetch currently logged in user
  const { isLoading, user } = useFetchUser({
    id: institutionUserId,
  })
  // Fetch list of users bases on PersonSectionType
  const {
    users,
    handleFilterChange,
    isFetching,
    paginationData,
    fetchNextPage,
  } = useFetchInfiniteProjectPerson(
    {
      per_page: 10,
    },
    type === PersonSectionTypes.Client ? 'client' : 'manager',
    isEditable
  )
  // Pass search as a param and fetch again
  const handleSearchUsers = useCallback(
    (newValue: string) => {
      handleFilterChange({ fullname: newValue })
    },
    [handleFilterChange]
  )

  const handleFetchNextPage = useCallback(() => {
    const { current_page = 0, last_page = 0 } = paginationData || {}
    if (current_page < last_page && !isFetching) {
      fetchNextPage()
    }
  }, [paginationData, isFetching, fetchNextPage])

  const usersList = useMemo(() => {
    const isCurrentUserPotentialManager = includes(
      userPrivileges,
      Privileges.ManageProject
    )

    const shouldAddCurrentUser =
      type === PersonSectionTypes.Client || isCurrentUserPotentialManager

    const usersWithCurrentlySelected = uniqBy(
      concat([selectedUser], users),
      'id'
    )

    if (!shouldAddCurrentUser) return compact(usersWithCurrentlySelected)
    return compact(uniqBy(concat([user], usersWithCurrentlySelected), 'id'))
  }, [selectedUser, type, user, userPrivileges, users])

  const options = useMemo(() => {
    return compact(
      map(usersList, (listUsers) => {
        if (!listUsers) return null
        const { id, user } = listUsers
        return {
          value: id,
          label: `${user.forename} ${user.surname}`,
        }
      })
    )
  }, [usersList])

  const selectedUserDetails = useMemo(
    () => find(usersList, { id: selectedUserId || selectedUser?.id }),
    [selectedUserId, usersList, selectedUser?.id]
  )
  const { department, institution, email, phone } = selectedUserDetails || {}

  const title =
    type === PersonSectionTypes.Client
      ? t('projects.client_details')
      : t('projects.manager_details')

  const fieldName =
    type === PersonSectionTypes.Client
      ? 'client_institution_user_id'
      : 'manager_institution_user_id'

  const fieldLabel =
    type === PersonSectionTypes.Client
      ? `${t('label.name')}*`
      : t('label.manager')

  const visibleUserDetails = {
    email,
    phone,
    institution: type === PersonSectionTypes.Client ? institution : undefined,
    department:
      type === PersonSectionTypes.Client && department
        ? join(department, ', ')
        : undefined,
  }

  return (
    <div
      className={classNames(
        classes.column,
        !isEditable && classes.adjustedLayout,
        hideDetails && classes.noRows
      )}
    >
      <h2
        className={classNames(
          type === PersonSectionTypes.Client && classes.extraPadding,
          hideDetails && classes.hidden
        )}
      >
        {title}
      </h2>
      <label
        htmlFor={fieldName}
        className={classNames(
          classes.labelClass,
          hideDetails && classes.hidden
        )}
      >
        {fieldLabel}
      </label>
      <FormInput
        name={fieldName as Path<TFormValues>}
        ariaLabel={t('label.name')}
        control={control}
        options={options}
        inputType={InputTypes.Selections}
        showSearch
        onSearch={handleSearchUsers}
        onEndReached={handleFetchNextPage}
        loading={isFetching}
        hidden={isLoading}
        onlyDisplay={!isEditable}
        className={classNames(!isEditable && classes.boldText)}
        rules={{
          required: type === PersonSectionTypes.Client,
        }}
        hideTags
      />
      {selectedUserDetails && !hideDetails && (
        <UserDetails
          {...visibleUserDetails}
          valueClass={classNames(!isEditable && classes.boldText)}
        />
      )}
    </div>
  )
}

export default PersonSection
