import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import GeneralPriceListTable from 'components/organisms/tables/GeneralPriceListTable/GeneralPriceListTable'
import { useAllPricesFetch } from 'hooks/requests/useVendors'
import TextInput from 'components/molecules/TextInput/TextInput'
import { debounce } from 'lodash'
import { Root } from '@radix-ui/react-form'

import classes from './classes.module.scss'
import { PaginationState } from '@tanstack/react-table'

const GeneralPriceList: FC = () => {
  const { t } = useTranslation()

  const {
    prices,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useAllPricesFetch()

  const [searchValue, setSearchValue] = useState<string>('')

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: paginationData ? paginationData.per_page : 10,
  })

  const handleSearchVendors = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)
      debounce(
        handleFilterChange,
        300
      )({ institution_user_name: event.target.value })
      setPagination({
        pageIndex: 0,
        pageSize: paginationData ? paginationData.per_page : 10,
      })
    },
    [handleFilterChange]
  )

  return (
    <>
      <div>
        <h1>{t('vendors.price_list')}</h1>
        <Root>
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
          pagination,
          setPagination,
        }}
      />
    </>
  )
}

export default GeneralPriceList
