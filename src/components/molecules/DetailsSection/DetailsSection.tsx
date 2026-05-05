import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import DynamicForm, {
  InputTypes,
  FieldProps,
} from 'components/organisms/DynamicForm/DynamicForm'
import { find, includes, values } from 'lodash'
import classNames from 'classnames'
import { Control, FieldValues, Path, useWatch } from 'react-hook-form'
import { ClassifierValueType } from 'types/classifierValues'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { useFetchTags } from 'hooks/requests/useTags'
import { TagTypes } from 'types/tags'
import { TypesWithStartTime } from 'types/projects'
import { orderClassifierByLangPriority } from 'helpers'
import { formatDuration } from 'helpers/calendar'
import DisplayValue from 'components/molecules/DisplayValue/DisplayValue'
import dayjs from 'dayjs'

const VERBAL_TYPES = values(TypesWithStartTime)

// OralTranslation has its own dedicated calendar/oral order flow,
// so it's the only type excluded from the regular project creation dropdown.
const CALENDAR_ONLY_TYPES = [TypesWithStartTime.OralTranslation]

interface DetailsSectionProps<TFormValues extends FieldValues> {
  control: Control<TFormValues>
  isNew?: boolean
  isEditable?: boolean
  workflow_started?: boolean
}

const DetailsSection = <TFormValues extends FieldValues>({
  control,
  isNew,
  isEditable,
  workflow_started,
}: DetailsSectionProps<TFormValues>) => {
  const { t } = useTranslation()
  const { tagsFilters = [] } = useFetchTags({
    type: TagTypes.Project,
  })
  const {
    classifierValuesFilters: projectTypeFilter,
    classifierValues: projectTypes,
  } = useClassifierValuesFetch({
    type: ClassifierValueType.ProjectType,
  })
  // TODO: we don't have correct DomainType yet
  const { classifierValuesFilters: domainValuesFilter } =
    useClassifierValuesFetch({
      type: ClassifierValueType.TranslationDomain,
    })
  const { classifierValuesFilters: languageFilters } = useClassifierValuesFetch(
    {
      type: ClassifierValueType.Language,
    },
    orderClassifierByLangPriority
  )
  // Fetch list of users bases on PersonSectionType
  // TODO: depends on the picked type classifier
  // const shouldShowStartTimeFields = true

  const [
    selectedProjectTypeId,
    selectedServiceType,
    watchedEventStartAt,
    watchedEventEndAt,
  ] = useWatch({
    control,
    name: [
      'type_classifier_value_id' as Path<TFormValues>,
      'service_type' as Path<TFormValues>,
      'event_start_at' as Path<TFormValues>,
      'event_end_at' as Path<TFormValues>,
    ],
  })

  const selectedProjectType = find(projectTypes, { id: selectedProjectTypeId })

  const isVerbalType = includes(VERBAL_TYPES, selectedProjectType?.value)

  const durationDisplay = useMemo(() => {
    if (!isVerbalType) return ''
    const start = watchedEventStartAt as
      | { date?: string; time?: string }
      | undefined
    const end = watchedEventEndAt as
      | { date?: string; time?: string }
      | undefined
    if (!start?.date || !start?.time || !end?.date || !end?.time) return ''
    const fmt = ['DD/MM/YYYY HH:mm:ss', 'DD/MM/YYYY HH:mm']
    const startDt = dayjs(`${start.date} ${start.time}`, fmt)
    const endDt = dayjs(`${end.date} ${end.time}`, fmt)
    if (!startDt.isValid() || !endDt.isValid() || !endDt.isAfter(startDt))
      return ''
    return formatDuration(startDt.toISOString(), endDt.toISOString())
  }, [isVerbalType, watchedEventStartAt, watchedEventEndAt])

  const nonVerbalProjectTypeFilter = useMemo(
    () =>
      (projectTypeFilter ?? []).filter(
        (_, i) => !includes(CALENDAR_ONLY_TYPES, projectTypes?.[i]?.value)
      ),
    [projectTypeFilter, projectTypes]
  )

  const fields: FieldProps<TFormValues>[] = useMemo(
    () => [
      {
        component: (
          <h2>
            {isNew ? t('projects.new_projects') : t('projects.project_details')}
          </h2>
        ),
      },
      {
        inputType: InputTypes.Text,
        ariaLabel: t('label.project_id'),
        label: `${t('label.project_id')}`,
        name: 'ext_id' as Path<TFormValues>,
        className: classes.inputInternalPosition,
        onlyDisplay: true,
        emptyDisplayText: '-',
        hidden: isEditable,
      },
      {
        inputType: InputTypes.Selections,
        ariaLabel: t('label.project_type'),
        placeholder: t('placeholder.pick'),
        label: `${t('label.project_type')}${!isEditable ? '' : '*'}`,
        name: 'type_classifier_value_id' as Path<TFormValues>,
        className: classes.inputSearch,
        options: isNew ? nonVerbalProjectTypeFilter : projectTypeFilter,
        showSearch: true,
        onlyDisplay: !isEditable,
        emptyDisplayText: '-',
        disabled: workflow_started,
        rules: {
          required: true,
        },
      },
      // TODO: translation_domain info missing right now, this is based on dummydata
      {
        inputType: InputTypes.Selections,
        ariaLabel: t('label.translation_domain'),
        placeholder: t('placeholder.pick'),
        label: `${t('label.translation_domain')}${!isEditable ? '' : '*'}`,
        name: 'translation_domain_classifier_value_id' as Path<TFormValues>,
        className: classes.inputSearch,
        options: domainValuesFilter,
        showSearch: true,
        onlyDisplay: !isEditable,
        emptyDisplayText: '-',
        rules: {
          required: true,
        },
      },
      {
        inputType: InputTypes.DateTime,
        ariaLabel: t('label.start_date'),
        label: `${t('label.start_date')}${!isEditable ? '' : '*'}`,
        hidden: isNew
          ? !includes(values(TypesWithStartTime), selectedProjectType?.value)
          : !selectedProjectType?.project_type_config?.is_start_date_supported,
        className: classes.customInternalClass,
        name: 'event_start_at' as Path<TFormValues>,
        onlyDisplay: !isEditable,
        emptyDisplayText: '-',
        rules: {
          required: true,
          validate: (value: { date?: string; time?: string }, formValues) => {
            if (!formValues.deadline_at?.date) return true
            const deadline_at = dayjs(
              formValues.deadline_at.date + ' ' + formValues.deadline_at.time
            )
            const event_start_at = dayjs(value.date + ' ' + value.time)

            if (event_start_at.isAfter(deadline_at)) {
              return t('error.event_start_at_after_deadline_at')
            }
            return true
          },
        },
      },
      {
        hidden: !isVerbalType || !durationDisplay,
        component: (
          <DisplayValue
            name="duration"
            label={t('calendar.duration')}
            value={durationDisplay}
            className={classes.inputInternalPosition}
          />
        ),
      },
      {
        inputType: InputTypes.DateTime,
        ariaLabel: t('label.end_date'),
        label: `${t('label.end_date')}${!isEditable ? '' : '*'}`,
        hidden: !isVerbalType,
        className: classes.customInternalClass,
        name: 'event_end_at' as Path<TFormValues>,
        onlyDisplay: !isEditable,
        emptyDisplayText: '-',
        rules: {
          required: isVerbalType,
          validate: (value: { date?: string; time?: string }, formValues) => {
            if (!formValues.event_start_at?.date) return true
            const event_start_at = dayjs(
              formValues.event_start_at.date +
                ' ' +
                formValues.event_start_at.time
            )
            const event_end_at = dayjs(value.date + ' ' + value.time)

            if (event_end_at.isBefore(event_start_at)) {
              return t('error.deadline_at_before_event_start_at')
            }
            return true
          },
        },
      },
      {
        inputType: InputTypes.DateTime,
        ariaLabel: t('label.deadline'),
        label: `${t('label.deadline')}${!isEditable ? '' : '*'}`,
        hidden: isVerbalType,
        className: classes.customInternalClass,
        name: 'deadline_at' as Path<TFormValues>,
        onlyDisplay: !isEditable,
        emptyDisplayText: '-',
        rules: {
          required: !isVerbalType,
          validate: (value: { date?: string; time?: string }, formValues) => {
            if (!formValues.event_start_at?.date) return true
            const deadline_at = dayjs(value.date + ' ' + value.time)
            const event_start_at = dayjs(
              formValues.event_start_at.date +
                ' ' +
                formValues.event_start_at.time
            )

            if (deadline_at.isBefore(event_start_at)) {
              return t('error.deadline_at_before_event_start_at')
            }
            return true
          },
        },
      },
      {
        inputType: InputTypes.Selections,
        ariaLabel: t('calendar.service_type'),
        placeholder: t('placeholder.pick'),
        label: `${t('calendar.service_type')}${!isEditable ? '' : '*'}`,
        name: 'service_type' as Path<TFormValues>,
        className: classes.inputSearch,
        options: [
          {
            value: 'contact',
            label: t('calendar.service_type_contact'),
          },
          {
            value: 'remote',
            label: t('calendar.service_type_remote'),
          },
        ],
        hidden: !isVerbalType,
        onlyDisplay: !isEditable,
        emptyDisplayText: '-',
        rules: {
          required: isVerbalType,
        },
      },
      {
        inputType: InputTypes.Text,
        ariaLabel: t('calendar.location'),
        placeholder: t('calendar.enter_address'),
        label: `${t('calendar.location')}${!isEditable ? '' : '*'}`,
        name: 'event_location' as Path<TFormValues>,
        className: classes.inputInternalPosition,
        hidden: !isVerbalType || selectedServiceType !== 'contact',
        onlyDisplay: !isEditable,
        emptyDisplayText: '-',
        rules: {
          required: isVerbalType && selectedServiceType === 'contact',
        },
      },
      {
        inputType: InputTypes.Text,
        ariaLabel: t('calendar.meeting_link'),
        placeholder: t('calendar.enter_link'),
        label: `${t('calendar.meeting_link')}${!isEditable ? '' : '*'}`,
        name: 'meeting_link' as Path<TFormValues>,
        className: classes.inputInternalPosition,
        hidden: !isVerbalType || selectedServiceType !== 'remote',
        onlyDisplay: !isEditable,
        emptyDisplayText: '-',
        rules: {
          required: isVerbalType && selectedServiceType === 'remote',
        },
      },
      // TODO: not sure if comment field is correct for this
      {
        inputType: InputTypes.Text,
        label: `${t('label.special_instructions')}`,
        ariaLabel: t('label.special_instructions'),
        placeholder: t('placeholder.write_here'),
        name: 'comments' as Path<TFormValues>,
        className: classes.inputInternalPosition,
        isTextarea: true,
        onlyDisplay: !isEditable,
        emptyDisplayText: '-',
      },
      {
        inputType: InputTypes.Text,
        ariaLabel: t('label.reference_number'),
        placeholder: t('placeholder.write_here'),
        label: `${t('label.reference_number')}`,
        name: 'reference_number' as Path<TFormValues>,
        className: classes.inputInternalPosition,
        onlyDisplay: !isEditable,
        emptyDisplayText: '-',
      },
      {
        inputType: InputTypes.Selections,
        ariaLabel: t('label.source_language'),
        placeholder: t('placeholder.pick'),
        label: `${t('label.source_language')}${!isEditable ? '' : '*'}`,
        name: 'source_language_classifier_value_id' as Path<TFormValues>,
        className: classes.inputSearch,
        options: languageFilters,
        showSearch: true,
        onlyDisplay: !isEditable,
        disabled: workflow_started,
        emptyDisplayText: '-',
        rules: {
          required: true,
        },
      },
      {
        inputType: InputTypes.Selections,
        ariaLabel: t('label.destination_language'),
        placeholder: t('placeholder.pick'),
        label: `${t('label.destination_language')}${!isEditable ? '' : '*'}`,
        name: 'destination_language_classifier_value_ids' as Path<TFormValues>,
        className: classes.inputSearch,
        options: languageFilters,
        showSearch: true,
        multiple: true,
        buttons: true,
        disabled: workflow_started,
        onlyDisplay: !isEditable,
        emptyDisplayText: '-',
        rules: {
          required: true,
        },
      },
    ],
    [
      isNew,
      t,
      isEditable,
      projectTypeFilter,
      nonVerbalProjectTypeFilter,
      workflow_started,
      domainValuesFilter,
      selectedProjectType?.value,
      selectedProjectType?.project_type_config?.is_start_date_supported,
      languageFilters,
      isVerbalType,
      selectedServiceType,
      durationDisplay,
    ]
  )

  const extraFields: FieldProps<TFormValues>[] = useMemo(
    () => [
      {
        inputType: InputTypes.Selections,
        ariaLabel: t('label.project_tags'),
        placeholder: t('placeholder.pick'),
        label: t('label.project_tags'),
        name: 'tags' as Path<TFormValues>,
        className: classes.inputSearch,
        options: tagsFilters,
        showSearch: true,
        multiple: true,
        buttons: true,
        onlyDisplay: !isEditable,
        emptyDisplayText: '-',
      },
      {
        inputType: InputTypes.Text,
        ariaLabel: t('label.created_at'),
        label: t('label.created_at'),
        name: 'created_at' as Path<TFormValues>,
        className: classNames(classes.inputInternalPosition, classes.grayRow),
        onlyDisplay: true,
        emptyDisplayText: '-',
      },
      {
        inputType: InputTypes.Text,
        ariaLabel: t('label.cancelled_at'),
        label: t('label.cancelled_at'),
        name: 'cancelled_at' as Path<TFormValues>,
        className: classNames(classes.inputInternalPosition, classes.grayRow),
        onlyDisplay: true,
        emptyDisplayText: '-',
      },
      {
        inputType: InputTypes.Text,
        ariaLabel: t('label.rejected_at'),
        label: t('label.rejected_at'),
        name: 'rejected_at' as Path<TFormValues>,
        className: classNames(classes.inputInternalPosition, classes.grayRow),
        onlyDisplay: true,
        emptyDisplayText: '-',
      },
      {
        inputType: InputTypes.Text,
        ariaLabel: t('label.corrected_at'),
        label: t('label.corrected_at'),
        name: 'corrected_at' as Path<TFormValues>,
        className: classNames(classes.inputInternalPosition, classes.grayRow),
        onlyDisplay: true,
        emptyDisplayText: '-',
      },
      {
        inputType: InputTypes.Text,
        ariaLabel: t('label.accepted_at'),
        label: t('label.accepted_at'),
        name: 'accepted_at' as Path<TFormValues>,
        className: classNames(classes.inputInternalPosition, classes.grayRow),
        onlyDisplay: true,
        emptyDisplayText: '-',
      },
    ],
    [isEditable, t, tagsFilters]
  )

  return (
    <DynamicForm
      fields={[...fields, ...(isNew ? [] : extraFields)]}
      control={control}
      className={classNames(
        classes.formContainer,
        !isEditable && classes.adjustedLayout
      )}
      useDivWrapper
    />
  )
}

export default DetailsSection
