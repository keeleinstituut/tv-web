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
import { getLocalDateOjectFromUtcDateString } from 'helpers'
import { CatJob, SourceFile } from 'types/orders'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import dayjs from 'dayjs'
import { LanguageClassifierValue } from 'types/classifierValues'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as Eye } from 'assets/icons/eye.svg'

import classes from './classes.module.scss'

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
}) => {
  const { t } = useTranslation()

  const { catToolJobs, catSetupStatus } = useFetchSubOrderCatToolJobs({
    id: '9a9dfde2-49cc-420c-b6b3-a4e06c375155',
    // id: sub_project_id,
  })

  const { subOrderTmKeys } = useFetchSubOrderTmKeys({
    id: '9a9dfde2-49cc-420c-b6b3-a4e06c375155',
    // id: sub_project_id,
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

  console.log('defaultValues', defaultValues)

  const { control, setValue } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  console.log('useWatch({control})1', useWatch({ control }))
  // setValue('my_source_files', source_files)

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

  //TODO: add correct volume data when available

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const volumesData = [
    {
      id: '9a9a997c-69a6-45ab-9447-76f42865d0cb',
      assignment_id: '9a73d254-822f-4b24-8175-3abce8382918',
      unit_type: 'WORDS',
      unit_quantity: '671.00',
      unit_fee: 5,
      updated_at: '2023-11-13T15:05:07.000000Z',
      created_at: '2023-11-13T15:05:07.000000Z',
      cat_job: {
        id: '9a742091-5d58-454e-9595-23bebfefc554',
        name: 'OIU-2023-10--8-af-ZAsq-AL-1-1',
        ext_id: '30-c76a3b89d220',
        progress_percentage: '0',
        translate_url:
          'https://cat.dev.tolkevarav.eki.ee/translate/OIU-2023-10--8-af-ZAsq-AL-1/af-ZA-sq-AL/30-c76a3b89d220',
      },
      volume_analysis: {
        total: 671,
        tm_101: 0,
        repetitions: 0,
        tm_100: 0,
        tm_95_99: 0,
        tm_85_94: 2,
        tm_75_84: 16,
        tm_50_74: 0,
        tm_0_49: 653,
        files_names: ['Untitled.txt'],
      },
      discounts: {
        discount_percentage_101: 10,
        discount_percentage_repetitions: 20,
        discount_percentage_100: 30,
        discount_percentage_95_99: 40,
        discount_percentage_85_94: 30,
        discount_percentage_75_84: 30,
        discount_percentage_50_74: 0,
        discount_percentage_0_49: 20,
      },
    },
  ]

  const handleShowVolume = useCallback(() => {
    showModal(ModalTypes.VolumeChange, {
      isCat: true,
      isTaskView: true,
      discounts: volumesData[0].discounts,
      unit_fee: volumesData[0].unit_fee,
      volume_analysis: volumesData[0].volume_analysis,
      taskViewPricesClass: classes.taskViewPrices,
    })
  }, [volumesData])

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
      //TODO: add correct variable for content
      content: (
        <>
          <span>4h</span>
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
          subOrderId={'9a9dfde2-49cc-420c-b6b3-a4e06c375155'}
          isEditable
        />
        <FinalFilesList
          name="final_files"
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
