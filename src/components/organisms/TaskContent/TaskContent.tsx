import Loader from 'components/atoms/Loader/Loader'
import {
  useFetchSubOrderCatToolJobs,
  useSubOrderSendToCat,
  useUpdateSubOrder,
} from 'hooks/requests/useOrders'
import { FC, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Root } from '@radix-ui/react-form'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import SourceFilesList from 'components/molecules/SourceFilesList/SourceFilesList'
import FinalFilesList from 'components/molecules/FinalFilesList/FinalFilesList'
import CatJobsTable from 'components/organisms/tables/CatJobsTable/CatJobsTable'
import {
  compact,
  filter,
  includes,
  isEmpty,
  map,
  reduce,
  some,
  split,
} from 'lodash'
import TranslationMemoriesSection from 'components/organisms/TranslationMemoriesSection/TranslationMemoriesSection'
import { useForm } from 'react-hook-form'
import { useFetchSubOrderTmKeys } from 'hooks/requests/useTranslationMemories'
import { getLocalDateOjectFromUtcDateString } from 'helpers'
import {
  CatAnalysis,
  CatJob,
  CatProjectPayload,
  CatProjectStatus,
  SourceFile,
} from 'types/orders'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import dayjs from 'dayjs'

import classes from './classes.module.scss'
import { LanguageClassifierValue } from 'types/classifierValues'

interface FormValues {
  deadline_at: { date?: string; time?: string }
  cat_files: SourceFile[]
  my_source_files: SourceFile[]
  my_final_files: SourceFile[]
  cat_jobs: CatJob[]
  write_to_memory: { [key: string]: boolean }
  shared_with_client: boolean[]
  my_notes?: string
}

interface TaskContentProps {
  id?: string
  deadline_at?: string
  source_files?: SourceFile[]
  cat_files?: SourceFile[]
  cat_jobs?: CatJob[]
  cat_analyzis: CatAnalysis[]
  final_files: SourceFile[]
  source_language_classifier_value?: LanguageClassifierValue
  destination_language_classifier_value?: LanguageClassifierValue
  event_start_at?: string
}

