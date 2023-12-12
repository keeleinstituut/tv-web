import { FC } from 'react'
import TasksTable from 'components/organisms/tables/TasksTable/TasksTable'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useFetchTasks } from 'hooks/requests/useTasks'
import { useVendorCache } from 'hooks/requests/useVendors'
import classes from './classes.module.scss'

const VendorTasks: FC = () => {
  const { t } = useTranslation()
  const { vendorId } = useParams()
  const vendor = useVendorCache(vendorId)
  const vendorName = `${vendor?.institution_user?.user?.forename} ${
    vendor?.institution_user?.user?.surname
  } ${t('my_tasks.tasks')}`

  const {
    tasks,
    filters,
    isLoading,
    paginationData,
    handleFilterChange,
    handleSortingChange,
    handlePaginationChange,
  } = useFetchTasks({ institution_user_id: vendor?.institution_user_id })

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
