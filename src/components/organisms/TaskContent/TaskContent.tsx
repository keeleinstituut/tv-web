import Loader from 'components/atoms/Loader/Loader'
import { useFetchSubProjectCatToolJobs } from 'hooks/requests/useProjects'
import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Root } from '@radix-ui/react-form'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import SourceFilesList from 'components/molecules/SourceFilesList/SourceFilesList'
import FinalFilesList from 'components/molecules/FinalFilesList/FinalFilesList'
import CatJobsTable from 'components/organisms/tables/CatJobsTable/CatJobsTable'
import { filter, isEmpty, map, split } from 'lodash'
import TranslationMemoriesSection from 'components/organisms/TranslationMemoriesSection/TranslationMemoriesSection'
import { SubmitHandler, useForm } from 'react-hook-form'
import { useFetchSubProjectTmKeys } from 'hooks/requests/useTranslationMemories'
import { SourceFile } from 'types/projects'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import dayjs from 'dayjs'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as Eye } from 'assets/icons/eye.svg'
import { apiTypeToKey } from 'components/molecules/AddVolumeInput/AddVolumeInput'
import classNames from 'classnames'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { ProjectDetailModes } from 'components/organisms/ProjectDetails/ProjectDetails'
import { TaskType } from 'types/tasks'

import classes from './classes.module.scss'
import { useTaskCache } from 'hooks/requests/useTasks'
import useAuth from 'hooks/useAuth'

interface FormValues {
  my_source_files: SourceFile[]
  my_final_files?: SourceFile[]
  my_notes: string
}

interface TaskContentProps {
  isLoading?: boolean
  assignee_institution_user_id?: string
  taskId?: string
  isHistoryView?: string
  task_type?: string
  isVendor?: boolean
}

