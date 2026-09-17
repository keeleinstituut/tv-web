import { FC, useCallback, useEffect, useMemo } from 'react'
import { map } from 'lodash'
import { formatDuration } from 'helpers/calendar'
import { useUpdateSubProject, useProjectCache } from 'hooks/requests/useProjects'
import { SourceFile, SubProjectDetail } from 'types/projects'
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
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import {
  getLocalDateObjectFromUtcDateString,
  getUtcDateStringFromLocalDateObject,
} from 'helpers'
import { ClassifierValue } from 'types/classifierValues'
import dayjs from 'dayjs'
import useValidators from 'hooks/useValidators'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useIsDataOwner } from 'hooks/useIsDataOwner'
import { isEventBasedProjectType } from 'helpers/project'

// TODO: this is WIP code for subProject view

type GeneralInformationFeatureProps = Pick<
  SubProjectDetail,
  | 'source_files'
  | 'final_files'
  | 'deadline_at'
  | 'event_start_at'
  | 'project_id'
  | 'project'
  | 'id'
> & {
  catSupported?: boolean
  projectDomain?: ClassifierValue
}

interface FormValues {
  deadline_at: { date?: string; time?: string }
  event_start_at: { date?: string; time?: string }
  source_files: SourceFile[]
  final_files: SourceFile[]
  write_to_memory: { [key: string]: boolean }
  service_type?: string
  event_location?: string
  meeting_link?: string
  duration?: string
}

const GeneralInformationFeature: FC<GeneralInformationFeatureProps> = ({
  id,
  source_files,
  final_files,
  deadline_at,
  event_start_at,
  projectDomain,
  project_id,
  project,
}) => {
  const isEventBasedType = isEventBasedProjectType(
    project?.type_classifier_value
  )
  const { t } = useTranslation()
  const { dateTimePickerValidator } = useValidators()
  const { deadline_at: projectDeadlineAt } = useProjectCache(project_id) || {}
  const { updateSubProject, isLoading } = useUpdateSubProject({
    id,
  })
  const isShared = !useIsDataOwner(project?.institution_id)

  const effectiveLocation = project?.event_location || project?.location || ''
  const normalizedServiceType = (() => {
    const st = project?.service_type
    if (st === 'ON_SITE') return 'contact'
    if (st === 'REMOTE') return 'remote'
    if (st) return st
    if (effectiveLocation) return 'contact'
    if (project?.meeting_link) return 'remote'
    return ''
  })()
  const isSomethingEditable = true

  const effectiveStartAt = event_start_at || project?.event_start_at
  const effectiveEndAt = project?.event_end_at
  const effectiveDeadlineAt = deadline_at || projectDeadlineAt

  const defaultValues = useMemo(
    () => ({
      deadline_at: getLocalDateObjectFromUtcDateString(effectiveDeadlineAt || ''),
      event_start_at: effectiveStartAt
        ? getLocalDateObjectFromUtcDateString(effectiveStartAt)
        : { date: '', time: '' },
      source_files: map(source_files, (file) => ({
        ...file,
        isChecked: false,
      })),
      final_files,
      service_type: normalizedServiceType,
      event_location: effectiveLocation,
      meeting_link: project?.meeting_link || '',
      duration:
        isEventBasedType && effectiveStartAt && effectiveEndAt
          ? formatDuration(effectiveStartAt, effectiveEndAt)
          : undefined,
    }),
    [
      effectiveDeadlineAt,
      effectiveStartAt,
      effectiveEndAt,
      source_files,
      final_files,
      normalizedServiceType,
      project?.event_location,
      project?.meeting_link,
      isEventBasedType,
    ]
  )

  const { control, reset } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues])

  const handleChangeDeadline = useCallback(
    async (value: { date: string; time: string }) => {
      try {
        const { date, time } = value
        const { date: prevDate, time: prevTime } =
          defaultValues?.deadline_at || {}
        if (
          !date ||
          (date === prevDate && time === prevTime) ||
          dateTimePickerValidator(value) !== true
        ) {
          return false
        }

        const formattedDateTime = getUtcDateStringFromLocalDateObject(value)
        await updateSubProject({
          deadline_at: formattedDateTime,
        })
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.sub_project_deadline_updated'),
        })
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [defaultValues?.deadline_at, updateSubProject, dateTimePickerValidator, t]
  )

  return (
    <Root>
      {isEventBasedType ? (
        <>
          <FormInput
            {...{
              inputType: InputTypes.DateTime,
              ariaLabel: t('label.start_date'),
              label: `${t('label.start_date')}`,
              control: control,
              name: 'event_start_at',
              onlyDisplay: true,
            }}
          />
          <FormInput
            {...{
              inputType: InputTypes.Text,
              ariaLabel: t('calendar.duration'),
              label: t('calendar.duration'),
              control: control,
              name: 'duration',
              onlyDisplay: true,
              emptyDisplayText: '-',
            }}
          />
          {normalizedServiceType && (
            <FormInput
              {...{
                inputType: InputTypes.Selections,
                ariaLabel: t('calendar.service_type'),
                label: t('calendar.service_type'),
                control: control,
                name: 'service_type',
                options: [
                  { value: 'contact', label: t('calendar.service_type_contact') },
                  { value: 'remote', label: t('calendar.service_type_remote') },
                ],
                onlyDisplay: true,
                emptyDisplayText: '-',
              }}
            />
          )}
          {normalizedServiceType === 'contact' && (
            <FormInput
              {...{
                inputType: InputTypes.Text,
                ariaLabel: t('calendar.location'),
                label: t('calendar.location'),
                control: control,
                name: 'event_location',
                onlyDisplay: true,
                emptyDisplayText: '-',
              }}
            />
          )}
          {normalizedServiceType === 'remote' && (
            <FormInput
              {...{
                inputType: InputTypes.Text,
                ariaLabel: t('calendar.meeting_link'),
                label: t('calendar.meeting_link'),
                control: control,
                name: 'meeting_link',
                onlyDisplay: true,
                emptyDisplayText: '-',
              }}
            />
          )}
        </>
      ) : (
        <FormInput
          {...{
            inputType: InputTypes.DateTime,
            ariaLabel: t('label.deadline_at'),
            label: `${t('label.deadline_at')}`,
            control: control,
            name: 'deadline_at',
            maxDate: projectDeadlineAt ? dayjs(projectDeadlineAt).toDate() : undefined,
            onDateTimeChange: handleChangeDeadline,
            onlyDisplay: !isSomethingEditable,
          }}
        />
      )}
      <div className={classes.grid}>
        <SourceFilesList
          name="source_files"
          title={t('projects.source_files')}
          tooltipContent={t('tooltip.source_files_helper')}
          control={control}
          subProjectId={id}
          isEditable={isSomethingEditable && !isShared}
        />
        <FinalFilesList
          name="final_files"
          title={t('projects.ready_files_from_vendors')}
          control={control}
          isLoading={isLoading}
          subProjectId={id}
          isEditable={isSomethingEditable}
        />
      </div>
    </Root>
  )
}

export default GeneralInformationFeature
