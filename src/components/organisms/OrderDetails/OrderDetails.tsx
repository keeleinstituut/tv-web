import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import classes from './classes.module.scss'
import useAuth from 'hooks/useAuth'
import Container from 'components/atoms/Container/Container'
import DynamicForm, {
  FieldProps,
  InputTypes,
  FormInput,
} from 'components/organisms/DynamicForm/DynamicForm'
import { Control, FieldValues, Path } from 'react-hook-form'

// const OrderPeopleDetails: FC = () => {
//   return (

//   )
// }

interface OrderDetailsProps<Type extends FieldValues> {
  isEditable?: boolean
  control: Control<Type>
}

const OrderDetails = <TFormValues extends FieldValues>({
  isEditable,
  control,
}: OrderDetailsProps<TFormValues>) => {
  const { t } = useTranslation()

  return (
    <Container className={classes.container}>
      <div className={classes.clientDetailsContainer}>
        <h1>{t('orders.client_details')}</h1>
        <FormInput
          name={'client_id' as unknown as Path<TFormValues>}
          label={t('label.name')}
          ariaLabel={t('label.name')}
          control={control}
          options={[]}
          inputType={InputTypes.Selections}
        />
      </div>
      <div className={classes.managerDetailsContainer}>
        <h1>{t('orders.manager_details')}</h1>
        {/* <FormInput
          name="own_orders"
          label={t('label.show_only_my_orders')}
          ariaLabel={t('label.show_only_my_orders')}
          className={classes.checkbox}
          control={control}
          inputType={InputTypes.Checkbox}
        /> */}
      </div>
    </Container>
  )
}

export default OrderDetails
