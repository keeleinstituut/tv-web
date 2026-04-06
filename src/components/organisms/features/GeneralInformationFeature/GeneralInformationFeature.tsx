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
} from 'lodash'
import { formatDuration } from 'helpers/calendar'
import {
  useUpdateSubProject,
  useFetchSubProjectCatToolJobs,
  useProjectCache,
} from 'hooks/requests/useProjects'
import {
  CatProjectPayload,
  CatProjectStatus,
  SourceFile,
  SubProjectDetail,
} from 'types/projects'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
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
import CatJobsTable from 'components/organisms/tables/CatJobsTable/CatJobsTable'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useFetchSubProjectTmKeys } from 'hooks/requests/useTranslationMemories'
import {
  getLocalDateObjectFromUtcDateString,
  getUtcDateStringFromLocalDateObject,
} from 'helpers'
import { ClassifierValue } from 'types/classifierValues'
import dayjs from 'dayjs'
import useValidators from 'hooks/useValidators'
import { showValidationErrorMessage } from 'api/errorHandler'

// TODO: this is WIP code for subProject view

type GeneralInformationFeatureProps = Pick<
  SubProjectDetail,
  | 'cat_files'
  | 'cat_analyzis'
  | 'source_files'
  | 'final_files'
  | 'deadline_at'
  | 'event_start_at'
  | 'source_language_classifier_value'
  | 'destination_language_classifier_value'
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
  cat_files: SourceFile[]
  source_files: SourceFile[]
  final_files: SourceFile[]
  write_to_memory: { [key: string]: boolean }
  service_type?: string
  event_location?: string
  meeting_link?: string
  duration?: string
}

const GeneralInformationFeature: FC<GeneralInformationFeatureProps> = ({
  catSupported,
  id,
  cat_analyzis,
  cat_files,
  source_files,
  final_files,
  deadline_at,
  event_start_at,
  source_language_classifier_value,
  destination_language_classifier_value,
  projectDomain,
  project_id,
  project,
}) => {
  const isVerbalType =
    !!project?.type_classifier_value?.project_type_config?.is_start_date_supported &&
    project?.type_classifier_value?.value !== 'POST_TRANSLATION'
  const { t } = useTranslation()
  const { dateTimePickerValidator } = useValidators()
  const { deadline_at: projectDeadlineAt } = useProjectCache(project_id) || {}
  const { updateSubProject, isLoading } = useUpdateSubProject({
    id,
  })

  const normalizedServiceType = (() => {
    const st = project?.service_type
    if (st === 'ON_SITE') return 'contact'
    if (st === 'REMOTE') return 'remote'
    if (st) return st
    if (project?.event_location) return 'contact'
    if (project?.meeting_link) return 'remote'
    return ''
  })()
  const { catToolJobs, catSetupStatus, startPolling, isPolling } =
    useFetchSubProjectCatToolJobs({
      id,
    })
  const { subProjectTmKeyObjectsArray } = useFetchSubProjectTmKeys({
    subProjectId: id,
  })

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
      cat_files,
      source_files: map(source_files, (file) => ({
        ...file,
        isChecked: false,
      })),
      final_files,
      cat_jobs: catToolJobs,
      service_type: normalizedServiceType,
      event_location: project?.event_location || '',
      meeting_link: project?.meeting_link || '',
      duration:
        isVerbalType && effectiveStartAt && effectiveEndAt
          ? formatDuration(effectiveStartAt, effectiveEndAt)
          : undefined,
      write_to_memory: reduce(
        subProjectTmKeyObjectsArray,
        (result, { key, is_writable }) => {
          if (!key) return result
          return { ...result, [key]: is_writable }
        },
        {}
      ),
    }),
    [
      effectiveDeadlineAt,
      effectiveStartAt,
      effectiveEndAt,
      cat_files,
      source_files,
      final_files,
      catToolJobs,
      subProjectTmKeyObjectsArray,
      normalizedServiceType,
      project?.event_location,
      project?.meeting_link,
      isVerbalType,
    ]
  )

  const { control, getValues, watch, reset } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues])

  const openSendToCatModal = useCallback(() => {
    const sourceFiles = getValues('source_files')
    const selectedSourceFiles = filter(sourceFiles, 'isChecked')

    const payload: CatProjectPayload = {
      sub_project_id: id,
      source_files_ids: compact(map(selectedSourceFiles, 'id')),
    }

    showModal(ModalTypes.ConfirmSendToCat, {
      sendPayload: payload,
      callback: startPolling,
    })
  }, [getValues, id, startPolling])

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

  const subProjectLangPair = useMemo(() => {
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
      {isVerbalType ? (
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
          openSendToCatModal={openSendToCatModal}
          canGenerateProject={canGenerateProject}
          isGenerateProjectButtonDisabled={isGenerateProjectButtonDisabled}
          isCatProjectLoading={isPolling}
          catSetupStatus={catSetupStatus}
          subProjectId={id}
          isEditable={isSomethingEditable}
        />
        <FinalFilesList
          name="final_files"
          title={t('projects.ready_files_from_vendors')}
          control={control}
          isLoading={isLoading}
          subProjectId={id}
          isEditable={isSomethingEditable}
        />
        <CatJobsTable
          subProjectId={id}
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
          isEditable={isSomethingEditable}
        />
        <TranslationMemoriesSection
          className={classes.translationMemories}
          hidden={!catSupported}
          control={control}
          isEditable={isSomethingEditable && isEmpty(catToolJobs)}
          subProjectId={id}
          subProjectTmKeyObjectsArray={subProjectTmKeyObjectsArray}
          subProjectLangPair={subProjectLangPair}
          projectDomain={projectDomain}
        />
      </div>
    </Root>
  )
}

export default GeneralInformationFeature
