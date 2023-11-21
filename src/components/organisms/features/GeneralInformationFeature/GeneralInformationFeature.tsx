import { FC, useCallback, useEffect, useMemo } from 'react'
import {
  map,
  filter,
  compact,
  isEmpty,
  split,
  some,
  reduce,
  includes,
  isEqual,
} from 'lodash'
import {
  useUpdateSubOrder,
  useFetchSubOrderCatToolJobs,
  useSubOrderSendToCat,
} from 'hooks/requests/useOrders'
import {
  CatJob,
  CatProjectPayload,
  CatProjectStatus,
  SourceFile,
  SubProjectDetail,
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
import { ClassifierValue } from 'types/classifierValues'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

// TODO: this is WIP code for suborder view

type GeneralInformationFeatureProps = Pick<
  SubProjectDetail,
  | 'cat_files'
  | 'cat_jobs'
  | 'cat_analyzis'
  | 'source_files'
  | 'final_files'
  | 'deadline_at'
  | 'source_language_classifier_value'
  | 'destination_language_classifier_value'
  | 'project'
> & {
  catSupported?: boolean
  subOrderId: string
  projectDomain?: ClassifierValue
}

interface FormValues {
  deadline_at: { date?: string; time?: string }
  cat_files: SourceFile[]
  source_files: SourceFile[]
  final_files: SourceFile[]
  cat_jobs: CatJob[]
  write_to_memory: { [key: string]: boolean }
  // TODO: no idea about these fields
  shared_with_client: boolean[]
}

const GeneralInformationFeature: FC<GeneralInformationFeatureProps> = ({
  catSupported,
  cat_jobs,
  subOrderId,
  cat_analyzis,
  cat_files,
  source_files,
  final_files,
  deadline_at,
  source_language_classifier_value,
  destination_language_classifier_value,
  projectDomain,
  project,
}) => {
  const { t } = useTranslation()
  const { updateSubOrder, isLoading } = useUpdateSubOrder({ id: subOrderId })
  const { sendToCat, isCatProjectLoading } = useSubOrderSendToCat()
  const { catToolJobs, catSetupStatus } = useFetchSubOrderCatToolJobs({
    id: subOrderId,
  })
  const { subOrderTmKeys } = useFetchSubOrderTmKeys({ id: subOrderId })

  const defaultValues = useMemo(
    () => ({
      deadline_at: getLocalDateOjectFromUtcDateString(
        deadline_at || project.deadline_at
      ),
      cat_files,
      source_files: map(source_files, (file) => ({
        ...file,
        isChecked: false,
      })),
      final_files,
      cat_jobs: catToolJobs,
      write_to_memory: {},
      // TODO: no idea about these fields
      shared_with_client: [],
    }),
    [
      deadline_at,
      project.deadline_at,
      cat_files,
      source_files,
      final_files,
      catToolJobs,
    ]
  )

  const { control, getValues, watch, setValue } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  // const newFinalFiles = watch('final_files')

  useEffect(() => {
    if (subOrderTmKeys) {
      setValue(
        'write_to_memory',
        reduce(
          subOrderTmKeys,
          (result, { key, is_writable }) => {
            if (!key) return result
            return { ...result, [key]: is_writable }
          },
          {}
        )
      )
    }
  }, [setValue, subOrderTmKeys])

  // TODO: currently just used this for uploading final_files
  // However not sure if we can use similar logic for all the fields
  // if we can, then we should create 1 useEffect for the entire form and send the payload
  // Whenever any field changes, except for shared_with_client, which will have their own button
  // useEffect(() => {
  //   const attemptFilesUpload = async () => {
  //     try {
  //       // TODO: not sure if this is the correct endpoint and if we can send both the old and new files together like this
  //       // const { data } = await updateSubOrder({
  //       //   final_files: newFinalFiles,
  //       // })
  //       // const savedFinalFiles = data?.final_files
  //       // setValue('final_files', savedFinalFiles, { shouldDirty: false })
  //       showNotification({
  //         type: NotificationTypes.Success,
  //         title: t('notification.announcement'),
  //         content: t('success.final_files_changed'),
  //       })
  //     } catch (errorData) {
  //       showValidationErrorMessage(errorData)
  //     }
  //   }
  //   if (!isEmpty(newFinalFiles) && !isEqual(newFinalFiles, final_files)) {
  //     attemptFilesUpload()
  //   }
  // }, [final_files, newFinalFiles, setValue, t, updateSubOrder])

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

  const handleChangeDeadline = useCallback(
    (value: { date: string; time: string }) => {
      const { date, time } = value
      const dateTime = dayjs.utc(`${date} ${time}`, 'DD/MM/YYYY HH:mm')
      const formattedDateTime = dateTime.format('YYYY-MM-DDTHH:mm:ss[Z]')
      // const isDeadLineChanged = !isEqual(formattedDeadline, formattedDateTime)

      updateSubOrder({
        deadline_at: formattedDateTime,
      })
    },
    [updateSubOrder]
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
    catSupported &&
    isEmpty(catToolJobs) &&
    !includes(CatProjectStatus.Done, catSetupStatus)

  const isGenerateProjectButtonDisabled =
    !some(watch('source_files'), 'isChecked') ||
    !some(watch('write_to_memory'), (val) => !!val) ||
    !includes(CatProjectStatus.NotStarted, catSetupStatus)

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
          maxDate: dayjs(project.deadline_at).toDate(),
          onDateTimeChange: handleChangeDeadline,
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
          catSetupStatus={catSetupStatus}
          subOrderId={subOrderId}
          isEditable
          // isEditable={isEditable}
        />
        <FinalFilesList
          name="final_files"
          title={t('orders.ready_files_from_vendors')}
          // className={classes.filesSection}
          control={control}
          isEditable
          isLoading={isLoading}
          subOrderId={subOrderId}
          // isEditable={isEditable}
        />
        <CatJobsTable
          subOrderId={subOrderId}
          className={classes.catJobs}
          hidden={!catSupported || isEmpty(catToolJobs)}
          cat_jobs={catToolJobs}
          cat_files={cat_files}
          source_files={source_files}
          cat_analyzis={cat_analyzis}
          source_language_classifier_value={source_language_classifier_value}
          destination_language_classifier_value={
            destination_language_classifier_value
          }
          canSendToVendors={true} //TODO add check when camunda is ready
        />
        <TranslationMemoriesSection
          className={classes.translationMemories}
          hidden={!catSupported}
          control={control}
          isEditable
          subOrderId={subOrderId}
          subOrderTmKeys={subOrderTmKeys}
          subOrderLangPair={subOrderLangPair}
          projectDomain={projectDomain}
        />
      </div>
    </Root>
  )
}

export default GeneralInformationFeature
