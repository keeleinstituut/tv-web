import { FC } from 'react'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import OrderDetails from 'components/organisms/OrderDetails/OrderDetails'
import { Root } from '@radix-ui/react-form'

const NewOrder: FC = () => {
  const { t } = useTranslation()

  return (
    <Root className={classes.container}>
      <h1>{t('orders.new_order_title')}</h1>
      <OrderDetails isNew />
      {/* <SubmitButtons /> */}
    </Root>
  )
}

export default NewOrder
