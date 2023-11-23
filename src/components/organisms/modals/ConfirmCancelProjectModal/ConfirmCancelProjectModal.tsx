import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { closeModal } from '../ModalRoot'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from '../ConfirmationModalBase/ConfirmationModalBase'
import { SubmitHandler, useForm } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useCancelProject } from 'hooks/requests/useProjects'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import classes from './classes.module.scss'

export interface ConfirmCancelProjectModalProps
  extends ConfirmationModalBaseProps {
  projectId?: string
}

interface FormValues {
  reason: string
  comments: string
}

const ConfirmCancelProjectModal: FC<ConfirmCancelProjectModalProps> = ({
  projectId,
  isModalOpen,
}) => {
  const { t } = useTranslation()
  const { cancelProject, isLoading } = useCancelProject({ id: projectId })

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormValues>({
    reValidateMode: 'onChange',
  })

  const formFields: FieldProps<FormValues>[] = useMemo(
    () => [
      {
        inputType: InputTypes.Text,
        label: `${t('label.cancellation_reason')}*`,
        ariaLabel: t('label.cancellation_reason'),
        placeholder: t('placeholder.cancellation_reason'),
        name: 'reason',
        className: classes.inputInternalPosition,
        isTextarea: true,
        rows: 3,
        rules: {
          required: true,
        },
      },
      {
        inputType: InputTypes.Text,
        label: t('label.comment'),
        ariaLabel: t('label.comment'),
        placeholder: t('placeholder.comment'),
        name: 'comments',
        className: classes.inputInternalPosition,
        isTextarea: true,
        rows: 3,
      },
    ],
    [t]
  )

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      await cancelProject(values)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.project_cancelled'),
      })
      closeModal()
    },
    [cancelProject, t]
  )

  return (
    <ConfirmationModalBase
      isModalOpen={isModalOpen}
      handleProceed={handleSubmit(onSubmit)}
      proceedButtonDisabled={!isValid}
      cancelButtonContent={t('button.quit_alt')}
      proceedButtonContent={t('button.confirm_cancellation')}
      title={t('modal.confirm_project_cancellation_title')}
      helperText={t('modal.confirm_project_cancellation_helper')}
      proceedButtonLoading={isLoading}
      closeModal={closeModal}
      modalContent={<DynamicForm control={control} fields={formFields} />}
    />
  )
}

export default ConfirmCancelProjectModal
