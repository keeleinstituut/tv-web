import { FC, useCallback, useEffect, useMemo } from 'react'
import { map, keys, filter, compact, isEmpty, isEqual } from 'lodash'
import {
  useSubOrderSendToCat,
  useUpdateSubOrder,
} from 'hooks/requests/useOrders'
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
import { getLocalDateOjectFromUtcDateString } from 'helpers'

// TODO: this is WIP code for suborder view

type GeneralInformationFeatureProps = Pick<
  SubOrderDetail,
  | 'cat_project_created'
  | 'cat_jobs'
  | 'cat_analyzis'
  | 'intermediate_files'
  | 'final_files'
  | 'deadline_at'
  | 'source_language_classifier_value'
  | 'destination_language_classifier_value'
> & {
  catSupported?: boolean
  subOrderId: string
}

interface FormValues {
  deadline_at: { date?: string; time?: string }
  intermediate_files: SourceFile[]
  final_files: SourceFile[]
  cat_jobs: CatJob[]
  // TODO: no idea about these fields
  intermediate_files_checked: number[]
  shared_with_client: boolean[]
  write_to_memory: object
}

const GeneralInformationFeature: FC<GeneralInformationFeatureProps> = ({
  catSupported,
  cat_project_created,
  cat_jobs,
  subOrderId,
  cat_analyzis,
  intermediate_files,
  final_files,
  deadline_at,
  source_language_classifier_value,
  destination_language_classifier_value,
}) => {
  const { t } = useTranslation()
  const { sendToCat } = useSubOrderSendToCat({ id: subOrderId })
  const { updateSubOrder, isLoading } = useUpdateSubOrder({ id: subOrderId })

  const defaultValues = useMemo(
    () => ({
      deadline_at: deadline_at
        ? getLocalDateOjectFromUtcDateString(deadline_at)
        : { date: '', time: '' },
      intermediate_files,
      final_files,
      cat_jobs,
      // TODO: no idea about these fields
      intermediate_files_checked: [],
      shared_with_client: [],
      write_to_memory: {},
    }),
    [cat_jobs, deadline_at, final_files, intermediate_files]
  )

  const { control, getValues, watch, setValue } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  const newFinalFiles = watch('final_files')

  // TODO: currently just used this for uploading final_files
  // However not sure if we can use similar logic for all the fields
  // if we can, then we should create 1 useEffect for the entire form and send the payload
  // Whenever any field changes, except for shared_with_client, which will have their own button
  useEffect(() => {
    const attemptFilesUpload = async () => {
      try {
        // TODO: not sure if this is the correct endpoint and if we can send both the old and new files together like this
        const { data } = await updateSubOrder({
          final_files: newFinalFiles,
        })
        const savedFinalFiles = data?.final_files
        setValue('final_files', savedFinalFiles, { shouldDirty: false })
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.final_files_changed'),
        })
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    }
    if (!isEmpty(newFinalFiles) && !isEqual(newFinalFiles, final_files)) {
      attemptFilesUpload()
    }
  }, [final_files, newFinalFiles, setValue, t, updateSubOrder])

  const handleSendToCat = useCallback(async () => {
    const chosenSourceFiles = getValues('intermediate_files_checked')
    const translationMemories = getValues('write_to_memory')
    const sourceFiles = getValues('intermediate_files')

    const selectedIntermediateFiles = map(
      chosenSourceFiles,
      (index) => sourceFiles[index]
    )
    // TODO: not sure how or what to send
    const payload: CatProjectPayload = {
      intermediate_file_ids: compact(map(selectedIntermediateFiles, 'id')),
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
          minDate: new Date(),
          // onlyDisplay: !isEditable,
        }}
      />
      <div className={classes.grid}>
        <SourceFilesList
          name="intermediate_files"
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
          name="final_files"
          title={t('orders.ready_files_from_vendors')}
          // className={classes.filesSection}
          control={control}
          isEditable
          isLoading={isLoading}
          // isEditable={isEditable}
        />
        <CatJobsTable
          className={classes.catJobs}
          hidden={!catSupported || !cat_project_created || isEmpty(cat_jobs)}
          cat_jobs={cat_jobs}
          intermediate_files={intermediate_files}
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
