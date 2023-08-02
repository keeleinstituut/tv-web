import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import classes from './classes.module.scss'
import useAuth from 'hooks/useAuth'
import Container from 'components/atoms/Container/Container'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { Control, FieldValues } from 'react-hook-form'

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
  return null
  // return (
  //   <>
  //     <DynamicForm
  //       fields={peopleFields}
  //       control={control}
  //       className={classNames(
  //         classes.peopleDetailsContainer,
  //         classes.containerClass
  //       )}
  //     />
  //     <DynamicForm
  //       fields={fields}
  //       control={control}
  //       className={classNames(
  //         classes.peopleDetailsContainer,
  //         classes.containerClass
  //       )}
  //     />
  //   </>
  // )
}

export default OrderDetails
