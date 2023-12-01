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
import {
  useUpdateSubProject,
  useFetchSubProjectCatToolJobs,
} from 'hooks/requests/useProjects'
import {
  CatProjectPayload,
  CatProjectStatus,
  ProjectStatus,
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
import { useFetchSubProjectTmKeys } from 'hooks/requests/useTranslationMemories'
import { getLocalDateOjectFromUtcDateString } from 'helpers'
import { ClassifierValue } from 'types/classifierValues'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

// TODO: this is WIP code for subProject view

type GeneralInformationFeatureProps = Pick<
  SubProjectDetail,
  | 'cat_files'
  | 'cat_analyzis'
  | 'source_files'
  | 'final_files'
  | 'deadline_at'
  | 'source_language_classifier_value'
  | 'destination_language_classifier_value'
  | 'project'
  | 'id'
> & {
  catSupported?: boolean
  projectDomain?: ClassifierValue
}

interface FormValues {
  deadline_at: { date?: string; time?: string }
  cat_files: SourceFile[]
  source_files: SourceFile[]
  final_files: SourceFile[]
  write_to_memory: { [key: string]: boolean }
  // TODO: no idea about these fields
  shared_with_client: boolean[]
}

const GeneralInformationFeature: FC<GeneralInformationFeatureProps> = ({
  catSupported,
  id,
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
  const { updateSubProject, isLoading } = useUpdateSubProject({
    id,
  })
  const { catToolJobs, catSetupStatus, startPolling, isPolling } =
    useFetchSubProjectCatToolJobs({
      id,
    })
  const { SubProjectTmKeys } = useFetchSubProjectTmKeys({ id })

  const { deadline_at: projectDeadlineAt, status: projectStatus } = project

  const isSomethingEditable = projectStatus !== ProjectStatus.Accepted

  const defaultValues = useMemo(
    () => ({
      deadline_at: getLocalDateOjectFromUtcDateString(
        deadline_at || projectDeadlineAt
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
      projectDeadlineAt,
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
    if (SubProjectTmKeys) {
      setValue(
        'write_to_memory',
        reduce(
          SubProjectTmKeys,
          (result, { key, is_writable }) => {
            if (!key) return result
            return { ...result, [key]: is_writable }
          },
          {}
        )
      )
    }
  }, [setValue, SubProjectTmKeys])

  // TODO: currently just used this for uploading final_files
  // However not sure if we can use similar logic for all the fields
  // if we can, then we should create 1 useEffect for the entire form and send the payload
  // Whenever any field changes, except for shared_with_client, which will have their own button
  // useEffect(() => {
  //   const attemptFilesUpload = async () => {
  //     try {
  //       // TODO: not sure if this is the correct endpoint and if we can send both the old and new files together like this
  //       // const { data } = await updateSubProject({
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
  // }, [final_files, newFinalFiles, setValue, t, updateSubProject])

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
    (value: { date: string; time: string }) => {
      const { date, time } = value
      const dateTime = dayjs.utc(`${date} ${time}`, 'DD/MM/YYYY HH:mm')
      const formattedDateTime = dateTime.format('YYYY-MM-DDTHH:mm:ss[Z]')
      // const isDeadLineChanged = !isEqual(formattedDeadline, formattedDateTime)

      updateSubProject({
        deadline_at: formattedDateTime,
      })
    },
    [updateSubProject]
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
      <FormInput
        {...{
          inputType: InputTypes.DateTime,
          ariaLabel: t('label.deadline_at'),
          label: `${t('label.deadline_at')}`,
          control: control,
          name: 'deadline_at',
          minDate: new Date(),
          maxDate: dayjs(projectDeadlineAt).toDate(),
          onDateTimeChange: handleChangeDeadline,
          onlyDisplay: !isSomethingEditable,
        }}
      />
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
          // className={classes.filesSection}
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
          isEditable={isSomethingEditable}
          subProjectId={id}
          SubProjectTmKeys={SubProjectTmKeys}
          subProjectLangPair={subProjectLangPair}
          projectDomain={projectDomain}
        />
      </div>
    </Root>
  )
}

export default GeneralInformationFeature
