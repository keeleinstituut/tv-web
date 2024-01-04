import { FC, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { useTranslation } from 'react-i18next'
import { find, pick, values, isEqual } from 'lodash'
import classes from './classes.module.scss'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'

import {
  getLocalDateOjectFromUtcDateString,
  getUtcDateStringFromLocalDateObject,
} from 'helpers'
import { VolumeValue } from 'types/volumes'
import { DiscountPercentageNames, DiscountPercentages } from 'types/vendors'
import { AssignmentPayload } from 'types/assignments'
import {
  useAssignmentUpdate,
  useAssignmentCache,
} from 'hooks/requests/useAssignments'
import { useSubProjectCache } from 'hooks/requests/useProjects'
import { Price } from 'types/price'
import { showValidationErrorMessage } from 'api/errorHandler'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import useValidators from 'hooks/useValidators'

dayjs.extend(utc)

interface AssignmentFormProps {
  id: string
  sub_project_id: string
  isEditable?: boolean
  isAssignmentFinished?: boolean
  catSupported?: boolean
}

interface FormValues {
  deadline_at: { date?: string; time?: string }
  event_start_at?: { date?: string; time?: string }
  comments?: string
  volume?: VolumeValue[]
  assignee_comments?: string
}

const AssignmentForm: FC<AssignmentFormProps> = ({
  id,
  sub_project_id,
  isEditable,
  catSupported,
  isAssignmentFinished,
}) => {
  const { t } = useTranslation()
  const { dateTimePickerValidator } = useValidators()
  const {
    deadline_at,
    event_start_at,
    volumes,
    candidates,
    comments,
    assigned_vendor_id,
    assignee_comments,
  } = useAssignmentCache({ sub_project_id, id }) || {}
  const {
    destination_language_classifier_value_id,
    source_language_classifier_value_id,
    deadline_at: subProjectDeadline,
    project,
  } = useSubProjectCache(sub_project_id) || {}
  const { type_classifier_value } = project || {}

  const { updateAssignment } = useAssignmentUpdate({ id })

  const shouldShowStartTimeFields =
    type_classifier_value?.project_type_config?.is_start_date_supported

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
      assignee_comments,
    }),
    [
      comments,
      deadline_at,
      event_start_at,
      shouldShowStartTimeFields,
      volumes,
      assignee_comments,
    ]
  )

  const { control } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  const { vendor } =
    find(candidates, ({ vendor }) => vendor?.id === assigned_vendor_id) || {}
  const { forename, surname } = vendor?.institution_user?.user || {}
  const vendorName = !!forename ? `${forename} ${surname}` : ''

  const vendorDiscounts = useMemo(
    () => pick(vendor, values(DiscountPercentageNames)),
    [vendor]
  ) as DiscountPercentages

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

  const handleAddDateTime = useCallback(
    (value: { date: string; time: string }) => {
      const { date, time } = value
      const { date: prevDate, time: prevTime } =
        defaultValues?.deadline_at || {}
      if (
        !date ||
        (date === prevDate && time === prevTime) ||
        dateTimePickerValidator(value)
      )
        return false

      handleUpdateAssignment({
        deadline_at: getUtcDateStringFromLocalDateObject(value),
      })
    },

    [
      defaultValues?.deadline_at,
      handleUpdateAssignment,
      dateTimePickerValidator,
    ]
  )

  const handleAddStartTime = useCallback(
    (value: { date: string; time: string }) => {
      const { date, time } = value
      const { date: deadlineDate, time: deadlineTime } =
        defaultValues?.deadline_at || {}
      const { date: prevDate, time: prevTime } =
        defaultValues?.event_start_at || {}
      if (
        !date ||
        (date === prevDate && time === prevTime) ||
        dateTimePickerValidator(value)
      )
        return false

      handleUpdateAssignment({
        ...(deadlineDate
          ? {
              deadline_at: getUtcDateStringFromLocalDateObject({
                date: deadlineDate,
                time: deadlineTime,
              }),
            }
          : {}),
        event_start_at: getUtcDateStringFromLocalDateObject(value),
      })
    },

    [
      defaultValues?.deadline_at,
      defaultValues?.event_start_at,
      handleUpdateAssignment,
    ]
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

  const fields: FieldProps<FormValues>[] = useMemo(
    () => [
      {
        inputType: InputTypes.DateTime,
        ariaLabel: t('label.deadline'),
        label: t('label.deadline'),
        className: classes.customInternalClass,
        name: 'deadline_at',
        maxDate: dayjs(subProjectDeadline).toDate(),
        onDateTimeChange: handleAddDateTime,
        disabled: !isEditable || isAssignmentFinished,
      },
      {
        inputType: InputTypes.DateTime,
        ariaLabel: t('label.start_date'),
        label: `${t('label.start_date')}`,
        hidden: !shouldShowStartTimeFields,
        className: classes.customInternalClass,
        name: 'event_start_at',
        maxDate: dayjs(subProjectDeadline).toDate(),
        onDateTimeChange: handleAddStartTime,
        disabled: !isEditable || isAssignmentFinished,
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
        disabled: !isEditable || isAssignmentFinished,
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
        name: 'assignee_comments',
        className: classes.inputInternalPosition,
        isTextarea: true,
        onlyDisplay: true,
      },
    ],
    [
      t,
      subProjectDeadline,
      handleAddDateTime,
      isEditable,
      isAssignmentFinished,
      shouldShowStartTimeFields,
      handleAddStartTime,
      id,
      handleAddComment,
      catSupported,
      vendorPrices,
      vendorDiscounts,
      vendorName,
      volumes,
      sub_project_id,
    ]
  )

  return (
    <DynamicForm
      fields={fields}
      control={control}
      className={classes.formContainer}
      useDivWrapper
    />
  )
}

export default AssignmentForm
