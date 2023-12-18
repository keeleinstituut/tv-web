import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import GeneralPriceListTable from 'components/organisms/tables/GeneralPriceListTable/GeneralPriceListTable'
import { useAllPricesFetch } from 'hooks/requests/useVendors'
import TextInput from 'components/molecules/TextInput/TextInput'
import { debounce } from 'lodash'
import { Root } from '@radix-ui/react-form'

import classes from './classes.module.scss'

const GeneralPriceList: FC = () => {
  const { t } = useTranslation()

  const {
    prices,
    filters,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useAllPricesFetch({
    per_page: 10,
    page: 1,
  })

  const [searchValue, setSearchValue] = useState<string>('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedChangeHandler = useCallback(
    debounce(handleFilterChange, 300, {
      leading: false,
      trailing: true,
    }),
    []
  )

  const handleSearchVendors = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)
      debouncedChangeHandler({ institution_user_name: event.target.value })
    },
    [debouncedChangeHandler]
  )

  return (
    <>
      <div>
        <h1>{t('vendors.price_list')}</h1>
        <Root onSubmit={(e) => e.preventDefault()}>
          <TextInput
            name={'search'}
            ariaLabel={t('label.search_by_name_here')}
            placeholder={t('label.search_by_name_here')}
            value={searchValue}
            onChange={handleSearchVendors}
            className={classes.searchInput}
            inputContainerClassName={classes.generalPriceListInput}
            isSearch
          />
        </Root>
      </div>
      <GeneralPriceListTable
        data={prices}
        {...{
          paginationData,
          handleFilterChange,
          handleSortingChange,
          handlePaginationChange,
          filters,
        }}
      />
    </>
  )
}

export default GeneralPriceList
