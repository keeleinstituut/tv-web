import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { map } from 'lodash'

import Tabs from 'components/molecules/Tabs/Tabs'
import { TabStyle } from 'components/molecules/Tab/Tab'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import OutsourceRequestsTable from 'components/organisms/tables/OutsourceRequestsTable/OutsourceRequestsTable'
import { useFetchOutsourceRequests } from 'hooks/requests/useProjectRequests'
import { OutsourceOfferStatus } from 'types/outsourceRequests'

import classes from './classes.module.scss'

const OFFER_STATUS_TAB_IDS: Array<'ALL' | OutsourceOfferStatus> = [
  'ALL',
  OutsourceOfferStatus.RequestSent,
  OutsourceOfferStatus.RequestAccepted,
  OutsourceOfferStatus.RequestDeclined,
  OutsourceOfferStatus.RequestExpired,
  OutsourceOfferStatus.OfferAccepted,
]

const OutsourceRequest: FC = () => {
  const { t } = useTranslation()
  const {
    requests,
    paginationData,
    filters,
    isLoading,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFetchOutsourceRequests({ page: 1, per_page: 10 }, true)

  const activeOfferStatus = filters.offer_status?.[0]
  const activeTab = (activeOfferStatus ?? 'ALL') as 'ALL' | OutsourceOfferStatus

  const handleSetActiveTab = useCallback(
    (newActiveTab: string | undefined) => {
      const nextOfferStatus =
        !newActiveTab || newActiveTab === 'ALL'
          ? undefined
          : [newActiveTab as OutsourceOfferStatus]
      handleFilterChange({
        offer_status: nextOfferStatus as string[],
        page: 1,
      })
    },
    [handleFilterChange]
  )

  const tabs = useMemo(
    () =>
      map(OFFER_STATUS_TAB_IDS, (id) => ({
        id,
        name:
          id === 'ALL'
            ? t('requests.tab_all')
            : t(`requests.offer_status.${id}`),
      })),
    [t]
  )

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('requests.page_title')}</h1>
        <Tooltip helpSectionKey="requests" />
      </div>

      <Tabs
        setActiveTab={handleSetActiveTab}
        activeTab={activeTab}
        tabStyle={TabStyle.Primary}
        tabs={tabs}
        addDisabled
        editDisabled
        className={classes.tabsContainer}
      />

      <OutsourceRequestsTable
        requests={requests}
        isLoading={isLoading}
        paginationData={paginationData}
        filters={filters}
        onPaginationChange={handlePaginationChange}
        onSortingChange={handleSortingChange}
      />
    </>
  )
}

export default OutsourceRequest
