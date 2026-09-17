import Loader from 'components/atoms/Loader/Loader'
import { FC, useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Root } from '@radix-ui/react-form'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import SourceFilesList from 'components/molecules/SourceFilesList/SourceFilesList'
import FinalFilesList from 'components/molecules/FinalFilesList/FinalFilesList'
import { filter, isEqual, map } from 'lodash'
import { SubmitHandler, useForm } from 'react-hook-form'
import { SourceFile } from 'types/projects'
import { isEventBasedProjectType } from 'helpers/project'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import dayjs from 'dayjs'
import { formatDuration } from 'helpers/calendar'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import Eye from 'assets/icons/eye.svg?react'
import { apiTypeToKey } from 'components/molecules/AddVolumeInput/AddVolumeInput'
import classNames from 'classnames'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { ProjectDetailModes } from 'components/organisms/ProjectDetails/ProjectDetails'
import { TaskType } from 'types/tasks'
import { AssignmentStatus } from 'types/assignments'

import classes from './classes.module.scss'
import { useTaskCache } from 'hooks/requests/useTasks'
import { useAuth } from 'components/contexts/AuthContext'
import { useAssignmentCommentUpdate } from 'hooks/requests/useAssignments'
import { CollectionType } from 'hooks/requests/useFiles'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'

interface FormValues {
  my_source_files: SourceFile[]
  my_final_files?: SourceFile[]
  assignee_comments: string
}

interface TaskContentProps {
  isLoading?: boolean
  isTaskAssignedToMe?: boolean
  taskId?: string
  isHistoryView?: string
  task_type?: string
  isVendor?: boolean
}

