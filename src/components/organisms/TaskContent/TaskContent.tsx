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
import CatJobsTable from '../tables/CatJobsTable/CatJobsTable'
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
  CatJob,
  CatProjectPayload,
  CatProjectStatus,
  SourceFile,
} from 'types/orders'
import { ModalTypes, showModal } from '../modals/ModalRoot'

import classes from './classes.module.scss'
import dayjs from 'dayjs'

interface FormValues {
  deadline_at: { date?: string; time?: string }
  cat_files: SourceFile[]
  source_files: SourceFile[]
  final_files: SourceFile[]
  cat_jobs: CatJob[]
  write_to_memory: { [key: string]: boolean }
  // TODO: no idea about these fields
  shared_with_client: boolean[]
  special_instructions?: string
}

const TaskContent: FC<any> = ({
  id,
  deadline_at,
  source_files,
  cat_files,
  cat_jobs,
  cat_analyzis,
  final_files,
  source_language_classifier_value,
  destination_language_classifier_value,
}) => {
  const { t } = useTranslation()

  //   const { subOrder, isLoading } = useFetchSubOrder({ id })

  const { updateSubOrder, isLoading } = useUpdateSubOrder({ id: id })
  const { sendToCat, isCatProjectLoading } = useSubOrderSendToCat()
  const { catToolJobs, catSetupStatus } = useFetchSubOrderCatToolJobs({
    id: id,
  })
  const { subOrderTmKeys } = useFetchSubOrderTmKeys({ id: id })

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

  const newFinalFiles = watch('final_files')

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
    const sourceFiles = getValues('source_files')
    const selectedSourceFiles = filter(sourceFiles, 'isChecked')

    const payload: CatProjectPayload = {
      sub_project_id: id,
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
    const slangShort = split(source_language_classifier_value, '-')[0]
    const tlangShort = split(destination_language_classifier_value, '-')[0]
    return `${slangShort}_${tlangShort}`
  }, [destination_language_classifier_value, source_language_classifier_value])

  const canGenerateProject =
    // catSupported &&
    isEmpty(catToolJobs) && !includes(CatProjectStatus.Done, catSetupStatus)

  const isGenerateProjectButtonDisabled =
    !some(watch('source_files'), 'isChecked') ||
    !some(watch('write_to_memory'), (val) => !!val) ||
    !includes(CatProjectStatus.NotStarted, catSetupStatus)

  const deadlineTime = dayjs(deadline_at).format('DD.MM.YYYY HH:mm')

  if (isLoading) return <Loader loading={isLoading} />

  return (
    <Root>
      <div className={classes.taskDetailsContainer}>
        <span className={classes.taskContainer}>
          <p className={classes.taskDetails}>{t('my_tasks.start_time')}</p>
          <p className={classes.taskContent}>{deadlineTime}</p>
        </span>

        <span className={classes.taskContainer}>
          <p className={classes.taskDetails}>{t('label.deadline_at')}</p>
          <p className={classes.taskContent}>{deadlineTime}</p>
        </span>

        <span className={classes.taskContainer}>
          <p className={classes.taskDetails}>
            {t('label.special_instructions')}
          </p>
          <p className={classes.taskContent}>Siin on mingi lisainfo.</p>
        </span>

        <span className={classes.taskContainer}>
          <p className={classes.taskDetails}>{t('label.volume')}</p>
          <p className={classes.taskContent}>4h</p>
        </span>

        <span className={classes.taskContainer}>
          <FormInput
            name="special_instructions"
            label={t('label.my_notes')}
            ariaLabel={t('label.my_notes')}
            placeholder={t('placeholder.write_here')}
            inputType={InputTypes.Text}
            className={classes.specialInstructions}
            inputContainerClassName={classes.specialInstructions}
            control={control}
          />
        </span>
      </div>
      <TranslationMemoriesSection
        className={classes.translationMemories}
        //   hidden={!catSupported}
        control={control}
        isEditable
        subOrderId={id}
        subOrderTmKeys={subOrderTmKeys}
        subOrderLangPair={subOrderLangPair}
        //   projectDomain={projectDomain}
      />
      <div className={classes.grid}>
        <SourceFilesList
          name="source_files"
          title={t('orders.source_files')}
          tooltipContent={t('tooltip.source_files_helper')}
          control={control}
          openSendToCatModal={openSendToCatModal}
          canGenerateProject={canGenerateProject}
          isGenerateProjectButtonDisabled={isGenerateProjectButtonDisabled}
          isCatProjectLoading={isCatProjectLoading}
          catSetupStatus={catSetupStatus}
          subOrderId={id}
          isEditable
          // isEditable={isEditable}
        />
        <FinalFilesList
          name="final_files"
          title={t('orders.ready_files_from_vendors')}
          control={control}
          isEditable
          isLoading={isLoading}
          subOrderId={id}
          // isEditable={isEditable}
        />
        <CatJobsTable
          subOrderId={id}
          className={classes.catJobs}
          //   hidden={!catSupported || isEmpty(catToolJobs)}
          cat_jobs={catToolJobs}
          cat_files={cat_files}
          source_files={source_files}
          cat_analyzis={cat_analyzis}
          source_language_classifier_value={source_language_classifier_value}
          destination_language_classifier_value={
            destination_language_classifier_value
          }
          canSendToVendors={true} //TODO add check when camunda is ready
        />
      </div>
    </Root>
  )
}

export default TaskContent
