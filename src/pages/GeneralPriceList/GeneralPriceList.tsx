import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import GeneralPriceListTable from 'components/organisms/tables/GeneralPriceListTable/GeneralPriceListTable'
import { useAllPricesFetch } from 'hooks/requests/useVendors'
import TextInput from 'components/molecules/TextInput/TextInput'
import { debounce } from 'lodash'
import { Root } from '@radix-ui/react-form'

import classes from './classes.module.scss'

export interface GeneralPriceListProps {
  isModalOpen?: boolean
  taskId?: string
  selectedVendorsIds?: string[]
  taskSkills?: string[]
  source_language_classifier_value_id?: string
  destination_language_classifier_value_id?: string
}

const GeneralPriceList: FC<GeneralPriceListProps> = ({
  selectedVendorsIds = [],
  taskSkills = [],
  source_language_classifier_value_id,
  destination_language_classifier_value_id,
}) => {
  const { t } = useTranslation()

  const {
    prices,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useAllPricesFetch()

  const [searchValue, setSearchValue] = useState<string>()

  const handleSearchVendors = useCallback(
    (event: { target: { value: string } }) => {
      setSearchValue(event.target.value)
      debounce(
        handleFilterChange,
        300
      )({ institution_user_name: event.target.value })
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
          selectedVendorsIds,
          taskSkills,
          source_language_classifier_value_id,
          destination_language_classifier_value_id,
        }}
      />
    </>
  )
}

export default GeneralPriceList
