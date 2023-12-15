import { FC, useCallback } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'
import { useTranslation } from 'react-i18next'

import classes from './classes.module.scss'
import { useSubProjectSendToCat } from 'hooks/requests/useProjects'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { closeModal } from '../ModalRoot'
import { showValidationErrorMessage } from 'api/errorHandler'
import { CatProjectPayload } from 'types/projects'

export interface ConfirmSendToCatModalProps extends ConfirmationModalBaseProps {
  sendPayload?: CatProjectPayload
  callback?: () => void
}

const ConfirmSendToCatModal: FC<ConfirmSendToCatModalProps> = ({
  sendPayload,
  callback,
  ...rest
}) => {
  const { t } = useTranslation()
  const { sendToCat, isCatProjectLoading } = useSubProjectSendToCat()

  const handleSendToCat = useCallback(async () => {
    if (!sendPayload) return true
    try {
      await sendToCat(sendPayload)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.files_sent_to_cat'),
      })
      callback?.()
      closeModal()
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [sendPayload, sendToCat, t, callback])

  return (
    <ConfirmationModalBase
      title={t('modal.confirm_send_to_cat_title')}
      cancelButtonContent={t('button.quit')}
      proceedButtonContent={t('button.send')}
      proceedButtonLoading={isCatProjectLoading}
      handleProceed={handleSendToCat}
      {...rest}
      modalContent={
        <>
          <p className={classes.helpText}>
            {t('modal.confirm_send_to_cat_description')}
          </p>
          <br />
          <p className={classes.helpText}>{t('modal.confirm_source_files')}</p>
          <p className={classes.helpText}>
            {t('modal.confirm_translation_memories')}
          </p>
        </>
      }
    />
  )
}

export default ConfirmSendToCatModal
