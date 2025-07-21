/* eslint-disable react-hooks/exhaustive-deps */
import { FC } from 'react'
import { AppearanceTypes, SizeTypes } from 'components/molecules/Button/Button'
import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { useTranslation } from 'react-i18next'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { SubmitHandler, useForm } from 'react-hook-form'

export type AuditLogSettingsFormValues = {
  event_record_retention_time: number
}

export interface AuditLogSettingsModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  setting?: AuditLogSettingsFormValues
  title?: string
  updateSetting?: (values: AuditLogSettingsFormValues) => void
}

const AuditLogSettingsModal: FC<AuditLogSettingsModalProps> = ({
  isModalOpen,
  closeModal,
  setting,
  title,
  updateSetting,
}) => {
  const { t } = useTranslation()

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isValid, isDirty },
  } = useForm<AuditLogSettingsFormValues>({
    mode: 'onChange',
    defaultValues: setting,
    resetOptions: {
      keepErrors: true,
    },
  })

  const inputFields: FieldProps<AuditLogSettingsFormValues>[] = [
    {
      name: 'event_record_retention_time',
      label: `${t('audit_log.event_record_retention_time')} (${t(
        'audit_log.retention_time_unit'
      )})`,
      ariaLabel: `${t('audit_log.event_record_retention_time')} (${t(
        'audit_log.retention_time_unit'
      )})`,
      inputType: InputTypes.Text,
    },
  ]

  const onSubmit: SubmitHandler<AuditLogSettingsFormValues> = async (
    values
  ) => {
    if (updateSetting) {
      await updateSetting(values)
    }
    reset()
    closeModal()
  }

  return (
    <ModalBase
      title={title}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      buttonsPosition={ButtonPositionTypes.Right}
      size={ModalSizeTypes.Narrow}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          children: t('button.cancel'),
          size: SizeTypes.M,
          id: 'focusButton',
          onClick: () => {
            reset()
            closeModal()
          },
        },
        {
          appearance: AppearanceTypes.Primary,
          form: 'editableList',
          children: t('button.save'),
          loading: isSubmitting,
          type: 'submit',
          disabled: !isValid || !isDirty,
        },
      ]}
    >
      <DynamicForm
        formId="editableList"
        fields={inputFields}
        control={control}
        onSubmit={handleSubmit(onSubmit)}
      />
    </ModalBase>
  )
}

export default AuditLogSettingsModal
