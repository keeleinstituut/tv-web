import Loader from 'components/atoms/Loader/Loader'
import { useFetchOrder } from 'hooks/requests/useOrders'
import { FC } from 'react'
import { map } from 'lodash'
import OrderDetails, {
  OrderDetailModes,
} from 'components/organisms/OrderDetails/OrderDetails'
import Task from 'components/organisms/Task/Task'
import Button from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'

import classes from './classes.module.scss'

const TaskPage: FC = () => {
  const { t } = useTranslation()
  const { order, isLoading } = useFetchOrder({
    id: '9a8e440d-f541-4a6c-bfbb-bf77482535ef',
  })

  console.log('order', order)
  const { status, price } = order || {}
  // TODO: check is "Tellija" of the order current user
  if (isLoading) return <Loader loading={isLoading} />
  return (
    <>
      <div className={classes.taskTitleContainer}>
        <h1 className={classes.titleRow}>{order?.sub_projects[0].ext_id}</h1>
        <Button
          className={classes.acceptButton}
          // TODO: handle accept task
        >
          {t('button.accept')}
        </Button>
      </div>

      <OrderDetails
        mode={OrderDetailModes.Editable}
        order={order}
        className={classes.orderDetails}
      />

      <div className={classes.separator} />

      <div>
        {map(order?.sub_projects, (subOrder) => {
          console.log('subOrder', subOrder)
          return (
            <div key={subOrder.id}>
              <Task
                id={subOrder.id}
                ext_id={subOrder.ext_id}
                status={status}
                deadline_at={order?.deadline_at}
                price={price}
              />
            </div>
          )
        })}
      </div>
    </>
  )
}

export default TaskPage
