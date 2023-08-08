import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import classes from './classes.module.scss'
import useAuth from 'hooks/useAuth'
import {
  map,
  uniqBy,
  concat,
  compact,
  find,
  isEmpty,
  intersection,
  join,
} from 'lodash'
import {
  InputTypes,
  FormInput,
} from 'components/organisms/DynamicForm/DynamicForm'
import {
  useFetchInfiniteTranslationUsers,
  useFetchUser,
} from 'hooks/requests/useUsers'
import DetailsRow from 'components/atoms/DetailsRow/DetailsRow'
import { Control, FieldValues, Path } from 'react-hook-form'
import { UserType } from 'types/users'
import { Privileges } from 'types/privileges'

type UserDetailsProps = Pick<UserType, 'email' | 'phone'> & {
  institution?: UserType['institution']
  department?: string
}

const UserDetails: FC<UserDetailsProps> = ({
  department,
  institution,
  email,
  phone,
}) => {
  const { t } = useTranslation()
  return (
    <>
      {map(
        { institution, department, email, phone },
        (value, key: keyof UserDetailsProps) => (
          <DetailsRow
            label={t(`label.${key}`)}
            key={key}
            hidden={!value}
            labelClass={classes.labelClass}
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
}

const PersonSection = <TFormValues extends FieldValues>({
  type,
  control,
  selectedUserId,
}: PersonSectionProps<TFormValues>) => {
  const { t } = useTranslation()
  const { institutionUserId, userPrivileges } = useAuth()
  // fetch currently logged in user
  const { isLoading, user } = useFetchUser({
    userId: institutionUserId,
  })
  // Fetch list of users bases on PersonSectionType
  const {
    users,
    handleFilterChange,
    isFetching,
    paginationData,
    fetchNextPage,
  } = useFetchInfiniteTranslationUsers({
    per_page: 10,
    // TODO: not sure yet whether filtering param will be privileges
    privileges:
      type === PersonSectionTypes.Client
        ? [Privileges.CreateProject]
        : [Privileges.ReceiveAndManageProject],
  })
  // Pass search as a param and fetch again
  const handleSearchUsers = useCallback(
    (newValue: string) => {
      // TODO: not sure yet whether filtering param will be name
      handleFilterChange({ name: newValue })
    },
    [handleFilterChange]
  )

  const handleFetchNextPage = useCallback(() => {
    const { current_page = 0, last_page = 0 } = paginationData || {}
    if (current_page < last_page && !isFetching) {
      // handlePaginationChange({ page: current_page + 1 })
      fetchNextPage()
    }
  }, [paginationData, isFetching, fetchNextPage])

  const usersList = useMemo(() => {
    const isCurrentUserPotentialManager = !isEmpty(
      intersection(
        [Privileges.ManageProject, Privileges.ReceiveAndManageProject],
        userPrivileges
      )
    )
    const shouldAddCurrentUser =
      type === PersonSectionTypes.Client || isCurrentUserPotentialManager
    if (!shouldAddCurrentUser) return users
    return uniqBy(concat([user], users), 'id')
  }, [type, user, userPrivileges, users])

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
    () => find(usersList, { id: selectedUserId }),
    [selectedUserId, usersList]
  )

  const { department, institution, email, phone } = selectedUserDetails || {}

  const title =
    type === PersonSectionTypes.Client
      ? t('orders.client_details')
      : t('orders.manager_details')

  const fieldName =
    type === PersonSectionTypes.Client
      ? 'client_user_institution_id'
      : 'translation_manager_user_institution_id'

  const fieldLabel =
    type === PersonSectionTypes.Client ? t('label.name') : t('label.manager')

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
    <div className={classes.column}>
      <h2
        className={classNames(
          type === PersonSectionTypes.Client && classes.extraPadding
        )}
      >
        {title}
      </h2>
      <span className={classes.labelClass}>{fieldLabel}</span>
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
      />
      {selectedUserDetails && <UserDetails {...visibleUserDetails} />}
    </div>
  )
}

export default PersonSection
