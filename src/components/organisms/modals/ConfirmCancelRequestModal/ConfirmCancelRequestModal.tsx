import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import { Root } from '@radix-ui/react-form'

import classes from './classes.module.scss'
import ModalBase, {
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import Button, { AppearanceTypes, SizeTypes } from 'components/molecules/Button/Button'
import TextInput from 'components/molecules/TextInput/TextInput'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useCancelOutsourceRequest } from 'hooks/requests/useOutsourceRequests'

export interface ConfirmCancelRequestModalProps {
  requestId: string
  isModalOpen?: boolean
  closeModal: () => void
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
    <ModalBase
      open={!!isModalOpen}
      title={t('requests.cancel_modal_title')}
      helperText={t('requests.cancel_modal_helper')}
      titleFont={TitleFontTypes.Gray}
      buttonComponent={
        <div className={classes.footer}>
          <Button
            appearance={AppearanceTypes.Secondary}
            size={SizeTypes.M}
            autoFocus
            onClick={closeModal}
          >
            {t('requests.cancel_button')}
          </Button>
          <Button
            appearance={AppearanceTypes.Primary}
            disabled={!isValid}
            loading={isLoading}
            onClick={handleSubmit(onSubmit)}
          >
            {t('requests.cancel_request')}
          </Button>
        </div>
      }
    >
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
              className={classes.reasonInput}
            />
          )}
        />
      </Root>
    </ModalBase>
  )
}

export default ConfirmCancelRequestModal
