import { FC } from 'react'
import TasksTable, {
  TaskTableTypes,
} from 'components/organisms/tables/TasksTable/TasksTable'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { useVendorCache } from 'hooks/requests/useVendors'
import classes from './classes.module.scss'

const VendorTasks: FC = () => {
  const { t } = useTranslation()
  const { vendorId } = useParams()
  const vendor = useVendorCache(vendorId)
  const vendorName = `${vendor?.institution_user?.user?.forename} ${
    vendor?.institution_user?.user?.surname
  } ${t('my_tasks.tasks')}`

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{vendorName}</h1>
        <Tooltip helpSectionKey="vendorTasks" />
      </div>

      <TasksTable
        type={TaskTableTypes.VendorTasks}
        userId={vendor?.institution_user?.id}
      />
    </>
  )
}

export default VendorTasks
