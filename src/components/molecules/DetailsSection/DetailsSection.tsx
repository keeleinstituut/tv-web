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
import { TypesWithStartTime } from 'types/orders'
interface DetailsSectionProps<TFormValues extends FieldValues> {
  control: Control<TFormValues>
  isNew?: boolean
  isEditable?: boolean
}

const DetailsSection = <TFormValues extends FieldValues>({
  control,
  isNew,
  isEditable,
}: DetailsSectionProps<TFormValues>) => {
  const { t } = useTranslation()
  const { tagsFilters = [] } = useFetchTags({
    type: TagTypes.Order,
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
    }
  )
  // Fetch list of users bases on PersonSectionType
  // TODO: depends on the picked type classifier
  // const shouldShowStartTimeFields = true

  const selectedProjectTypeId = useWatch({
    control,
    name: 'type_classifier_value_id' as Path<TFormValues>,
  })

  const selectedProjectType = find(projectTypes, { id: selectedProjectTypeId })

  const fields: FieldProps<TFormValues>[] = useMemo(
    () => [
      {
        component: (
          <h2>{isNew ? t('orders.new_orders') : t('orders.order_details')}</h2>
        ),
      },
      {
        inputType: InputTypes.Text,
        ariaLabel: t('label.order_id'),
        label: `${t('label.order_id')}`,
        name: 'ext_id' as Path<TFormValues>,
        className: classes.inputInternalPosition,
        onlyDisplay: true,
        emptyDisplayText: '-',
        hidden: isEditable,
      },
      {
        inputType: InputTypes.Selections,
        ariaLabel: t('label.order_type'),
        placeholder: t('placeholder.pick'),
        label: `${t('label.order_type')}${!isEditable ? '' : '*'}`,
        name: 'type_classifier_value_id' as Path<TFormValues>,
        className: classes.inputSearch,
        options: projectTypeFilter,
        showSearch: true,
        onlyDisplay: !isEditable,
        emptyDisplayText: '-',
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
        label: `${t('label.start_date')}`,
        hidden: isNew
          ? !includes(values(TypesWithStartTime), selectedProjectType?.value)
          : !selectedProjectType?.project_type_config?.is_start_date_supported,
        className: classes.customInternalClass,
        name: 'event_start_at' as Path<TFormValues>,
        onlyDisplay: !isEditable,
        emptyDisplayText: '-',
      },
      {
        inputType: InputTypes.DateTime,
        ariaLabel: t('label.deadline'),
        label: `${t('label.deadline')}${!isEditable ? '' : '*'}`,
        className: classes.customInternalClass,
        name: 'deadline_at' as Path<TFormValues>,
        onlyDisplay: !isEditable,
        emptyDisplayText: '-',
        rules: {
          required: true,
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
      domainValuesFilter,
      selectedProjectType,
      languageFilters,
    ]
  )

  const extraFields: FieldProps<TFormValues>[] = useMemo(
    () => [
      {
        inputType: InputTypes.Selections,
        ariaLabel: t('label.order_tags'),
        placeholder: t('placeholder.pick'),
        label: t('label.order_tags'),
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
