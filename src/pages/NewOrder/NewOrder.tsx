import { FC } from 'react'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import Container from 'components/atoms/Container/Container'
import OrderDetails from 'components/organisms/OrderDetails/OrderDetails'
import { useForm } from 'react-hook-form'

// TODO: WIP - implement this page

interface FormValues {
  client_id: string
  manager_id: string
}

const NewOrder: FC = () => {
  const { t } = useTranslation()
  const {
    control,
    // handleSubmit,
    // reset,
    // formState: { isSubmitting, isValid },
    // setError,
  } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
  })

  // const {
  //   control,
  //   handleSubmit,
  //   reset,
  //   formState: { isSubmitting, isValid },
  //   setError,
  // } = useForm<FormValues>({
  //   reValidateMode: 'onSubmit',
  //   values: defaultValues,
  // })

  // const clientFields: FieldProps<FormValues>[] = [
  //   {
  //     inputType: InputTypes.Selections,
  //     ariaLabel: t('label.department'),
  //     placeholder: t('placeholder.department'),
  //     label: t('label.department'),
  //     name: 'client_id',
  //     className: classes.inputInternalPosition,
  //     options: departmentOptions,
  //     disabled: isFormDisabled,
  //   },
  // ]

  // const managerFields: FieldProps<FormValues>[] = [
  //   {
  //     inputType: InputTypes.Selections,
  //     ariaLabel: t('label.department'),
  //     placeholder: t('placeholder.department'),
  //     label: t('label.department'),
  //     name: 'manager_id',
  //     className: classes.inputInternalPosition,
  //     options: departmentOptions,
  //     disabled: isFormDisabled,
  //   },
  // ]

  return (
    <>
      <div className={classes.titleRow}>
        <h1>{t('orders.new_order_title')}</h1>
        <OrderDetails<FormValues> isEditable control={control} />
        {/* <SubmitButtons /> */}
      </div>
    </>
  )
}

export default NewOrder
