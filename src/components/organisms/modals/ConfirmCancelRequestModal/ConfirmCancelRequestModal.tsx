import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import { Root } from '@radix-ui/react-form'

import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from '../ConfirmationModalBase/ConfirmationModalBase'
import TextInput from 'components/molecules/TextInput/TextInput'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useCancelOutsourceRequest } from 'hooks/requests/useProjectRequests'

export interface ConfirmCancelRequestModalProps extends ConfirmationModalBaseProps {
  requestId: string
  onCancelled?: () => void
}

interface FormValues {
  cancellation_reason: string
}

const ConfirmCancelRequestModal: FC<ConfirmCancelRequestModalProps> = ({
  requestId,
  isModalOpen,
  closeModal,
  onCancelled,
}) => {
  const { t } = useTranslation()
  const { cancelOutsourceRequest, isLoading } =
    useCancelOutsourceRequest(requestId)

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: { cancellation_reason: '' },
  })

  const onSubmit = useCallback(
    async ({ cancellation_reason }: FormValues) => {
      try {
        await cancelOutsourceRequest({ cancellation_reason })
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('requests.cancel_success'),
        })
        closeModal()
        if (onCancelled) onCancelled()
      } catch (error) {
        showValidationErrorMessage(error)
      }
    },
    [cancelOutsourceRequest, closeModal, onCancelled, t]
  )

  return (
    <ConfirmationModalBase
      isModalOpen={isModalOpen}
      closeModal={closeModal}
      title={t('requests.cancel_modal_title')}
      helperText={t('requests.cancel_modal_helper')}
      cancelButtonContent={t('requests.cancel_button')}
      proceedButtonContent={t('requests.cancel_request')}
      proceedButtonDisabled={!isValid}
      proceedButtonLoading={isLoading}
      handleProceed={handleSubmit(onSubmit)}
      modalContent={
        <Root onSubmit={(e) => e.preventDefault()}>
          <Controller
            name="cancellation_reason"
            control={control}
            rules={{ required: true, validate: (v) => v.trim().length > 0 }}
            render={({ field, fieldState: { error } }) => (
              <TextInput
                {...field}
                ariaLabel={t('requests.cancel_comment_placeholder')}
                placeholder={t('requests.cancel_comment_placeholder')}
                isTextarea
                error={error}
              />
            )}
          />
        </Root>
      }
    />
  )
}

export default ConfirmCancelRequestModal
