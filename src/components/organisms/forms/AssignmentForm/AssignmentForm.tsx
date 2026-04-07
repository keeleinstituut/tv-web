import { FC, useCallback, useEffect, useMemo } from 'react'
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
  getLocalDateObjectFromUtcDateString,
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
import { formatDuration } from 'helpers/calendar'

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
  duration?: string
  service_type?: string
  event_location?: string
  meeting_link?: string
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
    event_start_at: subProjectEventStartAt,
    project,
  } = useSubProjectCache(sub_project_id) || {}
  const { type_classifier_value, service_type: projectServiceType, event_location, location, meeting_link, event_end_at: projectEventEndAt } = project || {}
  const effectiveLocation = event_location || location || ''

  const normalizedServiceType = (() => {
    if (projectServiceType === 'ON_SITE') return 'contact'
    if (projectServiceType === 'REMOTE') return 'remote'
    if (projectServiceType) return projectServiceType
    if (effectiveLocation) return 'contact'
    if (meeting_link) return 'remote'
    return ''
  })()

  const { updateAssignment } = useAssignmentUpdate({ id })

  const shouldShowStartTimeFields =
    type_classifier_value?.project_type_config?.is_start_date_supported

  const isVerbalType =
    !!shouldShowStartTimeFields &&
    type_classifier_value?.value !== 'POST_TRANSLATION'

  const effectiveStartAt = event_start_at || subProjectEventStartAt
  const effectiveEndAt = projectEventEndAt
  const effectiveDeadlineAt = deadline_at || subProjectDeadline

  const defaultValues = useMemo(
    () => ({
      ...(effectiveDeadlineAt
        ? { deadline_at: getLocalDateObjectFromUtcDateString(effectiveDeadlineAt) }
        : {}),
      ...(shouldShowStartTimeFields && effectiveStartAt
        ? { event_start_at: getLocalDateObjectFromUtcDateString(effectiveStartAt) }
        : {}),
      volume: volumes,
      comments,
      assignee_comments,
      duration:
        isVerbalType && effectiveStartAt && effectiveEndAt
          ? formatDuration(effectiveStartAt, effectiveEndAt)
          : undefined,
      service_type: normalizedServiceType,
      event_location: effectiveLocation,
      meeting_link: meeting_link || '',
    }),
    [
      comments,
      effectiveDeadlineAt,
      effectiveStartAt,
      effectiveEndAt,
      volumes,
      assignee_comments,
      shouldShowStartTimeFields,
      isVerbalType,
      normalizedServiceType,
      effectiveLocation,
      meeting_link,
    ]
  )

  const { control, reset } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  useEffect(() => {
    reset(defaultValues)
  }, [reset, defaultValues])

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
        dateTimePickerValidator(value) !== true
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
        dateTimePickerValidator(value) !== true
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
      dateTimePickerValidator,
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
        inputType: InputTypes.Selections,
        ariaLabel: t('calendar.service_type'),
        label: t('calendar.service_type'),
        name: 'service_type',
        hidden: !isVerbalType || !normalizedServiceType,
        options: [
          { value: 'contact', label: t('calendar.service_type_contact') },
          { value: 'remote', label: t('calendar.service_type_remote') },
        ],
        onlyDisplay: true,
        emptyDisplayText: '-',
      },
      {
        inputType: InputTypes.Text,
        ariaLabel: t('calendar.location'),
        label: t('calendar.location'),
        name: 'event_location',
        hidden: !isVerbalType || normalizedServiceType !== 'contact',
        onlyDisplay: true,
        emptyDisplayText: '-',
      },
      {
        inputType: InputTypes.Text,
        ariaLabel: t('calendar.meeting_link'),
        label: t('calendar.meeting_link'),
        name: 'meeting_link',
        hidden: !isVerbalType || normalizedServiceType !== 'remote',
        onlyDisplay: true,
        emptyDisplayText: '-',
      },
      {
        inputType: InputTypes.DateTime,
        ariaLabel: t('label.start_date'),
        label: `${t('label.start_date')}`,
        hidden: !shouldShowStartTimeFields,
        className: classes.customInternalClass,
        name: 'event_start_at',
        maxDate: subProjectDeadline
          ? dayjs(subProjectDeadline).toDate()
          : undefined,
        onDateTimeChange: handleAddStartTime,
        disabled: !isEditable || isAssignmentFinished,
      },
      {
        inputType: InputTypes.Text,
        ariaLabel: t('calendar.duration'),
        label: t('calendar.duration'),
        hidden: !isVerbalType,
        name: 'duration',
        className: classes.customInternalClass,
        onlyDisplay: true,
      },
      {
        inputType: InputTypes.DateTime,
        ariaLabel: t('label.deadline'),
        label: t('label.deadline'),
        hidden: isVerbalType,
        className: classes.customInternalClass,
        name: 'deadline_at',
        maxDate: subProjectDeadline
          ? dayjs(subProjectDeadline).toDate()
          : undefined,
        onDateTimeChange: handleAddDateTime,
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
      isVerbalType,
      handleAddStartTime,
      id,
      handleAddComment,
      catSupported,
      vendorPrices,
      vendorDiscounts,
      vendorName,
      volumes,
      sub_project_id,
      normalizedServiceType,
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
