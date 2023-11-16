import { FC } from 'react'
import { toLower } from 'lodash'
import classes from './classes.module.scss'
import Tag from 'components/atoms/Tag/Tag'
import { useTranslation } from 'react-i18next'
import { OrderStatus, SubOrderStatus } from 'types/orders'

export interface OrderStatusTagProps {
  status?: OrderStatus | SubOrderStatus
  jobName?: string
}

const OrderStatusTag: FC<OrderStatusTagProps> = ({ status, jobName }) => {
  const { t } = useTranslation()

  const jobString = jobName ? ` (${jobName})` : ''

  if (!status) return null
  return (
    <Tag
      label={`${t(`orders.status.${status}`)}${jobString}`}
      className={classes[toLower(status)]}
    />
  )
}

export default OrderStatusTag
