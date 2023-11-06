import Loader from 'components/atoms/Loader/Loader'
import { useFetchOrder } from 'hooks/requests/useOrders'
import { FC } from 'react'
import { map } from 'lodash'
import classes from './classes.module.scss'
import OrderDetails, {
  OrderDetailModes,
} from 'components/organisms/OrderDetails/OrderDetails'
import Task from 'components/organisms/Task/Task'

const TaskPage: FC = () => {
  const { order, isLoading } = useFetchOrder({
    id: '9a73d254-4227-4772-867e-3a19da737202',
  })

  console.log('order', order)
  const { status, price } = order || {}
  // TODO: check is "Tellija" of the order current user
  if (isLoading) return <Loader loading={isLoading} />
  return (
    <>
      <h1 className={classes.titleRow}>{order?.sub_projects[0].ext_id}</h1>

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
