import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import Tooltip from 'components/organisms/Tooltip/Tooltip'
import OutsourceOffersTable from 'components/organisms/tables/OutsourceOffersTable/OutsourceOffersTable'
import { useFetchOutsourceOffers } from 'hooks/requests/useOutsourceRequests'

import classes from './classes.module.scss'

const OutsourceOffer: FC = () => {
  const { t } = useTranslation()
  const {
    offers,
    paginationData,
    filters,
    isLoading,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFetchOutsourceOffers({ page: 1, per_page: 10 }, true)

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('requests.page_title')}</h1>
        <Tooltip helpSectionKey="requests" />
      </div>

      <OutsourceOffersTable
        offers={offers}
        isLoading={isLoading}
        paginationData={paginationData}
        filters={filters}
        onPaginationChange={handlePaginationChange}
        onSortingChange={handleSortingChange}
        onFiltersChange={handleFilterChange}
      />
    </>
  )
}

export default OutsourceOffer
