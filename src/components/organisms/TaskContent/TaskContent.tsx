import Loader from 'components/atoms/Loader/Loader'
import { useFetchSubOrderCatToolJobs } from 'hooks/requests/useOrders'
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
import { isEmpty, map, reduce, split } from 'lodash'
import TranslationMemoriesSection from 'components/organisms/TranslationMemoriesSection/TranslationMemoriesSection'
import { useForm, useWatch } from 'react-hook-form'
import { useFetchSubOrderTmKeys } from 'hooks/requests/useTranslationMemories'
import { CatJob, SourceFile } from 'types/orders'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import dayjs from 'dayjs'
import { LanguageClassifierValue } from 'types/classifierValues'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as Eye } from 'assets/icons/eye.svg'
import { apiTypeToKey } from 'components/molecules/AddVolumeInput/AddVolumeInput'
import { VolumeValue } from 'types/volumes'

import classes from './classes.module.scss'

interface FormValues {
  my_source_files: SourceFile[]
  my_final_files: SourceFile[]
  cat_jobs: CatJob[]
  write_to_memory: { [key: string]: boolean }
  my_notes?: string
}

interface TaskContentProps {
  deadline_at?: string
  source_files: SourceFile[]
  cat_files?: SourceFile[]
  cat_jobs?: CatJob[]
  final_files: SourceFile[]
  source_language_classifier_value?: LanguageClassifierValue
  destination_language_classifier_value?: LanguageClassifierValue
  event_start_at?: string
  comments?: string
  isLoading?: boolean
  sub_project_id: string
  volumes?: VolumeValue[]
}

const TaskContent: FC<TaskContentProps> = ({
  deadline_at,
  source_files,
  cat_files,
  cat_jobs,
  final_files,
  source_language_classifier_value,
  destination_language_classifier_value,
  event_start_at,
  comments,
  isLoading,
  sub_project_id,
  volumes = [],
}) => {
  const { t } = useTranslation()

  const { catToolJobs, catSetupStatus } = useFetchSubOrderCatToolJobs({
    id: sub_project_id,
  })

  const { subOrderTmKeys } = useFetchSubOrderTmKeys({
    id: sub_project_id,
  })

  const defaultValues = useMemo(
    () => ({
      source_files: map(source_files, (file) => ({
        ...file,
        isChecked: false,
      })),
      final_files,
      cat_jobs: catToolJobs,
      write_to_memory: {},
    }),
    [catToolJobs, final_files, source_files]
  )

  // console.log('defaultValues', defaultValues)

  const { control, setValue } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  // console.log('useWatch({control})1', useWatch({ control }))

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
    if (source_files) {
      setValue('my_source_files', source_files)
    }
  }, [setValue, source_files, subOrderTmKeys])

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
      isTaskView: true,
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
      content: comments || '-',
    },
    {
      label: t('label.volume'),
      content: (
        <>
          <span>{`${Number(volumes[0]?.unit_quantity)} ${t(
            `label.${apiTypeToKey(volumes[0]?.unit_type)}`
          )}${cat_jobs ? ` ${t('task.open_in_cat')}` : ''}`}</span>
          <BaseButton onClick={handleShowVolume} className={classes.volumeIcon}>
            <Eye />
          </BaseButton>
        </>
      ),
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
        hidden={isEmpty(subOrderTmKeys)}
        control={control}
        isEditable={false}
        subOrderId={sub_project_id}
        subOrderTmKeys={subOrderTmKeys}
        subOrderLangPair={subOrderLangPair}
        isTaskView
      />
      <div className={classes.grid}>
        <SourceFilesList
          name="my_source_files"
          title={t('my_tasks.my_source_files')}
          tooltipContent={t('tooltip.my_source_files_helper')}
          control={control}
          catSetupStatus={catSetupStatus}
          isTaskView
          subOrderId={sub_project_id}
          isEditable
        />
        <FinalFilesList
          name="my_final_files"
          title={t('my_tasks.my_ready_files')}
          control={control}
          isEditable
          isLoading={isLoading}
          subOrderId={sub_project_id}
          className={classes.myFinalFiles}
          isTaskView
        />
        <CatJobsTable
          subOrderId={sub_project_id}
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
          isTaskView
        />
      </div>
    </Root>
  )
}

export default TaskContent
