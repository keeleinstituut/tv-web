import { FC, useCallback, useMemo } from 'react'
import { map, find, pick, values, isEqual, includes } from 'lodash'
import { ListProject, SubProjectFeatures } from 'types/projects'
import {
  AssignmentPayload,
  AssignmentStatus,
  AssignmentType,
} from 'types/assignments'
import { useTranslation } from 'react-i18next'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'

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
import AssignmentCandidatesSection from 'components/molecules/AssignmentCandidatesSection/AssignmentCandidatesSection'
import { VolumeValue } from 'types/volumes'
import { showValidationErrorMessage } from 'api/errorHandler'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from '../Notification/Notification'
import {
  useAssignmentUpdate,
  useDeleteAssignment,
} from 'hooks/requests/useAssignments'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import {
  getLocalDateOjectFromUtcDateString,
  getUtcDateStringFromLocalDateObject,
} from 'helpers'
import { useCompleteAssignment } from 'hooks/requests/useAssignments'

dayjs.extend(utc)

interface AssignmentProps extends AssignmentType {
  index: number
  source_language_classifier_value_id: string
  destination_language_classifier_value_id: string
  isVendorView?: boolean
  catSupported?: boolean
  ext_id?: string
  volumes?: VolumeValue[]
  project: ListProject
  subProjectDeadline?: string
  isEditable?: boolean
}

interface FormValues {
  deadline_at: { date?: string; time?: string }
  event_start_at?: { date?: string; time?: string }
  comments?: string
  volume?: VolumeValue[]
  vendor_comments?: string
}

