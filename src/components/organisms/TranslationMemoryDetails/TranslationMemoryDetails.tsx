import { FC } from 'react'
import { includes, split } from 'lodash'
import { useTranslation } from 'react-i18next'
import { Privileges } from 'types/privileges'
import classes from './classes.module.scss'
import useAuth from 'hooks/useAuth'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import Container from 'components/atoms/Container/Container'
import TranslationMemoryEditForm from 'components/organisms/forms/TranslationMemoryEditForm/TranslationMemoryEditForm'
import FileImport, {
  InputFileTypes,
} from 'components/organisms/FileImport/FileImport'
import { showModal, ModalTypes } from '../modals/ModalRoot'
import {
  useDeleteTranslationMemory,
  useExportTMX,
  useImportTMX,
} from 'hooks/requests/useTranslationMemories'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from '../NotificationRoot/NotificationRoot'
import { TranslationMemoryType } from 'types/translationMemories'
import { useNavigate } from 'react-router-dom'

type TranslationMemoryDetailsTypes = {
  translationMemory: Partial<TranslationMemoryType>
  isTmOwnedByUserInstitution?: boolean
  memoryId: string
}

const TranslationMemoryDetails: FC<TranslationMemoryDetailsTypes> = ({
  translationMemory,
  isTmOwnedByUserInstitution,
  memoryId,
}) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { deleteTranslationMemory } = useDeleteTranslationMemory()
  const { importTMX } = useImportTMX()
  const { exportTMX } = useExportTMX()
  const navigate = useNavigate()

  const { lang_pair } = translationMemory || {}

  console.log(
    'translationMemory',
    translationMemory,
    isTmOwnedByUserInstitution
  )

  const handleImportSegments = async (uploadedFile: File) => {
    const payload = {
      file: uploadedFile,
      tag: memoryId,
    }
    try {
      await importTMX(payload)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.translation_memory_import'),
      })
    } catch (error) {
      showNotification({
        type: NotificationTypes.Error,
        title: t('notification.error'),
        content: t('notification.tm_import_failed'),
      })
    }
  }

  const handleExportFile = async () => {
    const langPair = split(lang_pair, '_')
    const payload = {
      slang: langPair[0],
      tlang: langPair[1],
      tag: memoryId,
    }
    try {
      await exportTMX(payload)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.translation_memory_export'),
      })
    } catch (error) {
      showNotification({
        type: NotificationTypes.Error,
        title: t('notification.error'),
        content: t('notification.tm_export_failed'),
      })
    }
  }

  const handleDeleteMemory = () => {
    showModal(ModalTypes.ConfirmationModal, {
      handleProceed: async () => {
        try {
          await deleteTranslationMemory(memoryId)
          showNotification({
            type: NotificationTypes.Success,
            title: t('notification.announcement'),
            content: t('success.translation_memory_deleted'),
          })
          navigate('/memories')
        } catch (error) {
          showNotification({
            type: NotificationTypes.Error,
            title: t('notification.error'),
            content: t('notification.tm_delete_failed'),
          })
        }
      },
      modalContent: (
        <h1 className={classes.modalText}>
          {t('translation_memories.delete_confirmation_text')}
        </h1>
      ),
    })
  }

  return (
    <Container className={classes.container}>
      <div className={classes.titleRow}>
        <h3 className={classes.title}>
          {t('translation_memories.memory_details')}
        </h3>

        <FileImport
          fileButtonText={t('button.import_tmx')}
          isFilesListHidden
          size={SizeTypes.S}
          inputFileTypes={[InputFileTypes.Tmx]}
          onChange={handleImportSegments}
          allowMultiple={false}
          disabled={
            !includes(userPrivileges, Privileges.ImportTm) ||
            !isTmOwnedByUserInstitution
          }
        />
        <Button
          appearance={AppearanceTypes.Secondary}
          size={SizeTypes.S}
          onClick={handleExportFile}
          children={t('button.export')}
          disabled={
            !includes(userPrivileges, Privileges.ExportTm) ||
            !isTmOwnedByUserInstitution
          }
        />
        <Button
          appearance={AppearanceTypes.Text}
          iconPositioning={IconPositioningTypes.Right}
          icon={Delete}
          children={t('button.delete_translation_memory')}
          className={classes.deleteButton}
          onClick={handleDeleteMemory}
          hidden={
            !includes(userPrivileges, Privileges.DeleteTm) ||
            !isTmOwnedByUserInstitution
          }
        />
      </div>
      <TranslationMemoryEditForm
        data={translationMemory || {}}
        isTmOwnedByUserInstitution={isTmOwnedByUserInstitution}
      />
    </Container>
  )
}

export default TranslationMemoryDetails
