import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import { map } from 'lodash'
import { Control, FieldValues } from 'react-hook-form'
import OrderFilesList from 'components/molecules/OrderFilesList/OrderFilesList'
import { HelperFileTypes } from 'types/classifierValues'

interface OrderFilesSectionProps<TFormValues extends FieldValues> {
  control: Control<TFormValues>
  isEditable?: boolean
  orderId?: string
}

const OrderFilesSection = <TFormValues extends FieldValues>({
  control,
  isEditable,
  orderId,
}: OrderFilesSectionProps<TFormValues>) => {
  const { t } = useTranslation()
  const fileTypeFilters = map(HelperFileTypes, (filterValue) => ({
    value: filterValue,
    label: t(`orders.file_types.${filterValue}`),
  }))

  return (
    <div className={classes.container}>
      <h2>{isEditable ? '' : t('orders.files')}</h2>
      <OrderFilesList
        orderId={orderId}
        name="source_files"
        title={t('orders.source_files')}
        tooltipContent={t('tooltip.file_format_helper')}
        control={control}
        isEditable={isEditable}
      />
      <OrderFilesList
        orderId={orderId}
        title={t('orders.help_files')}
        control={control}
        name="help_files"
        typeOptions={fileTypeFilters}
        isEditable={isEditable}
      />
      {/* TODO: currently not sure where these come from */}
      <OrderFilesList
        orderId={orderId}
        title={t('orders.feedback_files')}
        control={control}
        name="feedback_files"
        typeOptions={fileTypeFilters}
        hiddenIfNoValue
        isEditable={isEditable}
      />
    </div>
  )
}

export default OrderFilesSection
