import { FC } from 'react'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import OrderDetails, {
  OrderDetailModes,
} from 'components/organisms/OrderDetails/OrderDetails'

const NewOrder: FC = () => {
  const { t } = useTranslation()

  return (
    <div className={classes.container}>
      <h1>{t('orders.new_order_title')}</h1>
      <OrderDetails mode={OrderDetailModes.New} />
      {/* <SubmitButtons /> */}
    </div>
  )
}

export default NewOrder
