import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import { Root } from '@radix-ui/react-form'

import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from '../ConfirmationModalBase/ConfirmationModalBase'
import TextInput from 'components/molecules/TextInput/TextInput'
import classes from './classes.module.scss'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useDeclineOutsourceOffer } from 'hooks/requests/useOutsourceRequests'

export interface ConfirmDeclineOfferModalProps extends ConfirmationModalBaseProps {
  offerId: string
}

interface FormValues {
  decline_comment: string
}

const ConfirmDeclineOfferModal: FC<ConfirmDeclineOfferModalProps> = ({
  offerId,
  isModalOpen,
  closeModal,
}) => {
  const { t } = useTranslation()
  const { declineOutsourceOffer, isLoading } = useDeclineOutsourceOffer(offerId)

  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormValues>({
    mode: 'onChange',
    defaultValues: { decline_comment: '' },
  })

  const onSubmit = useCallback(
    async ({ decline_comment }: FormValues) => {
      try {
        await declineOutsourceOffer({ decline_comment })
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
    [declineOutsourceOffer, closeModal, t]
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
        <Root onSubmit={(e) => e.preventDefault()}>
          <Controller
            name="decline_comment"
            control={control}
            rules={{ required: true, validate: (v) => v.trim().length > 0 }}
            render={({ field, fieldState: { error } }) => (
              <TextInput
                {...field}
                ariaLabel={t('requests.decline_comment_placeholder')}
                placeholder={t('requests.decline_comment_placeholder')}
                isTextarea
                error={error}
                inputContainerClassName={classes.inputContainer}
              />
            )}
          />
        </Root>
      }
    />
  )
}

export default ConfirmDeclineOfferModal
