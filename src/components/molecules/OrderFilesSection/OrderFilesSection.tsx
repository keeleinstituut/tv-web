import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import { Control, FieldValues } from 'react-hook-form'
import { ClassifierValueType } from 'types/classifierValues'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import OrderFilesList from 'components/molecules/OrderFilesList/OrderFilesList'

interface OrderFilesSectionProps<TFormValues extends FieldValues> {
  control: Control<TFormValues>
  isEditable?: boolean
}

const OrderFilesSection = <TFormValues extends FieldValues>({
  control,
  isEditable,
}: OrderFilesSectionProps<TFormValues>) => {
  const { t } = useTranslation()
  const { classifierValuesFilters: fileTypeFilters } = useClassifierValuesFetch(
    {
      type: ClassifierValueType.FileType,
    }
  )

  return (
    <div className={classes.container}>
      <h2>{isEditable ? '' : t('orders.files')}</h2>
      <OrderFilesList
        name="source_files"
        title={t('orders.source_files')}
        tooltipContent={t('tooltip.file_format_helper')}
        control={control}
        isEditable={isEditable}
      />
      <OrderFilesList
        title={t('orders.help_files')}
        control={control}
        name="help_files"
        typeOptions={fileTypeFilters}
        isEditable={isEditable}
      />
      {/* TODO: currently not sure where these come from */}
      <OrderFilesList
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