const TaskContent: FC<TaskContentProps> = ({
  id,
  deadline_at,
  source_files,
  cat_files,
  cat_jobs,
  cat_analyzis,
  final_files,
  source_language_classifier_value,
  destination_language_classifier_value,
  event_start_at,
}) => {
  const { t } = useTranslation()

  //   const { subOrder, isLoading } = useFetchSubOrder({ id })

  const { updateSubOrder, isLoading } = useUpdateSubOrder({ id: id })
  const { sendToCat, isCatProjectLoading } = useSubOrderSendToCat()
  const { catToolJobs, catSetupStatus } = useFetchSubOrderCatToolJobs({
    // id: id,
    id: '9a8e440e-33fc-453c-9497-e2c5690d4563',
  })
  const { subOrderTmKeys } = useFetchSubOrderTmKeys({
    id: '9a8e440e-33fc-453c-9497-e2c5690d4563',
  })

  const defaultValues = useMemo(
    () => ({
      deadline_at: deadline_at
        ? getLocalDateOjectFromUtcDateString(deadline_at)
        : { date: '', time: '' },
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
    [catToolJobs, deadline_at, final_files, cat_files, source_files]
  )

  const { control, getValues, watch, setValue } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

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

  const handleSendToCat = useCallback(async () => {
    const sourceFiles = getValues('my_source_files')
    const selectedSourceFiles = filter(sourceFiles, 'isChecked')

    const payload: CatProjectPayload = {
      sub_project_id: id || '',
      source_files_ids: compact(map(selectedSourceFiles, 'id')),
    }

    // try {
    //   await sendToCat(payload)
    //   showNotification({
    //     type: NotificationTypes.Success,
    //     title: t('notification.announcement'),
    //     content: t('success.files_sent_to_cat'),
    //   })
    //   closeModal()
    // } catch (errorData) {
    //   showValidationErrorMessage(errorData)
    // }
  }, [getValues, id])

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
    // catSupported &&
    isEmpty(catToolJobs) && !includes(CatProjectStatus.Done, catSetupStatus)

  const isGenerateProjectButtonDisabled =
    !some(watch('my_source_files'), 'isChecked') ||
    !some(watch('write_to_memory'), (val) => !!val) ||
    !includes(CatProjectStatus.NotStarted, catSetupStatus)

  const formattedDate = (date: any) => {
    return dayjs(date).format('DD.MM.YYYY HH:mm')
  }

  const taskDetails = [
    {
      label: t('my_tasks.start_time'),
      content: event_start_at ? formattedDate(event_start_at) : '-',
      oralTranslation: true,
    },
    {
      label: t('label.deadline_at'),
      content: deadline_at ? formattedDate(deadline_at) : '-',
    },
    {
      label: t('label.special_instructions'),
      //TODO: add correct variable for content
      content: 'Siin on mingi lisainfo.',
    },
    {
      label: t('label.volume'),
      //TODO: add correct variable for content
      content: '4h',
    },
  ]

  if (isLoading) return <Loader loading={isLoading} />

  return (
    <Root>
      <div className={classes.taskDetailsContainer}>
        {map(taskDetails, ({ label, content, oralTranslation }, index) => (
          <span
            className={classes.taskContainer}
            key={index}
            // TODO: add check with BE data for oral translation, hidden={!oralTranslation && ?}
          >
            <p className={classes.taskDetails}>{label}</p>
            <p className={classes.taskContent}>{content}</p>
          </span>
        ))}
        <span className={classes.taskContainer}>
          <FormInput
            name="my_notes"
            label={t('label.my_notes')}
            ariaLabel={t('label.my_notes')}
            placeholder={t('placeholder.write_here')}
            inputType={InputTypes.Text}
            labelClassName={classes.myNotesLabel}
            inputContainerClassName={classes.specialInstructions}
            control={control}
            isTextarea={true}
          />
        </span>
      </div>
      <TranslationMemoriesSection
        className={classes.translationMemories}
        //   hidden={!catSupported}
        control={control}
        isEditable={false}
        // subOrderId={id}
        subOrderId={'9a8e440e-33fc-453c-9497-e2c5690d4563' || ''}
        subOrderTmKeys={subOrderTmKeys}
        subOrderLangPair={subOrderLangPair}
        //   projectDomain={projectDomain}
      />
      <div className={classes.grid}>
        <SourceFilesList
          name="my_source_files"
          title={t('my_tasks.my_source_files')}
          tooltipContent={t('tooltip.my_source_files_helper')}
          control={control}
          openSendToCatModal={openSendToCatModal}
          canGenerateProject={canGenerateProject}
          isGenerateProjectButtonDisabled={isGenerateProjectButtonDisabled}
          isCatProjectLoading={isCatProjectLoading}
          catSetupStatus={catSetupStatus}
          isTaskView
          // subOrderId={id || ''}
          subOrderId={'9a8e440e-33fc-453c-9497-e2c5690d4563' || ''}
          isEditable
        />
        <FinalFilesList
          name="my_final_files"
          title={t('my_tasks.my_ready_files')}
          control={control}
          isEditable
          isLoading={isLoading}
          // subOrderId={id || ''}
          subOrderId={'9a8e440e-33fc-453c-9497-e2c5690d4563' || ''}
          // isEditable={isEditable}
          className={classes.myFinalFiles}
          isTaskView
        />
        <CatJobsTable
          subOrderId={'9a8e440e-33fc-453c-9497-e2c5690d4563' || ''}
          // subOrderId={id || ''}
          className={classes.catJobs}
          //   hidden={!catSupported || isEmpty(catToolJobs)}
          cat_jobs={catToolJobs}
          cat_files={cat_files}
          source_files={source_files}
          cat_analyzis={cat_analyzis}
          canSendToVendors={true} //TODO add check when camunda is ready
          source_language_classifier_value={source_language_classifier_value}
          destination_language_classifier_value={
            destination_language_classifier_value
          }
          isTaskView
        />
      </div>
    </Root>
  )
}

export default TaskContent
