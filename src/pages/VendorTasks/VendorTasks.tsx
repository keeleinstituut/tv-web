import { FC } from 'react'
import TasksTable from 'components/organisms/tables/TasksTable/TasksTable'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import { useTranslation } from 'react-i18next'
import { useParams, useSearchParams } from 'react-router-dom'
import { useFetchTasks } from 'hooks/requests/useTasks'
import { useVendorCache } from 'hooks/requests/useVendors'
import classes from './classes.module.scss'
import { parseLanguagePairs } from 'helpers'

const VendorTasks: FC = () => {
  const { t } = useTranslation()
  const { vendorId } = useParams()
  const vendor = useVendorCache(vendorId)
  const vendorName = `${vendor?.institution_user?.user?.forename} ${
    vendor?.institution_user?.user?.surname
  } ${t('my_tasks.tasks')}`

  const [searchParams, _] = useSearchParams()
  const initialFilters = {
    page: Number(searchParams.get('page')),
    per_page: Number(searchParams.get('per_page')),
    ...(searchParams.get('sort_by')
      ? { sort_by: searchParams.get('sort_by')! }
      : {}),
    ...(searchParams.get('sort_order')
      ? { sort_order: searchParams.get('sort_order')! as 'asc' | 'desc' }
      : {}),
    lang_pair: parseLanguagePairs(searchParams),
    type_classifier_value_id: searchParams.getAll('type_classifier_value_id'),
  }

  const {
    tasks,
    filters,
    isLoading,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFetchTasks(initialFilters, true)

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{vendorName}</h1>
        <Tooltip helpSectionKey="vendorTasks" />
      </div>

      <TasksTable
        tasks={tasks || []}
        paginationData={paginationData}
        isLoading={isLoading}
        filters={filters}
        handlePaginationChange={handlePaginationChange}
        handleFilterChange={handleFilterChange}
        handleSortingChange={handleSortingChange}
      />
    </>
  )
}

export default VendorTasks
