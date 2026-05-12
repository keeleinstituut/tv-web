import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'

import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from '../ConfirmationModalBase/ConfirmationModalBase'
import TextInput from 'components/molecules/TextInput/TextInput'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useDeclineProjectRequest } from 'hooks/requests/useProjectRequests'

export interface ConfirmDeclineRequestModalProps
  extends ConfirmationModalBaseProps {
  requestId: string
}

interface FormValues {
  comment: string
}

const ConfirmDeclineRequestModal: FC<ConfirmDeclineRequestModalProps> = ({
  requestId,
  isModalOpen,
  closeModal,
}) => {
  const { t } = useTranslation()
  const { declineProjectRequest, isLoading } =
    useDeclineProjectRequest(requestId)

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: { comment: '' },
  })

  const onSubmit = useCallback(
    async ({ comment }: FormValues) => {
      try {
        await declineProjectRequest({ comment })
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('requests.decline_success'),
        })
        closeModal()
      } catch (error) {
        showValidationErrorMessage(error)
      }
    },
    [declineProjectRequest, closeModal, t]
  )

  return (
    <ConfirmationModalBase
      isModalOpen={isModalOpen}
      closeModal={closeModal}
      title={t('requests.decline_modal_title')}
      helperText={t('requests.decline_modal_helper')}
      cancelButtonContent={t('requests.cancel_button')}
      proceedButtonContent={t('requests.decline_request')}
      proceedButtonDisabled={!isValid}
      proceedButtonLoading={isLoading}
      handleProceed={handleSubmit(onSubmit)}
      modalContent={
        <Controller
          name="comment"
          control={control}
          rules={{ required: true, validate: (v) => v.trim().length > 0 }}
          render={({ field, fieldState: { error } }) => (
            <TextInput
              {...field}
              ariaLabel={t('requests.decline_comment_placeholder')}
              placeholder={t('requests.decline_comment_placeholder')}
              isTextarea
              error={error}
            />
          )}
        />
      }
    />
  )
}

export default ConfirmDeclineRequestModal
