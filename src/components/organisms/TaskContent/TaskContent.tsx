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
import { isEmpty, map, split } from 'lodash'
import TranslationMemoriesSection from 'components/organisms/TranslationMemoriesSection/TranslationMemoriesSection'
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import { useFetchSubProjectTmKeys } from 'hooks/requests/useTranslationMemories'
import { SourceFile } from 'types/projects'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import dayjs from 'dayjs'
import { LanguageClassifierValue } from 'types/classifierValues'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as Eye } from 'assets/icons/eye.svg'
import { apiTypeToKey } from 'components/molecules/AddVolumeInput/AddVolumeInput'
import { VolumeValue } from 'types/volumes'
import classNames from 'classnames'
import Button from 'components/molecules/Button/Button'
import { useCompleteTask } from 'hooks/requests/useTasks'
import { ProjectDetailModes } from '../ProjectDetails/ProjectDetails'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from '../NotificationRoot/NotificationRoot'
import { showValidationErrorMessage } from 'api/errorHandler'

import classes from './classes.module.scss'
import { useNavigate } from 'react-router-dom'

interface FormValues {
  my_source_files: SourceFile[]
  my_final_files?: SourceFile[]
  my_notes: string
}

interface TaskContentProps {
  deadline_at?: string
  source_files: SourceFile[]
  cat_files?: SourceFile[]
  source_language_classifier_value?: LanguageClassifierValue
  destination_language_classifier_value?: LanguageClassifierValue
  event_start_at?: string
  comments?: string
  isLoading?: boolean
  sub_project_id: string
  volumes?: VolumeValue[]
  assignee_institution_user_id?: string
  taskId?: string
  isHistoryView?: string
}

const TaskContent: FC<TaskContentProps> = ({
  deadline_at,
  source_files,
  cat_files,
  source_language_classifier_value,
  destination_language_classifier_value,
  event_start_at,
  comments,
  isLoading,
  sub_project_id,
  volumes = [],
  assignee_institution_user_id,
  taskId,
  isHistoryView,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { catToolJobs, catSetupStatus } = useFetchSubProjectCatToolJobs({
    id: sub_project_id,
  })

  const { SubProjectTmKeys } = useFetchSubProjectTmKeys({
    id: sub_project_id,
  })

  const { completeTask, isLoading: isCompletingTask } = useCompleteTask({
    id: taskId,
  })

  const { control, handleSubmit } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: { my_source_files: source_files, my_final_files: [] },
  })

  const subOrderLangPair = useMemo(() => {
    const slangShort = split(source_language_classifier_value?.value, '-')[0]
    const tlangShort = split(
      destination_language_classifier_value?.value,
      '-'
    )[0]
    return `${slangShort}_${tlangShort}`
  }, [destination_language_classifier_value, source_language_classifier_value])

  const formattedDate = (date: string) => {
    return dayjs(date).format('DD.MM.YYYY HH:mm')
  }

  const handleShowVolume = useCallback(() => {
    const { discounts, unit_fee, volume_analysis } = volumes[0]
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

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const finalFilesIds = map(values.my_final_files, ({ id }) => id)

      const payload = {
        final_file_id: finalFilesIds,
        accepted: true,
        comments: values.my_notes,
      }

      try {
        await completeTask(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.task_marked_completed'),
        })
        navigate('/projects/my-tasks')
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [completeTask, navigate, t]
  )

  const handleOpenCompleteModal = useCallback(() => {
    showModal(ModalTypes.ConfirmationModal, {
      title: t('modal.confirm_complete_task'),
      modalContent: t('modal.confirm_complete_task_details'),
      cancelButtonContent: t('button.quit'),
      proceedButtonContent: t('button.complete'),
      className: classes.completeModal,
      handleProceed: handleSubmit(onSubmit),
      proceedButtonLoading: isCompletingTask,
    })
  }, [handleSubmit, isCompletingTask, onSubmit, t])

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
            !volumes[0] && classes.hideContainer
          )}
        >
          <p className={classes.taskDetails}>{t('label.volume')}</p>
          <p className={classes.taskContent}>
            {
              <>
                <span>{`${Number(volumes[0]?.unit_quantity)} ${t(
                  `label.${apiTypeToKey(volumes[0]?.unit_type)}`
                )}${volumes[0] ? ` ${t('task.open_in_cat')}` : ''}`}</span>
                <BaseButton
                  onClick={handleShowVolume}
                  className={classes.volumeIcon}
                >
                  <Eye />
                </BaseButton>
              </>
            }
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
            disabled={!!isHistoryView}
          />
        </span>
      </div>
      <TranslationMemoriesSection
        className={classes.translationMemories}
        hidden={isEmpty(SubProjectTmKeys)}
        control={control}
        isEditable={false}
        subProjectId={sub_project_id}
        SubProjectTmKeys={SubProjectTmKeys}
        subProjectLangPair={subOrderLangPair}
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
          subProjectId={sub_project_id}
          isEditable
          isHistoryView={isHistoryView}
        />
        <FinalFilesList
          name="my_final_files"
          title={t('my_tasks.my_ready_files')}
          control={control}
          isEditable
          isLoading={isLoading}
          subProjectId={sub_project_id}
          className={classes.myFinalFiles}
          mode={ProjectDetailModes.View}
          isHistoryView={isHistoryView}
        />
        <CatJobsTable
          subProjectId={sub_project_id}
          className={classes.catJobs}
          hidden={isEmpty(catToolJobs)}
          cat_jobs={catToolJobs}
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
        onClick={handleOpenCompleteModal}
        hidden={!assignee_institution_user_id}
      >
        {t('button.mark_as_finished')}
      </Button>
    </Root>
  )
}

export default TaskContent
