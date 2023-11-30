import { FC, useCallback } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useTranslation } from 'react-i18next'

import { VolumeValue } from 'types/volumes'
import { useAssignmentRemoveVolume } from 'hooks/requests/useVolumes'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'

export interface ConfirmDeleteVolumeModalProps
  extends ConfirmationModalBaseProps {
  newVolumes?: VolumeValue[]
  callback?: () => void
  assignmentId?: string
  volumeId?: string
  sub_project_id?: string
}

const ConfirmDeleteVolumeModal: FC<ConfirmDeleteVolumeModalProps> = ({
  newVolumes,
  callback,
  assignmentId,
  sub_project_id,
  closeModal,
  volumeId,
  ...rest
}) => {
  const { t } = useTranslation()
  const { removeAssignmentVolume } = useAssignmentRemoveVolume({
    subProjectId: sub_project_id,
  })

  const handleDeleteVolume = useCallback(async () => {
    try {
      await removeAssignmentVolume({ volumeId })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.volume_deleted'),
      })
      if (callback) {
        callback()
      }
      closeModal()
    } catch (errorData) {
      // We should not get any 422 errors from here, but will handle just in case
      showValidationErrorMessage(errorData)
    }
  }, [callback, closeModal, removeAssignmentVolume, t, volumeId])

  return (
    <ConfirmationModalBase
      title={t('modal.confirm_delete_volume')}
      cancelButtonContent={t('button.quit')}
      proceedButtonContent={t('button.confirm')}
      closeModal={closeModal}
      handleProceed={handleDeleteVolume}
      {...rest}
    />
  )
}

export default ConfirmDeleteVolumeModal
