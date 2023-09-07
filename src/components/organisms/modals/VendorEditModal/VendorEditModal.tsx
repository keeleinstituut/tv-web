import { FC, useCallback, useMemo, useState } from 'react'
import { map, reduce, includes, filter, debounce, toLower } from 'lodash'
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
import vendors from 'components/organisms/tables/users.json'
import VendorsEditTable from 'components/organisms/tables/VendorsEditTable/VendorsEditTable'
import users from 'components/organisms/tables/users.json'
import TextInput from 'components/molecules/TextInput/TextInput'
import classes from './classes.module.scss'
export interface VendorsEditModalProps {
  isModalOpen?: boolean
  closeModal: () => void
}

type FormValues = {
  [key in string]: boolean
}

const VendorsEditModal: FC<VendorsEditModalProps> = ({
  isModalOpen,
  closeModal,
}) => {
  const { t } = useTranslation()

  //Pagination does not work after mapping the data
  const [searchValue, setSearchValue] = useState<string>('')

  const filteredData = filter(users.data, ({ status }) =>
    includes(UserStatus.Active, status)
  )

  const vendorData = useMemo(() => {
    return (
      map(filteredData, ({ user, id, vendor }) => {
        const name = `${user.forename} ${user.surname}` || 'Kalle'
        return {
          // id: user.personal_identification_code,
          id,
          name: name,
          vendor,
        }
      }) || {}
    )
  }, [filteredData])

  const filterBySearch = useMemo(() => {
    if (!!searchValue) {
      return filter(vendorData, ({ name }) =>
        includes(toLower(name), toLower(searchValue))
      )
    } else return vendorData
  }, [searchValue, vendorData])

  const defaultValues = reduce(
    vendorData,
    (result, value) => {
      if (!value.id) {
        return result
      }
      return {
        ...result,
        [value.id]: value.vendor,
      }
    },
    {}
  )

  const { control, handleSubmit, watch } = useForm<FormValues>({
    mode: 'onChange',
    resetOptions: {
      keepErrors: true,
    },
    values: defaultValues,
  })
  const watchAll = watch()
  //console.log('watch', watchAll)

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data)
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
        <VendorsEditTable data={filterBySearch} control={control} />
      </Root>
    </ModalBase>
  )
}

export default VendorsEditModal
