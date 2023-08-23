import { FC, useCallback, useMemo } from 'react'
import { map, keys, filter, compact, isEmpty } from 'lodash'
import { useSubOrderSendToCat } from 'hooks/requests/useOrders'
import {
  CatJob,
  CatProjectPayload,
  SourceFile,
  SubOrderDetail,
} from 'types/orders'
import {
  ModalTypes,
  closeModal,
  showModal,
} from 'components/organisms/modals/ModalRoot'
import { Root } from '@radix-ui/react-form'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import SourceFilesList from 'components/molecules/SourceFilesList/SourceFilesList'

import classes from './classes.module.scss'
import FinalFilesList from 'components/molecules/FinalFilesList/FinalFilesList'
import TranslationMemoriesSection from 'components/organisms/TranslationMemoriesSection/TranslationMemoriesSection'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import CatJobsTable from 'components/organisms/tables/CatJobsTable/CatJobsTable'

// TODO: this is WIP code for suborder view

type GeneralInformationFeatureProps = Pick<
  SubOrderDetail,
  | 'cat_project_created'
  | 'cat_jobs'
  | 'cat_analyzis'
  | 'source_files'
  | 'final_files'
  | 'deadline_at'
  | 'source_language_classifier_value'
  | 'destination_language_classifier_value'
> & {
  catSupported?: boolean
  subOrderId: string
}

interface FormValues {
  deadline_at: string
  source_files: SourceFile[]
  cat_jobs: CatJob[]
  // TODO: no idea about these fields
  source_files_checked: number[]
  shared_with_client: number[]
  write_to_memory: object
}

const GeneralInformationFeature: FC<GeneralInformationFeatureProps> = ({
  catSupported,
  cat_project_created,
  cat_jobs,
  subOrderId,
  cat_analyzis,
  source_files,
  final_files,
  deadline_at,
  source_language_classifier_value,
  destination_language_classifier_value,
}) => {
  const { t } = useTranslation()
  const { sendToCat } = useSubOrderSendToCat({ id: subOrderId })

  const defaultValues = useMemo(
    () => ({
      deadline_at,
      source_files,
      cat_jobs,
      // TODO: no idea about these fields
      source_files_checked: [],
      shared_with_client: [],
      write_to_memory: {},
    }),
    [cat_jobs, deadline_at, source_files]
  )

  const { control, getValues } = useForm<FormValues>({
    reValidateMode: 'onChange',
    values: defaultValues,
  })

  const handleSendToCat = useCallback(async () => {
    const chosenSourceFiles = getValues('source_files_checked')
    const translationMemories = getValues('write_to_memory')
    const sourceFiles = getValues('source_files')

    const selectedSourceFiles = map(
      chosenSourceFiles,
      (index) => sourceFiles[index]
    )
    // TODO: not sure how or what to send
    const payload: CatProjectPayload = {
      source_file_ids: compact(map(selectedSourceFiles, 'id')),
      translation_memory_ids: keys(
        filter(translationMemories, (value) => !!value)
      ),
    }
    try {
      await sendToCat(payload)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.files_sent_to_cat'),
      })
      closeModal()
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [getValues, sendToCat, t])

  const openSendToCatModal = useCallback(
    () =>
      showModal(ModalTypes.ConfirmSendToCat, {
        handleProceed: handleSendToCat,
      }),
    [handleSendToCat]
  )

  return (
    <Root>
      <FormInput
        {...{
          inputType: InputTypes.DateTime,
          ariaLabel: t('label.deadline_at'),
          label: `${t('label.deadline_at')}`,
          control: control,
          name: 'deadline_at',
          // onlyDisplay: !isEditable,
        }}
      />
      <div className={classes.grid}>
        <SourceFilesList
          name="source_files"
          title={t('orders.source_files')}
          tooltipContent={t('tooltip.source_files_helper')}
          // className={classes.filesSection}
          control={control}
          catSupported={catSupported}
          cat_project_created={cat_project_created}
          openSendToCatModal={openSendToCatModal}
          isEditable
          // isEditable={isEditable}
        />
        <FinalFilesList
          // TODO: not sure what the field name will be
          name="ready_files"
          title={t('orders.ready_files_from_vendors')}
          // className={classes.filesSection}
          control={control}
          isEditable
          // isEditable={isEditable}
        />
        <CatJobsTable
          className={classes.catJobs}
          hidden={!catSupported || !cat_project_created || isEmpty(cat_jobs)}
          cat_jobs={cat_jobs}
          source_files={source_files}
          cat_analyzis={cat_analyzis}
          source_language_classifier_value={source_language_classifier_value}
          destination_language_classifier_value={
            destination_language_classifier_value
          }
        />
        <TranslationMemoriesSection
          className={classes.translationMemories}
          hidden={!catSupported}
          control={control}
          isEditable
        />
      </div>
    </Root>
  )
}

export default GeneralInformationFeature