const Assignment: FC<AssignmentProps> = ({
  index,
  candidates,
  id,
  sub_project_id,
  assigned_vendor_id,
  assignee,
  job_definition,
  source_language_classifier_value_id,
  destination_language_classifier_value_id,
  finished_at,
  isVendorView,
  catSupported,
  ext_id,
  volumes = [],
  project,
  comments,
  deadline_at,
  event_start_at,
  status,
  subProjectDeadline,
  isEditable,
}) => {
  const { t } = useTranslation()
  const { completeAssignment, isLoading: isCompletingAssignment } =
    useCompleteAssignment({
      id,
    })
  const { updateAssignment } = useAssignmentUpdate({ id })
  const { deleteAssignment, isLoading: isDeletingAssignment } =
    useDeleteAssignment()

  const { vendor } =
    find(candidates, ({ vendor }) => vendor.id === assigned_vendor_id) || {}
  const { type_classifier_value } = project || {}

  const shouldShowStartTimeFields =
    type_classifier_value?.project_type_config?.is_start_date_supported

  const vendorDiscounts = useMemo(
    () => pick(vendor, values(DiscountPercentageNames)),
    [vendor]
  ) as DiscountPercentages

  const feature = job_definition.job_key
  const skill_id = job_definition.skill_id

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
      ...(deadline_at
        ? { deadline_at: getLocalDateOjectFromUtcDateString(deadline_at) }
        : {}),
      ...(shouldShowStartTimeFields && event_start_at
        ? {
            event_start_at: getLocalDateOjectFromUtcDateString(event_start_at),
          }
        : {}),
      volume: volumes,
      comments,
    }),
    [comments, deadline_at, event_start_at, shouldShowStartTimeFields, volumes]
  )

  const { control } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  const handleMarkAssignmentAsFinished = useCallback(async () => {
    try {
      await completeAssignment({})
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.task_finished'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [completeAssignment, t])

  const selectedVendorsIds = map(candidates, 'vendor.id')

  const openConfirmAssignmentCompletion = useCallback(() => {
    showModal(ModalTypes.ConfirmAssignmentCompletion, {
      sub_project_id,
      id,
    })
  }, [id, sub_project_id])

  const sendToPreviousAssignment = useCallback(async () => {
    try {
      await completeAssignment({ accepted: false })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.sent_to_previous_task'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [completeAssignment, t])

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

  const handleAddComment = useCallback(
    (value: string) => {
      const isCommentChanged = !isEqual(value, comments)
      const { date, time } = defaultValues?.deadline_at || {}
      if (isCommentChanged) {
        handleUpdateAssignment({
          ...(date
            ? {
                deadline_at: getUtcDateStringFromLocalDateObject({
                  date,
                  time,
                }),
              }
            : {}),
          comments: value,
        })
      }
    },

    [comments, defaultValues?.deadline_at, handleUpdateAssignment]
  )

  const handleAddDateTime = useCallback(
    (value: { date: string; time: string }) => {
      const { date, time } = value
      const { date: prevDate, time: prevTime } =
        defaultValues?.deadline_at || {}
      if (!date || (date === prevDate && time === prevTime)) return false

      handleUpdateAssignment({
        deadline_at: getUtcDateStringFromLocalDateObject(value),
      })
    },

    [defaultValues?.deadline_at, handleUpdateAssignment]
  )

  const handleDeleteAssignment = useCallback(async () => {
    try {
      await deleteAssignment(id)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.assignment_deleted'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [deleteAssignment, id, t])

  const fields: FieldProps<FormValues>[] = useMemo(
    () => [
      {
        inputType: InputTypes.DateTime,
        ariaLabel: t('label.deadline'),
        label: t('label.deadline'),
        className: classes.customInternalClass,
        name: 'deadline_at',
        minDate: new Date(),
        maxDate: dayjs(subProjectDeadline).toDate(),
        onDateTimeChange: handleAddDateTime,
        disabled: !isEditable,
      },
      {
        inputType: InputTypes.DateTime,
        ariaLabel: t('label.start_date'),
        label: `${t('label.start_date')}`,
        hidden: !shouldShowStartTimeFields,
        className: classes.customInternalClass,
        name: 'event_start_at',
        minDate: new Date(),
        maxDate: dayjs(subProjectDeadline).toDate(),
        disabled: !isEditable,
      },
      {
        inputType: InputTypes.Text,
        id: id,
        label: `${t('label.special_instructions')}`,
        ariaLabel: t('label.special_instructions'),
        placeholder: t('placeholder.write_here'),
        name: 'comments',
        className: classes.inputInternalPosition,
        isTextarea: true,
        handleOnBlur: handleAddComment,
        disabled: !isEditable,
      },
      {
        inputType: InputTypes.AddVolume,
        label: `${t('label.volume')}`,
        name: 'volume',
        className: classes.inputInternalPosition,
        isTextarea: true,
        catSupported,
        vendorPrices,
        vendorDiscounts,
        vendorName,
        value: volumes,
        assignmentId: id,
        sub_project_id,
        disabled: !isEditable,
      },
      {
        inputType: InputTypes.Text,
        label: `${t('label.vendor_comments')}`,
        ariaLabel: t('label.vendor_comments'),
        placeholder: t('placeholder.write_here'),
        name: 'vendor_comments',
        className: classes.inputInternalPosition,
        isTextarea: true,
        onlyDisplay: !isVendorView || !isEditable,
      },
    ],
    [
      t,
      subProjectDeadline,
      handleAddDateTime,
      isEditable,
      shouldShowStartTimeFields,
      id,
      handleAddComment,
      catSupported,
      vendorPrices,
      vendorDiscounts,
      vendorName,
      volumes,
      sub_project_id,
      isVendorView,
    ]
  )

  const handleOpenVendorsModal = useCallback(() => {
    showModal(ModalTypes.SelectVendor, {
      assignmentId: id,
      selectedVendorsIds,
      skill_id,
      source_language_classifier_value_id,
      destination_language_classifier_value_id,
    })
  }, [
    id,
    skill_id,
    selectedVendorsIds,
    source_language_classifier_value_id,
    destination_language_classifier_value_id,
  ])

  return (
    <div className={classes.assignmentContainer}>
      <div>
        <h3 className={classes.titleContainer}>
          {t('task.vendor_title', { number: index + 1 })}(
          {t(`projects.features.${feature}`)})
          <BaseButton
            className={classes.deleteButton}
            hidden={index === 0}
            onClick={handleDeleteAssignment}
            loading={isDeletingAssignment}
          >
            <Delete />
          </BaseButton>
        </h3>

        <span className={classes.assignmentId}>{ext_id}</span>

        <Button
          size={SizeTypes.S}
          className={classes.addButton}
          onClick={handleOpenVendorsModal}
          disabled={
            feature === SubProjectFeatures.JobOverview ||
            !includes(
              [AssignmentStatus.New, AssignmentStatus.InProgress],
              status
            )
          }
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
        <AssignmentCandidatesSection
          {...{
            id,
            job_definition,
            assigned_vendor_id,
            candidates,
            assignee_id: assignee?.id,
            finished_at,
            isEditable,
          }}
        />
      </div>
      <div className={classes.formButtons}>
        <Button
          appearance={AppearanceTypes.Secondary}
          children={t('button.send_to_previous_task')}
          onClick={sendToPreviousAssignment}
          hidden={feature !== SubProjectFeatures.JobOverview}
          disabled={!isEditable}
        />
        <Button
          children={t('button.mark_as_finished')}
          disabled={status !== AssignmentStatus.InProgress}
          loading={isCompletingAssignment}
          onClick={
            feature !== SubProjectFeatures.JobOverview
              ? handleMarkAssignmentAsFinished
              : openConfirmAssignmentCompletion
          }
        />
      </div>
    </div>
  )
}

export default Assignment
