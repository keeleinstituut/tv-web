import { FC, useState } from 'react'
import { includes } from 'lodash'
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
  ProjectFileTypes,
} from 'components/organisms/FileImport/FileImport'
import { showModal, ModalTypes } from '../modals/ModalRoot'
import {
  useExportTMX,
  useFetchTranslationMemory,
  useImportTMX,
} from 'hooks/requests/useTranslationMemories'

type TranslationMemoryDetailsTypes = {
  memoryId?: string
}

const TranslationMemoryDetails: FC<TranslationMemoryDetailsTypes> = ({
  memoryId,
}) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { translationMemory } = useFetchTranslationMemory({ id: memoryId })
  const { importTMX } = useImportTMX()
  const { exportTMX } = useExportTMX()

  // const isUserClientOfProject = institutionUserId === client_user_institution_id

  console.log('translationMemory', translationMemory)

  const handleImportSegments = async (uploadedFile: File) => {
    console.log('Import', uploadedFile)

    try {
      await importTMX(uploadedFile)
    } catch (error) {
      console.log('error', error)
    }
  }

  const handleExportFile = () => {
    exportTMX({ slang: '', tlang: '' })
    console.log('Export file')
  }

  const handleDeleteMemory = () => {
    showModal(ModalTypes.ConfirmationModal, {
      handleProceed: () => console.log('yes'),
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
          // disabled={!includes(userPrivileges, Privileges.ImportTm)}
        />
        <Button
          appearance={AppearanceTypes.Secondary}
          size={SizeTypes.S}
          onClick={handleExportFile}
          children={t('button.export')}
          //disabled={!includes(userPrivileges, Privileges.ExportTm)}
        />
        <Button
          appearance={AppearanceTypes.Text}
          iconPositioning={IconPositioningTypes.Right}
          icon={Delete}
          children={t('button.delete_translation_memory')}
          className={classes.deleteButton}
          onClick={handleDeleteMemory}
          // hidden={!includes(userPrivileges, Privileges.DeleteTm)}
        />
      </div>
      <TranslationMemoryEditForm data={translationMemory} />
    </Container>
  )
}

export default TranslationMemoryDetails
