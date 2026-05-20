import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { map } from 'lodash'

import Tabs from 'components/molecules/Tabs/Tabs'
import { TabStyle } from 'components/molecules/Tab/Tab'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import OutsourceRequestsTable from 'components/organisms/tables/OutsourceRequestsTable/OutsourceRequestsTable'
import { useFetchOutsourceRequests } from 'hooks/requests/useProjectRequests'
import { OutsourceRequestStatus } from 'types/outsourceRequests'

import classes from './classes.module.scss'

const STATUS_TAB_IDS: Array<'ALL' | OutsourceRequestStatus> = [
  'ALL',
  OutsourceRequestStatus.Active,
  OutsourceRequestStatus.Fulfilled,
  OutsourceRequestStatus.Cancelled,
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

  const activeStatus = filters.status?.[0]
  const activeTab = (activeStatus ?? 'ALL') as 'ALL' | OutsourceRequestStatus

  const handleSetActiveTab = useCallback(
    (newActiveTab: string | undefined) => {
      const nextStatus =
        !newActiveTab || newActiveTab === 'ALL'
          ? undefined
          : [newActiveTab as OutsourceRequestStatus]
      handleFilterChange({
        status: nextStatus as string[],
        page: 1,
      })
    },
    [handleFilterChange]
  )

  const tabs = useMemo(
    () =>
      map(STATUS_TAB_IDS, (id) => ({
        id,
        name:
          id === 'ALL'
            ? t('requests.tab_all')
            : t(`requests.request_status.${id}`),
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
