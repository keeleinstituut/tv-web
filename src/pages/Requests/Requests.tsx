import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { debounce, map } from 'lodash'
import { Root } from '@radix-ui/react-form'

import Tabs from 'components/molecules/Tabs/Tabs'
import { TabStyle } from 'components/molecules/Tab/Tab'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import TextInput from 'components/molecules/TextInput/TextInput'
import RequestsTable from 'components/organisms/tables/RequestsTable/RequestsTable'
import { useFetchOutsourceRequests } from 'hooks/requests/useProjectRequests'
import { OutsourceRequestStatus } from 'types/outsourceRequests'
import { FilterFunctionType } from 'types/collective'

import classes from './classes.module.scss'

const STATUS_TAB_IDS: Array<'ALL' | OutsourceRequestStatus> = [
  'ALL',
  OutsourceRequestStatus.Active,
  OutsourceRequestStatus.Fulfilled,
  OutsourceRequestStatus.Cancelled,
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
        status: nextStatus,
        page: 1,
      } as FilterFunctionType)
    },
    [handleFilterChange]
  )

  const debouncedSearchChange = useMemo(
    () =>
      debounce((next: string) => {
        handleFilterChange({ search: next, page: 1 } as FilterFunctionType)
      }, 300),
    [handleFilterChange]
  )

  useEffect(
    () => () => {
      debouncedSearchChange.cancel()
    },
    [debouncedSearchChange]
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

      <Root className={classes.toolbar} onSubmit={(e) => e.preventDefault()}>
        <TextInput
          name="search"
          ariaLabel={t('label.search')}
          placeholder={t('requests.search_placeholder')}
          value={searchValue}
          onChange={handleSearchChange}
          isSearch
          className={classes.searchInput}
        />
      </Root>

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
