import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import {
  map,
  includes,
  filter,
  toLower,
  some,
  find,
  compact,
  isEmpty,
  split,
  join,
  toNumber,
  reduce,
  debounce,
} from 'lodash'
import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { useTranslation } from 'react-i18next'
import { AppearanceTypes } from 'components/molecules/Button/Button'
import { UserStatus } from 'types/users'
import { Root } from '@radix-ui/react-form'
import { FieldPath, SubmitHandler, useForm } from 'react-hook-form'
import VendorsEditTable, {
  VendorUser,
} from 'components/organisms/tables/VendorsEditTable/VendorsEditTable'
import TextInput from 'components/molecules/TextInput/TextInput'
import classes from './classes.module.scss'
import { PaginationFunctionType, ResponseMetaTypes } from 'types/collective'
import { useFetchUsers } from 'hooks/requests/useUsers'
import { useCreateVendors, useDeleteVendors } from 'hooks/requests/useVendors'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { ValidationError } from 'api/errorHandler'

export interface VendorsEditModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  usersData?: VendorUser
  paginationData?: ResponseMetaTypes
  onPaginationChange?: (value?: PaginationFunctionType) => void
}

type FormValues = {
  [key in string]: {
    isVendor: boolean
    vendor_id: string
  }
}

const VendorsEditModal: FC<VendorsEditModalProps> = ({
  isModalOpen,
  closeModal,
}) => {
  const { t } = useTranslation()
  const [searchValue, setSearchValue] = useState<string>('')
  const { createVendor } = useCreateVendors()
  const { deleteVendors } = useDeleteVendors()

  const initialFilters = {
    statuses: [UserStatus.Active],
  }
  const { users, paginationData, handlePaginationChange, handleOnSearch } =
    useFetchUsers(initialFilters, true)

  const resetSearch = () => {
    setSearchValue('')
    handleOnSearch({ fullname: '' })
  }

  const handleSearch = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)
      handleOnSearch({ fullname: event.target.value })
    },
    [handleOnSearch]
  )

  const usersData = useMemo(() => {
    return (
      map(users, ({ user, id, vendor }) => {
        const name = `${user.forename} ${user.surname}`
        return {
          institution_user_id: id,
          name: name,
          vendor_id: vendor?.id,
          isVendor: !!vendor,
        }
      }) || {}
    )
  }, [users])

  const { control, handleSubmit, reset, setError } = useForm<FormValues>({
    mode: 'onChange',
  })

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    const newVendorsPayload = compact(
      map(data, ({ isVendor }, id) => {
        const isNotInVendorsList = some(
          users,
          (user) => user.id === id && !user.vendor
        )

        if (isVendor && isNotInVendorsList) {
          return {
            institution_user_id: id,
          }
        }
      })
    )

    const deleteVendorsPayload = compact(
      map(data, ({ isVendor, vendor_id }, id) => {
        const isInVendorsList = some(
          users,
          (user) => user.id === id && !!user.vendor
        )
        if (!isVendor && isInVendorsList) {
          return vendor_id
        }
      })
    )

    const allPromise = Promise.all([
      !isEmpty(deleteVendorsPayload) && deleteVendors(deleteVendorsPayload),
      !isEmpty(newVendorsPayload) && createVendor(newVendorsPayload),
    ])

    try {
      await allPromise
      resetSearch()
      closeModal()
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.vendors_created_removed'),
      })
    } catch (errorData) {
      const typedErrorData = errorData as ValidationError
      if (typedErrorData.errors) {
        map(typedErrorData.errors, (errorsArray, key) => {
          const typedKey = key as FieldPath<FormValues>
          const tKey = split(typedKey, '.')[1]
          const fieldId = includes(typedKey, 'institution_user_id')
            ? newVendorsPayload[toNumber(tKey)].institution_user_id
            : deleteVendorsPayload[toNumber(tKey)]
          const errorString = join(errorsArray, ',')
          setError(fieldId, { type: 'backend', message: errorString })
        })
      }
    }
  }

  return (
    <ModalBase
      title={t('label.add_remove_vendor')}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      buttonsPosition={ButtonPositionTypes.Right}
      size={ModalSizeTypes.Narrow}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          children: t('button.cancel'),
          onClick: () => {
            closeModal()
            reset()
            resetSearch()
          },
        },
        {
          appearance: AppearanceTypes.Primary,
          children: t('button.confirm'),
          type: 'submit',
          form: 'vendors',
        },
      ]}
    >
      <Root id="vendors" onSubmit={handleSubmit(onSubmit)}>
        <TextInput
          name="search"
          ariaLabel={t('label.search')}
          placeholder={t('placeholder.search_by_name')}
          value={searchValue}
          onChange={handleSearch}
          className={classes.searchInput}
          isSearch
        />
        <VendorsEditTable
          data={usersData}
          control={control}
          {...{
            paginationData,
            handlePaginationChange,
          }}
        />
      </Root>
    </ModalBase>
  )
}

export default VendorsEditModal
