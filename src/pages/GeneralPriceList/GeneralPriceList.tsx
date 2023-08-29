import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import GeneralPriceListTable from 'components/organisms/tables/GeneralPriceListTable/GeneralPriceListTable'
import { useAllPricesFetch } from 'hooks/requests/useVendors'

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
    isLoading,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useAllPricesFetch()

  return (
    <>
      <div>
        <h1>{t('vendors.price_list')}</h1>
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
