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
  useProjectCache,
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
import {
  getLocalDateOjectFromUtcDateString,
  getUtcDateStringFromLocalDateObject,
} from 'helpers'
import { ClassifierValue } from 'types/classifierValues'
import dayjs from 'dayjs'
import useValidators from 'hooks/useValidators'

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
  | 'project_id'
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
  project_id,
}) => {
  const { t } = useTranslation()
  const { dateTimePickerValidator } = useValidators()
  const { deadline_at: projectDeadlineAt, status: projectStatus } =
    useProjectCache(project_id) || {}
  const { updateSubProject, isLoading } = useUpdateSubProject({
    id,
  })
  const { catToolJobs, catSetupStatus, startPolling, isPolling } =
    useFetchSubProjectCatToolJobs({
      id,
    })
  const { subProjectTmKeyObjectsArray } = useFetchSubProjectTmKeys({
    subProjectId: id,
  })

  const isSomethingEditable = projectStatus !== ProjectStatus.Accepted

  const defaultValues = useMemo(
    () => ({
      deadline_at: getLocalDateOjectFromUtcDateString(
        deadline_at || projectDeadlineAt || ''
      ),
      cat_files,
      source_files: map(source_files, (file) => ({
        ...file,
        isChecked: false,
      })),
      final_files,
      cat_jobs: catToolJobs,
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
      deadline_at,
      projectDeadlineAt,
      cat_files,
      source_files,
      final_files,
      catToolJobs,
      subProjectTmKeyObjectsArray,
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
    (value: { date: string; time: string }) => {
      const { date, time } = value
      const { date: prevDate, time: prevTime } =
        defaultValues?.deadline_at || {}
      if (
        !date ||
        (date === prevDate && time === prevTime) ||
        dateTimePickerValidator(value)
      ) {
        return false
      }

      const formattedDateTime = getUtcDateStringFromLocalDateObject(value)
      updateSubProject({
        deadline_at: formattedDateTime,
      })
    },
    [defaultValues?.deadline_at, updateSubProject, dateTimePickerValidator]
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
          subProjectTmKeyObjectsArray={subProjectTmKeyObjectsArray}
          subProjectLangPair={subProjectLangPair}
          projectDomain={projectDomain}
        />
      </div>
    </Root>
  )
}

export default GeneralInformationFeature
