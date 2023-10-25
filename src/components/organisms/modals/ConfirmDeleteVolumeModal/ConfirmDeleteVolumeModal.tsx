import { FC, useCallback } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useTranslation } from 'react-i18next'

import { VolumeValue } from 'types/volumes'
import {
  useAssignmentRemoveVolume,
  useAssignmentUpdate,
} from 'hooks/requests/useAssignments'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'

export interface ConfirmDeleteVolumeModalProps
  extends ConfirmationModalBaseProps {
  newVolumes?: VolumeValue[]
  callback?: () => void
  assignmentId?: string
  volumeId?: string
  subOrderId?: string
}

const ConfirmDeleteVolumeModal: FC<ConfirmDeleteVolumeModalProps> = ({
  newVolumes,
  callback,
  assignmentId,
  subOrderId,
  closeModal,
  volumeId,
  ...rest
}) => {
  const { t } = useTranslation()
  const { updateAssignment } = useAssignmentUpdate({ id: assignmentId })
  const { removeAssignmentVolume } = useAssignmentRemoveVolume({
    subOrderId,
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
