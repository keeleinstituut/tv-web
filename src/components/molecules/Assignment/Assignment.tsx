import { FC, useCallback, useEffect, useMemo } from 'react'
import { map, find, pick, values, isEqual } from 'lodash'
import {
  CatAnalysis,
  CatJob,
  ListOrder,
  SubProjectFeatures,
} from 'types/orders'
import { AssignmentPayload, AssignmentType } from 'types/assignments'
import { useTranslation } from 'react-i18next'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'

import classes from './classes.module.scss'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import { useForm } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { DiscountPercentageNames, DiscountPercentages } from 'types/vendors'
import { Price } from 'types/price'
import TaskCandidatesSection from 'components/molecules/TaskCandidatesSection/TaskCandidatesSection'
import { VolumeValue } from 'types/volumes'
import { showValidationErrorMessage } from 'api/errorHandler'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from '../Notification/Notification'
import { useAssignmentUpdate } from 'hooks/requests/useAssignments'
import { getBEDate } from 'helpers'

dayjs.extend(utc)

interface AssignmentProps extends AssignmentType {
  index: number
  source_language_classifier_value_id: string
  destination_language_classifier_value_id: string
  isVendorView?: boolean
  catSupported?: boolean
  cat_jobs?: CatJob[]
  cat_analyzis?: CatAnalysis[]
  volumes?: VolumeValue[]
  subOrderId?: string
  project: ListOrder
  deadline_at?: string
}

interface FormValues {
  deadline_at: { date?: string; time?: string }
  event_start_at?: { date?: string; time?: string }
  comments?: string
  // TODO: Not sure about the structure of following fields
  volume?: VolumeValue[]
  vendor_comments?: string
}

