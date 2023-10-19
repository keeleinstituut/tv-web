import { FC, useCallback, useEffect, useMemo } from 'react'
import {
  map,
  keys,
  filter,
  compact,
  isEmpty,
  isEqual,
  split,
  some,
  find,
  size,
} from 'lodash'
import {
  useUpdateSubOrder,
  useFetchSubOrderCatToolJobs,
  useSubOrderSendToCat,
} from 'hooks/requests/useOrders'
import {
  CatFile,
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
import { useFetchSubOrderTmKeys } from 'hooks/requests/useTranslationMemories'
import { getLocalDateOjectFromUtcDateString } from 'helpers'

// TODO: this is WIP code for suborder view

type GeneralInformationFeatureProps = Pick<
  SubOrderDetail,
  | 'cat_files'
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
  deadline_at: { date?: string; time?: string }
  source_files: SourceFile[]
  final_files: SourceFile[]
  cat_jobs: CatJob[]
  cat_files: CatFile[]
  // TODO: no idea about these fields
  shared_with_client: boolean[]
  write_to_memory: object
}

const GeneralInformationFeature: FC<GeneralInformationFeatureProps> = ({
  catSupported,
  cat_jobs,
  cat_files,
  subOrderId,
  cat_analyzis,
  source_files,
  final_files,
  deadline_at,
  source_language_classifier_value,
  destination_language_classifier_value,
}) => {
  const { t } = useTranslation()
  const { updateSubOrder, isLoading } = useUpdateSubOrder({ id: subOrderId })
  const { sendToCat, isCatProjectCreated, isCatProjectLoading } =
    useSubOrderSendToCat()
  const { catToolJobs } = useFetchSubOrderCatToolJobs({ id: subOrderId })
  const { subOrderTmKeys } = useFetchSubOrderTmKeys({ id: subOrderId })

  console.log('data catToolJobs', catToolJobs)
  // console.log('catSupported', catSupported)
  // const cat_project_created = !isEmpty(catToolJobs)
  // console.log('cat_project_created', cat_project_created)

  const defaultValues = useMemo(
    () => ({
      deadline_at: deadline_at
        ? getLocalDateOjectFromUtcDateString(deadline_at)
        : { date: '', time: '' },
      source_files: map(source_files, (file) => ({
        ...file,
        ...{ isChecked: false },
      })),
      final_files,
      cat_jobs,
      write_to_memory: {},
      // TODO: no idea about these fields
      shared_with_client: [],
    }),
    [cat_jobs, deadline_at, final_files, source_files]
  )

  const { control, getValues, watch, setValue } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })
  // console.log('second watch', watch())
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
    const sourceFiles = getValues('source_files')
    const selectedSourceFiles = filter(sourceFiles, 'isChecked')

    const payload: CatProjectPayload = {
      sub_project_id: subOrderId,
      source_files_ids: compact(map(selectedSourceFiles, 'id')),
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
  }, [getValues, sendToCat, subOrderId, t])

  const openSendToCatModal = useCallback(
    () =>
      showModal(ModalTypes.ConfirmSendToCat, {
        handleProceed: handleSendToCat,
      }),
    [handleSendToCat]
  )

  const subOrderLangPair = useMemo(() => {
    const slangShort = split(source_language_classifier_value?.value, '-')[0]
    const tlangShort = split(
      destination_language_classifier_value?.value,
      '-'
    )[0]
    return `${slangShort}_${tlangShort}`
  }, [destination_language_classifier_value, source_language_classifier_value])

  const canGenerateProject =
    !isCatProjectCreated && isEmpty(cat_files) && catSupported

  const isGenerateProjectButtonDisabled =
    !some(watch('source_files'), 'isChecked') ||
    !some(watch('write_to_memory'), (val) => !!val)

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
          name="source_files"
          title={t('orders.source_files')}
          tooltipContent={t('tooltip.source_files_helper')}
          control={control}
          openSendToCatModal={openSendToCatModal}
          canGenerateProject={canGenerateProject}
          isGenerateProjectButtonDisabled={isGenerateProjectButtonDisabled}
          isCatProjectLoading={isCatProjectLoading}
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
          hidden={canGenerateProject}
          cat_jobs={cat_jobs}
          cat_files={cat_files}
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
          subOrderId={subOrderId}
          subOrderTmKeys={subOrderTmKeys}
          subOrderLangPair={subOrderLangPair}
        />
      </div>
    </Root>
  )
}

export default GeneralInformationFeature
