import { FC, useCallback } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useTranslation } from 'react-i18next'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useHandleFiles } from 'hooks/requests/useFiles'

export interface ConfirmDeleteSourceFileModalProps
  extends ConfirmationModalBaseProps {
  callback?: () => void
  sourceFileId?: string
  subProjectId?: string
}

const ConfirmDeleteSourceFileModal: FC<ConfirmDeleteSourceFileModalProps> = ({
  callback,
  closeModal,
  sourceFileId,
  subProjectId,
  ...rest
}) => {
  const { t } = useTranslation()
  const { deleteFile } = useHandleFiles({
    reference_object_id: subProjectId ?? '',
    reference_object_type: 'subproject',
    collection: 'source',
  })

  const handleDeleteSourceFile = useCallback(async () => {
    try {
      if (sourceFileId) {
        await deleteFile(sourceFileId)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.source_file_deleted'),
        })
      }
      if (callback) {
        callback()
      }
      closeModal()
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [sourceFileId, callback, closeModal, deleteFile, t])

  return (
    <ConfirmationModalBase
      title={t('modal.confirm_delete_source_file')}
      cancelButtonContent={t('button.quit_alt')}
      proceedButtonContent={t('button.confirm')}
      closeModal={closeModal}
      handleProceed={handleDeleteSourceFile}
      {...rest}
    />
  )
}

export default ConfirmDeleteSourceFileModal
