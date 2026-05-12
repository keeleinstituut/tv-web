import { FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { debounce, map } from 'lodash'

import Tabs from 'components/molecules/Tabs/Tabs'
import { TabStyle } from 'components/molecules/Tab/Tab'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import TextInput from 'components/molecules/TextInput/TextInput'
import RequestsTable from 'components/organisms/tables/RequestsTable/RequestsTable'
import { useFetchProjectRequests } from 'hooks/requests/useProjectRequests'
import { ProjectRequestStatus } from 'types/projectRequests'
import { FilterFunctionType } from 'types/collective'

import classes from './classes.module.scss'

const STATUS_TAB_IDS: Array<'ALL' | ProjectRequestStatus> = [
  'ALL',
  ProjectRequestStatus.Pending,
  ProjectRequestStatus.Accepted,
  ProjectRequestStatus.Responded,
  ProjectRequestStatus.Declined,
  ProjectRequestStatus.Expired,
]

const Requests: FC = () => {
  const { t } = useTranslation()
  const [searchValue, setSearchValue] = useState('')

  const {
    requests,
    paginationData,
    filters,
    isLoading,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFetchProjectRequests({ page: 1, per_page: 10 }, true)

  const activeTab = (filters.status ?? 'ALL') as 'ALL' | ProjectRequestStatus

  const handleSetActiveTab = useCallback(
    (newActiveTab: string | undefined) => {
      const nextStatus =
        !newActiveTab || newActiveTab === 'ALL' ? '' : newActiveTab
      handleFilterChange({ status: nextStatus, page: 1 } as FilterFunctionType)
    },
    [handleFilterChange]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearchChange = useCallback(
    debounce((next: string) => {
      handleFilterChange({ search: next, page: 1 } as FilterFunctionType)
    }, 300),
    [handleFilterChange]
  )

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const next = event.target.value
      setSearchValue(next)
      debouncedSearchChange(next)
    },
    [debouncedSearchChange]
  )

  const tabs = useMemo(
    () =>
      map(STATUS_TAB_IDS, (id) => ({
        id,
        name: id === 'ALL' ? t('requests.tab_all') : t(`requests.status.${id}`),
      })),
    [t]
  )

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('requests.page_title')}</h1>
        <Tooltip helpSectionKey="requests" />
      </div>

      <div className={classes.toolbar}>
        <TextInput
          name="search"
          ariaLabel={t('label.search')}
          placeholder={t('requests.search_placeholder')}
          value={searchValue}
          onChange={handleSearchChange}
          isSearch
          className={classes.searchInput}
        />
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

      <RequestsTable
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

export default Requests
