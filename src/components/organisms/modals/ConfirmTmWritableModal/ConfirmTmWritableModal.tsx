import { FC, useCallback } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'
import { useTranslation } from 'react-i18next'
import { useToggleTmWritable } from 'hooks/requests/useTranslationMemories'
import { SubProjectTmKeysPayload } from 'types/translationMemories'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'

export interface ConfirmTmWritableModalProps
  extends ConfirmationModalBaseProps {
  payload?: SubProjectTmKeysPayload
}

const ConfirmTmWritableModal: FC<ConfirmTmWritableModalProps> = ({
  className,
  handleCancel,
  closeModal,
  payload,
  ...rest
}) => {
  const { t } = useTranslation()
  const { toggleTmWritable, isLoading } = useToggleTmWritable({
    subProjectId: payload?.sub_project_id,
  })

  const handleToggleTmWritable = useCallback(async () => {
    if (!payload) return null
    try {
      await toggleTmWritable(payload)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.translation_memory_updated'),
      })
      closeModal()
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [closeModal, payload, t, toggleTmWritable])

  return (
    <ConfirmationModalBase
      title={t('translation_memory.public_confirmation')}
      cancelButtonContent={t('button.quit')}
      proceedButtonContent={t('button.confirm')}
      handleProceed={handleToggleTmWritable}
      proceedButtonLoading={isLoading}
      helperText={t('translation_memory.public_confirmation_help_text')}
      {...rest}
      closeModal={closeModal}
    />
  )
}

export default ConfirmTmWritableModal
