import { FC, useCallback } from 'react'
import ConfirmationModalBase, {
  ConfirmationModalBaseProps,
} from 'components/organisms/modals/ConfirmationModalBase/ConfirmationModalBase'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { useMergeCatJobs } from 'hooks/requests/useProjects'
import { closeModal } from '../ModalRoot'

export interface CatMergeModalProps
  extends Omit<ConfirmationModalBaseProps, 'handleProceed'> {
  subProjectId?: string
}

const CatMergeModal: FC<CatMergeModalProps> = ({ subProjectId, ...rest }) => {
  const { t } = useTranslation()
  const { mergeCatJobs } = useMergeCatJobs()

  const handleMerge = useCallback(async () => {
    const payload = {
      sub_project_id: subProjectId || '',
    }
    try {
      await mergeCatJobs(payload)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.file_merge_success'),
      })
      closeModal()
    } catch (errorData) {
      // error message comes from api errorHandles
    }
  }, [mergeCatJobs, subProjectId, t])

  return (
    <ConfirmationModalBase
      {...rest}
      handleProceed={handleMerge}
      title={t('modal.cat_merge_title')}
      modalContent={
        <p className={classes.content}>{t('modal.cat_merge_content')}</p>
      }
    />
  )
}

export default CatMergeModal
