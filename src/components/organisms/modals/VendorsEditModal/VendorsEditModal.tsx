import { FC, useCallback, useMemo, useState } from 'react'
import {
  map,
  reduce,
  includes,
  filter,
  debounce,
  toLower,
  some,
  find,
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
import { SubmitHandler, useForm } from 'react-hook-form'
import VendorsEditTable, {
  VendorUser,
} from 'components/organisms/tables/VendorsEditTable/VendorsEditTable'
import TextInput from 'components/molecules/TextInput/TextInput'
import classes from './classes.module.scss'
import { PaginationFunctionType, ResponseMetaTypes } from 'types/collective'
import { useFetchUsers } from 'hooks/requests/useUsers'
import { useVendorsFetch } from 'hooks/requests/useVendors'

export interface VendorsEditModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  usersData?: VendorUser
  paginationData?: ResponseMetaTypes
  onPaginationChange?: (value?: PaginationFunctionType) => void
}

type FormValues = {
  [key in string]: boolean
}

const VendorsEditModal: FC<VendorsEditModalProps> = ({
  isModalOpen,
  closeModal,
}) => {
  const { t } = useTranslation()
  const [searchValue, setSearchValue] = useState<string>('')
  const { vendors } = useVendorsFetch({ limit: undefined })

  const initialFilters = {
    statuses: [UserStatus.Active],
  }
  const {
    users,
    paginationData,
    handlePaginationChange,
    // isLoading: isUsersLoading,
  } = useFetchUsers(initialFilters)

  const usersData = useMemo(() => {
    return (
      map(users, ({ user, institution, id }) => {
        const name = `${user.forename} ${user.surname}`
        return {
          institution_user_id: user.id,
          company_name: institution.name,
          name: name,
          isVendor: some(
            vendors,
            (vendor) => vendor.institution_user.user.id === user.id
          ),
        }
      }) || {}
    )
  }, [users, vendors])

  console.log('user', users)
  console.log('vendors', vendors)
  console.log('userdata 1', usersData)

  const filterBySearch = useMemo(() => {
    if (!!searchValue) {
      return filter(usersData, ({ name }) =>
        includes(toLower(name), toLower(searchValue))
      )
    } else return usersData
  }, [searchValue, usersData])

  // const defaultValues = useMemo(
  //   () =>
  //     reduce(
  //       usersData,
  //       (result, value) => {
  //         if (!value.institution_user_id) {
  //           return result
  //         }
  //         return {
  //           ...result,
  //           // [value.institution_user_id]: value.isVendor,
  //           [value.institution_user_id]: some(
  //             vendors,
  //             (vendor) =>
  //               vendor.institution_user.user.id === value.institution_user_id
  //           ),
  //         }
  //       },
  //       {}
  //     ),
  //   [usersData]
  // )

  //console.log('default', defaultValues)

  const { control, handleSubmit, watch, reset } = useForm<FormValues>({
    //reValidateMode: 'onChange',
    mode: 'onChange',
    // resetOptions: {
    //   keepErrors: true,
    // },
    // values: defaultValues,
  })

  const watchAll = watch()
  console.log('watch', watchAll)

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data)
    const payload = {}

    closeModal()
  }

  const handleSearch = useCallback((event: { target: { value: string } }) => {
    setSearchValue(event.target.value)
    //   if (onSearch) {
    //     debounce(onSearch, 300)(event.target.value)
    //   }
  }, [])

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
          data={filterBySearch}
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