const TaskContent: FC<TaskContentProps> = ({
  isLoading,
  assignee_institution_user_id,
  taskId,
  isHistoryView,
  task_type,
  isVendor,
}) => {
  const { t } = useTranslation()
  const { institutionUserId } = useAuth()
  const { assignment, cat_tm_keys_meta, cat_tm_keys_stats } =
    useTaskCache(taskId) || {}

  const {
    subProject,
    cat_jobs,
    deadline_at,
    comments,
    event_start_at,
    volumes,
    sub_project_id,
  } = assignment || {}

  const {
    source_language_classifier_value,
    destination_language_classifier_value,
    cat_files,
    source_files,
    final_files,
    cat_tm_keys,
  } = subProject || {}

  const { catToolJobs, catSetupStatus } = useFetchSubProjectCatToolJobs({
    id: sub_project_id,
    disabled: isVendor,
  })

  const { SubProjectTmKeys } = useFetchSubProjectTmKeys({
    id: sub_project_id,
    disabled: isVendor,
  })

  const catJobsToUse = isVendor ? cat_jobs : catToolJobs
  const tmKeysToUse = isVendor ? cat_tm_keys : SubProjectTmKeys

  const my_final_files = filter(
    final_files,
    ({ custom_properties }) =>
      custom_properties?.institution_user_id === institutionUserId
  )

  const other_final_files = filter(
    final_files,
    ({ custom_properties }) =>
      custom_properties?.institution_user_id !== institutionUserId
  )

  const { control, handleSubmit } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: {
      my_source_files: [
        ...(source_files || []),
        ...map(other_final_files, (file) => ({ ...file, collection: 'final' })),
      ],
      my_final_files,
    },
  })

  const subOrderLangPair = useMemo(() => {
    const srcLangShort = split(source_language_classifier_value?.value, '-')[0]
    const dstLangShort = split(
      destination_language_classifier_value?.value,
      '-'
    )[0]
    return `${srcLangShort}_${dstLangShort}`
  }, [destination_language_classifier_value, source_language_classifier_value])

  const formattedDate = (date: string) => {
    return dayjs(date).format('DD.MM.YYYY HH:mm')
  }

  const handleShowVolume = useCallback(() => {
    const { discounts, unit_fee, volume_analysis } = volumes?.[0] || {}
    const {
      files_names,
      repetitions,
      tm_0_49,
      tm_50_74,
      tm_75_84,
      tm_85_94,
      tm_95_99,
      tm_100,
      tm_101,
      total,
    } = volume_analysis

    showModal(ModalTypes.VolumeChange, {
      isCat: true,
      mode: ProjectDetailModes.View,
      discounts,
      unit_fee,
      volume_analysis: {
        files_names,
        repetitions: repetitions || '0',
        tm_0_49: tm_0_49 || '0',
        tm_50_74: tm_50_74 || '0',
        tm_75_84: tm_75_84 || '0',
        tm_85_94: tm_85_94 || '0',
        tm_95_99: tm_95_99 || '0',
        tm_100: tm_100 || '0',
        tm_101: tm_101 || '0',
        total: total || '0',
      },
      taskViewPricesClass: classes.taskViewPrices,
    })
  }, [volumes])

  const handleOpenCompleteModal: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const finalFilesIds = map(values.my_final_files, ({ id }) => id)

      const completionPayload = {
        final_file_id: finalFilesIds,
        accepted: true,
        description: values.my_notes, // TODO: Not yet done by BE, naming might change
      }

      showModal(ModalTypes.ConfirmCompleteTask, {
        taskId,
        completionPayload,
      })
    },
    [taskId]
  )

  const handleSendToPreviousAssignmentModal = useCallback(() => {
    showModal(ModalTypes.ConfirmSendToPreviousTask, {
      taskId,
    })
  }, [taskId])

  if (isLoading) return <Loader loading={isLoading} />

  return (
    <Root>
      <div className={classes.taskDetailsContainer}>
        <span
          className={classNames(
            classes.taskContainer,
            !event_start_at && classes.hideContainer
          )}
        >
          <p className={classes.taskDetails}>{t('my_tasks.start_time')}</p>
          <p className={classes.taskContent}>
            {event_start_at ? formattedDate(event_start_at) : '-'}
          </p>
        </span>
        <span className={classes.taskContainer}>
          <p className={classes.taskDetails}>{t('label.deadline_at')}</p>
          <p className={classes.taskContent}>
            {deadline_at ? formattedDate(deadline_at) : '-'}
          </p>
        </span>
        <span className={classes.taskContainer}>
          <p className={classes.taskDetails}>
            {t('label.special_instructions')}
          </p>
          <p className={classes.taskContent}>{comments || '-'}</p>
        </span>
        <span
          className={classNames(
            classes.taskContainer,
            !volumes?.[0] && classes.hideContainer
          )}
        >
          <p className={classes.taskDetails}>{t('label.volume')}</p>
          <p className={classes.taskContent}>
            <span>{`${Number(volumes?.[0]?.unit_quantity)} ${t(
              `label.${apiTypeToKey(volumes?.[0]?.unit_type || '')}`
            )}${volumes?.[0] ? ` ${t('task.open_in_cat')}` : ''}`}</span>
            <BaseButton
              onClick={handleShowVolume}
              className={classes.volumeIcon}
            >
              <Eye />
            </BaseButton>
          </p>
        </span>
        <span className={classes.taskContainer}>
          <FormInput
            name="my_notes"
            label={t('label.my_notes')}
            ariaLabel={t('label.my_notes')}
            placeholder={
              !!isHistoryView
                ? t('placeholder.notes_for_translation_manager')
                : t('placeholder.write_here')
            }
            inputType={InputTypes.Text}
            labelClassName={classes.myNotesLabel}
            inputContainerClassName={classes.specialInstructions}
            control={control}
            isTextarea={true}
            disabled={!!isHistoryView || !assignee_institution_user_id}
          />
        </span>
      </div>
      <TranslationMemoriesSection
        className={classes.translationMemories}
        hidden={isEmpty(tmKeysToUse)}
        control={control}
        isEditable={false}
        subProjectId={sub_project_id}
        SubProjectTmKeys={tmKeysToUse}
        subProjectLangPair={subOrderLangPair}
        cat_tm_keys_meta={cat_tm_keys_meta}
        cat_tm_keys_stats={cat_tm_keys_stats}
        isVendor={isVendor}
        mode={ProjectDetailModes.View}
      />
      <div className={classes.grid}>
        <SourceFilesList
          name="my_source_files"
          title={t('my_tasks.my_source_files')}
          tooltipContent={t('tooltip.my_source_files_helper')}
          control={control}
          catSetupStatus={catSetupStatus}
          mode={ProjectDetailModes.View}
          subProjectId={sub_project_id || ''}
          isHistoryView={isHistoryView}
        />
        <FinalFilesList
          name="my_final_files"
          title={t('my_tasks.my_ready_files')}
          control={control}
          isEditable={!!assignee_institution_user_id}
          isLoading={isLoading}
          subProjectId={sub_project_id || ''}
          className={classes.myFinalFiles}
          mode={ProjectDetailModes.View}
          isHistoryView={isHistoryView}
        />
        <CatJobsTable
          subProjectId={sub_project_id || ''}
          className={classes.catJobs}
          hidden={isEmpty(catJobsToUse)}
          cat_jobs={catJobsToUse}
          isEditable={!!assignee_institution_user_id}
          cat_files={cat_files}
          source_files={source_files}
          canSendToVendors={true} //TODO add check when camunda is ready
          source_language_classifier_value={source_language_classifier_value}
          destination_language_classifier_value={
            destination_language_classifier_value
          }
          mode={ProjectDetailModes.View}
          isHistoryView={isHistoryView}
        />
      </div>
      <Button
        className={classes.finishedButton}
        onClick={handleSubmit(handleOpenCompleteModal)}
        hidden={!assignee_institution_user_id || !!isHistoryView}
      >
        {t('button.mark_as_finished')}
      </Button>
      {task_type === TaskType.Review && (
        <Button
          className={classes.previousButton}
          onClick={handleSendToPreviousAssignmentModal}
          hidden={
            !assignee_institution_user_id ||
            !!isHistoryView ||
            task_type === TaskType.Review
          }
          appearance={AppearanceTypes.Secondary}
        >
          {t('button.send_to_previous_assignment')}
        </Button>
      )}
    </Root>
  )
}

export default TaskContent