const Assignment: FC<AssignmentProps> = ({
  index,
  candidates,
  id,
  subOrderId,
  assigned_vendor_id,
  assignee,
  job_definition,
  source_language_classifier_value_id,
  destination_language_classifier_value_id,
  finished_at,
  isVendorView,
  catSupported,
  cat_jobs,
  cat_analyzis,
  volumes = [],
  project,
  comments,
  deadline_at,
}) => {
  const { t } = useTranslation()
  const { updateAssignment, isLoading } = useAssignmentUpdate({ id })
  const { vendor } = find(candidates, { vendor_id: assigned_vendor_id }) || {}
  const {
    deadline_at: projectDeadline,
    event_start_at: projectStartTime,
    type_classifier_value,
  } = project || {}

  const shouldShowStartTimeFields =
    type_classifier_value?.project_type_config?.is_start_date_supported

  // TODO: vendor price find is not finished yet.
  // There is a high possibility that the field names will be unified for source and destination language
  // We are also missing assignment task id at the moment

  // TODO: check if all other tasks/features in this subOrder have been finished
  // Possibly we can determine this my checking the status of the suborder, or by going over all assignments
  const allPreviousTasksFinished = false

  const vendorDiscounts = useMemo(
    () => pick(vendor, values(DiscountPercentageNames)),
    [vendor]
  ) as DiscountPercentages

  const feature = job_definition.job_key

  const vendorPrices = useMemo(() => {
    const matchingPrices = find(vendor?.prices, (price) => {
      const {
        skill_id,
        dst_lang_classifier_value_id,
        src_lang_classifier_value_id,
      } = price
      return (
        dst_lang_classifier_value_id ===
          destination_language_classifier_value_id &&
        src_lang_classifier_value_id === source_language_classifier_value_id &&
        skill_id
      )
    })
    if (matchingPrices) return matchingPrices as Price
    return undefined
  }, [
    destination_language_classifier_value_id,
    source_language_classifier_value_id,
    vendor?.prices,
  ])

  const { forename, surname } = vendor?.institution_user?.user || {}
  const vendorName = !!forename ? `${forename} ${surname}` : ''

  const defaultValues = useMemo(
    () => ({
      deadline_at: {
        date: dayjs.utc(deadline_at || projectDeadline).format('DD/MM/YYYY'),
        time: dayjs.utc(deadline_at || projectDeadline).format('HH:mm:ss'),
      },
      ...(shouldShowStartTimeFields
        ? {
            event_start_at: {
              date: dayjs(projectStartTime).format('DD/MM/YYYY'),
              time: dayjs(projectStartTime).format('HH:mm'),
            },
          }
        : {}),
      volume: volumes,
      comments,
    }),
    [
      comments,
      deadline_at,
      projectDeadline,
      projectStartTime,
      shouldShowStartTimeFields,
      volumes,
    ]
  )

  const { control, getValues } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  const handleMarkTaskAsFinished = useCallback(async () => {
    try {
      // await updateAssignment({
      //   // TODO: not sure if this is
      //   finished_at: getBEDate(),
      // })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.task_finished'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [t])

  const sendToPreviousAssignment = useCallback(async () => {
    try {
      // TODO: no idea what this does at the moment
      // await updateAssignment({
      //   // TODO: not sure if this is
      //   finished_at: null,
      // })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.sent_to_previous_task'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [t])

  const handleUpdateAssignment = useCallback(
    async (payload: AssignmentPayload) => {
      try {
        await updateAssignment(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.assignment_updated'),
        })
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [t, updateAssignment]
  )

  const textAreaElement =
    document?.getElementById(`textarea_${id}`) || document.body

  const formattedDeadline = useMemo(
    () => getBEDate(deadline_at || projectDeadline),
    [deadline_at, projectDeadline]
  )

  const handleAddComment = useCallback(
    (event: Event) => {
      const comment = getValues('comments')
      const isCommentChanged = !isEqual(comment, comments)

      if (textAreaElement.contains(event.target as Node) && isCommentChanged) {
        handleUpdateAssignment({
          deadline_at: formattedDeadline,
          comments: getValues('comments'),
        })
      }
    },

    [
      comments,
      formattedDeadline,
      getValues,
      handleUpdateAssignment,
      textAreaElement,
    ]
  )
  const handleAddDateTime = useCallback(
    (value: { date: string; time: string }) => {
      const { date, time } = value
      const dateTime = dayjs.utc(`${date} ${time}`, 'DD/MM/YYYY HH:mm')
      const formattedDateTime = dateTime.format('YYYY-MM-DDTHH:mm:ss[Z]')
      const isDeadLineChanged = !isEqual(formattedDeadline, formattedDateTime)

      if (isDeadLineChanged) {
        handleUpdateAssignment({
          deadline_at: formattedDateTime,
        })
      }
    },

    [formattedDeadline, handleUpdateAssignment]
  )

  useEffect(() => {
    textAreaElement.addEventListener('blur', handleAddComment)
    return () => {
      textAreaElement.removeEventListener('blur', handleAddComment)
    }
  }, [handleAddComment, textAreaElement])

  const fields: FieldProps<FormValues>[] = useMemo(
    () => [
      {
        inputType: InputTypes.DateTime,
        ariaLabel: t('label.deadline'),
        label: t('label.deadline'),
        className: classes.customInternalClass,
        name: 'deadline_at',
        minDate: new Date(),
        maxDate: dayjs(projectDeadline).toDate(),
        onDateTimeChange: handleAddDateTime,
        // onlyDisplay: !isEditable,
      },
      {
        inputType: InputTypes.DateTime,
        ariaLabel: t('label.start_date'),
        label: `${t('label.start_date')}`,
        hidden: !shouldShowStartTimeFields,
        className: classes.customInternalClass,
        name: 'event_start_at',
        minDate: new Date(),
        maxDate: dayjs(projectDeadline).toDate(),
        // onlyDisplay: !isEditable,
      },
      {
        inputType: InputTypes.Text,
        id: `textarea_${id}`,
        label: `${t('label.special_instructions')}`,
        ariaLabel: t('label.special_instructions'),
        placeholder: t('placeholder.write_here'),
        name: 'comments',
        className: classes.inputInternalPosition,
        isTextarea: true,
        // onlyDisplay: !isEditable,
      },
      // TODO: no idea what the data structure should be
      {
        inputType: InputTypes.AddVolume,
        label: `${t('label.volume')}`,
        name: 'volume',
        className: classes.inputInternalPosition,
        isTextarea: true,
        catSupported,
        vendorPrices,
        assignmentCatJobs: cat_jobs,
        vendorDiscounts,
        vendorName,
        value: volumes,
        assignmentId: id,
        subOrderId,
        // cat_jobs,
        cat_analyzis,
        // onlyDisplay: !isEditable,
      },
      {
        inputType: InputTypes.Text,
        label: `${t('label.vendor_comments')}`,
        ariaLabel: t('label.vendor_comments'),
        placeholder: t('placeholder.write_here'),
        name: 'vendor_comments',
        className: classes.inputInternalPosition,
        isTextarea: true,
        onlyDisplay: !isVendorView,
      },
    ],
    [
      t,
      projectDeadline,
      handleAddDateTime,
      shouldShowStartTimeFields,
      catSupported,
      vendorPrices,
      cat_jobs,
      vendorDiscounts,
      vendorName,
      volumes,
      id,
      subOrderId,
      cat_analyzis,
      isVendorView,
    ]
  )

  const selectedVendorsIds = map(candidates, 'vendor_id')
  const handleOpenVendorsModal = useCallback(() => {
    showModal(ModalTypes.SelectVendor, {
      assignmentId: id,
      selectedVendorsIds,
      // TODO: not sure where these taskSkills will come from
      taskSkills: [],
      source_language_classifier_value_id,
      destination_language_classifier_value_id,
    })
  }, [
    id,
    selectedVendorsIds,
    source_language_classifier_value_id,
    destination_language_classifier_value_id,
  ])

  return (
    <div className={classes.assignmentContainer}>
      <div>
        <h3>
          {t('task.vendor_title', { number: index + 1 })}(
          {t(`orders.features.${feature}`)})
        </h3>
        <span className={classes.assignmentId}>{id}</span>
        <Button
          size={SizeTypes.S}
          className={classes.addButton}
          onClick={handleOpenVendorsModal}
          disabled={feature === SubProjectFeatures.JobOverview}
        >
          {t('button.choose_from_database')}
        </Button>
        <DynamicForm
          fields={fields}
          control={control}
          className={classes.formContainer}
          useDivWrapper
        />
      </div>
      <div>
        <TaskCandidatesSection
          {...{
            id,
            job_definition,
            assigned_vendor_id,
            candidates,
            assignee_id: assignee?.id,
            finished_at,
          }}
        />
      </div>
      <div className={classes.formButtons}>
        <Button
          appearance={AppearanceTypes.Secondary}
          children={t('button.send_to_previous_task')}
          onClick={sendToPreviousAssignment}
          hidden={feature !== SubProjectFeatures.JobOverview}
          // disabled={isLoading}
        />
        <Button
          children={t('button.mark_as_finished')}
          disabled={
            !!finished_at ||
            (feature === SubProjectFeatures.JobOverview &&
              !allPreviousTasksFinished)
          }
          loading={isLoading}
          onClick={handleMarkTaskAsFinished}
        />
      </div>
    </div>
  )
}

export default Assignment