const TaskContent: FC<TaskContentProps> = ({
  isLoading,
  isTaskAssignedToMe,
  taskId,
  isHistoryView,
  task_type,
  isVendor,
}) => {
  const { t } = useTranslation()
  const { institutionUserId } = useAuth()
  const taskData = useTaskCache(taskId)
  const { assignment, project } = taskData || {}
  const jobShortName = assignment?.job_definition?.job_short_name

  const {
    subProject,
    deadline_at,
    comments,
    event_start_at,
    volumes,
    sub_project_id,
    assignee_comments,
    id,
    status: assignmentStatus,
  } = assignment || {}

  const {
    source_files,
    final_files,
    project: taskProject,
  } = subProject || {}

  const projectData = project || taskProject

  const isEventBasedType = isEventBasedProjectType(
    projectData?.type_classifier_value
  )

  const { updateAssigneeComment } = useAssignmentCommentUpdate({ id, taskId })

  const my_final_files = useMemo(
    () =>
      filter(
        final_files,
        ({ custom_properties }) =>
          custom_properties?.institution_user_id === institutionUserId
      ),
    [final_files, institutionUserId]
  )

  const other_final_files = useMemo(
    () =>
      filter(
        final_files,
        ({ custom_properties }) =>
          custom_properties?.institution_user_id !== institutionUserId
      ),
    [final_files, institutionUserId]
  )

  const defaultValues = useMemo(
    () => ({
      my_source_files: [
        ...(source_files || []),
        ...map(other_final_files, (file) => ({
          ...file,
          collection: CollectionType.Final,
        })),
      ],
      assignee_comments,
      my_final_files,
    }),
    [assignee_comments, my_final_files, other_final_files, source_files]
  )

  const { control, handleSubmit, reset } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues])

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
    } = volume_analysis || {}

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
      jobShortName,
    })
  }, [volumes, jobShortName])

  const handleAddAssigneeComment = useCallback(
    async (value: string) => {
      const isCommentChanged = !isEqual(value, assignee_comments)
      if (isCommentChanged) {
        await updateAssigneeComment({
          assignee_comments: value,
        })
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.comment_updated'),
        })
      }
    },

    [assignee_comments, t, updateAssigneeComment]
  )

  const handleOpenCompleteModal: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const finalFilesIds = map(values.my_final_files, ({ id }) => id)

      const completionPayload = {
        final_file_id: finalFilesIds,
        accepted: 1,
        description: values?.assignee_comments,
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
        {isEventBasedType &&
          event_start_at &&
          (projectData?.event_end_at || deadline_at) && (
            <span className={classes.taskContainer}>
              <p className={classes.taskDetails}>{t('calendar.duration')}</p>
              <p className={classes.taskContent}>
                {formatDuration(
                  event_start_at,
                  projectData?.event_end_at || deadline_at!
                )}
              </p>
            </span>
          )}
        {!isEventBasedType && (
          <span className={classes.taskContainer}>
            <p className={classes.taskDetails}>{t('label.deadline_at')}</p>
            <p className={classes.taskContent}>
              {deadline_at ? formattedDate(deadline_at) : '-'}
            </p>
          </span>
        )}
        {isEventBasedType && (
          <span className={classes.taskContainer}>
            <p className={classes.taskDetails}>{t('calendar.service_type')}</p>
            <p className={classes.taskContent}>
              {projectData?.service_type === 'ON_SITE'
                ? t('calendar.service_type_contact')
                : projectData?.service_type === 'REMOTE'
                  ? t('calendar.service_type_remote')
                  : '-'}
            </p>
          </span>
        )}
        {isEventBasedType && projectData?.service_type === 'ON_SITE' && (
          <span className={classes.taskContainer}>
            <p className={classes.taskDetails}>{t('calendar.location')}</p>
            <p className={classes.taskContent}>
              {projectData?.location || projectData?.event_location || '-'}
            </p>
          </span>
        )}
        {isEventBasedType && projectData?.service_type === 'REMOTE' && (
          <span className={classes.taskContainer}>
            <p className={classes.taskDetails}>
              {t('calendar.meeting_link')}
            </p>
            <p className={classes.taskContent}>
              {projectData?.meeting_link || '-'}
            </p>
          </span>
        )}
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
            )}${
              volumes?.[0]?.cat_job ? ` ${t('task.open_in_cat')}` : ''
            }`}</span>
            <BaseButton
              onClick={handleShowVolume}
              className={classes.volumeIcon}
              hidden={!volumes?.[0]?.cat_job}
            >
              <Eye />
            </BaseButton>
          </p>
        </span>
        <span className={classes.taskContainer}>
          <FormInput
            name="assignee_comments"
            label={t('label.my_notes')}
            ariaLabel={t('label.my_notes')}
            placeholder={
              !!isHistoryView
                ? t('placeholder.notes_for_translation_manager')
                : t('placeholder.write_here')
            }
            inputType={InputTypes.Text}
            handleOnBlur={handleAddAssigneeComment}
            labelClassName={classes.myNotesLabel}
            inputContainerClassName={classes.specialInstructions}
            control={control}
            isTextarea={true}
            disabled={!!isHistoryView || !isTaskAssignedToMe}
          />
        </span>
      </div>
      <div className={classes.grid}>
        <SourceFilesList
          name="my_source_files"
          title={t('my_tasks.my_source_files')}
          tooltipContent={t('tooltip.my_source_files_helper')}
          control={control}
          mode={ProjectDetailModes.View}
          subProjectId={sub_project_id || ''}
          isHistoryView={isHistoryView}
        />
        <FinalFilesList
          name="my_final_files"
          title={t('my_tasks.my_ready_files')}
          control={control}
          isEditable={isTaskAssignedToMe}
          isLoading={isLoading}
          subProjectId={sub_project_id || ''}
          taskId={taskId}
          className={classes.myFinalFiles}
          mode={ProjectDetailModes.View}
          isHistoryView={isHistoryView}
        />
      </div>
      <Button
        className={classes.finishedButton}
        onClick={handleSubmit(handleOpenCompleteModal)}
        hidden={!isTaskAssignedToMe || !!isHistoryView || assignmentStatus === AssignmentStatus.Done}
      >
        {t('button.mark_as_finished')}
      </Button>
      {task_type === TaskType.Review && (
        <Button
          className={classes.previousButton}
          onClick={handleSendToPreviousAssignmentModal}
          hidden={!isTaskAssignedToMe || !!isHistoryView || assignmentStatus === AssignmentStatus.Done}
          appearance={AppearanceTypes.Secondary}
        >
          {t('button.send_to_previous_assignment')}
        </Button>
      )}
    </Root>
  )
}

export default TaskContent
