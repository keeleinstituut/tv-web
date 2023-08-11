import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import DynamicForm, {
  InputTypes,
  FieldProps,
} from 'components/organisms/DynamicForm/DynamicForm'
import classNames from 'classnames'
import { Control, FieldValues, Path } from 'react-hook-form'
import { ClassifierValueType } from 'types/classifierValues'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { useFetchTags } from 'hooks/requests/useTags'
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
  const { tagsFilters = [] } = useFetchTags()
  const { classifierValuesFilters: projectTypeFilter } =
    useClassifierValuesFetch({
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
  const shouldShowStartTimeFields = true

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
        hidden: isNew,
      },
      {
        inputType: InputTypes.Selections,
        ariaLabel: t('label.order_type'),
        placeholder: t('placeholder.pick'),
        label: `${t('label.order_type')}${!isNew ? '' : '*'}`,
        name: 'type_classifier_value_id' as Path<TFormValues>,
        className: classes.inputInternalPosition,
        options: projectTypeFilter,
        showSearch: true,
        onlyDisplay: !isEditable,
        rules: {
          required: true,
        },
      },
      // TODO: translation_domain info missing right now, this is based on dummydata
      {
        inputType: InputTypes.Selections,
        ariaLabel: t('label.translation_domain'),
        placeholder: t('placeholder.pick'),
        label: `${t('label.translation_domain')}${!isNew ? '' : '*'}`,
        name: 'translation_domain' as Path<TFormValues>,
        className: classes.inputInternalPosition,
        options: domainValuesFilter,
        showSearch: true,
        onlyDisplay: !isEditable,
        rules: {
          required: true,
        },
      },
      {
        inputType: InputTypes.DateTime,
        ariaLabel: t('label.start_date'),
        placeholder: t('placeholder.date'),
        label: `${t('label.start_date')}`,
        hidden: !shouldShowStartTimeFields,
        className: classes.customInternalClass,
        name: 'start_at' as Path<TFormValues>,
        onlyDisplay: !isEditable,
      },
      {
        inputType: InputTypes.DateTime,
        ariaLabel: t('label.deadline'),
        placeholder: t('placeholder.date'),
        label: `${t('label.deadline')}${!isNew ? '' : '*'}`,
        className: classes.customInternalClass,
        name: 'deadline_at' as Path<TFormValues>,
        onlyDisplay: !isEditable,
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
      },
      {
        inputType: InputTypes.Text,
        ariaLabel: t('label.reference_number'),
        placeholder: t('placeholder.write_here'),
        label: `${t('label.reference_number')}`,
        name: 'reference_number' as Path<TFormValues>,
        className: classes.inputInternalPosition,
        onlyDisplay: !isEditable,
      },
      {
        inputType: InputTypes.Selections,
        ariaLabel: t('label.source_language'),
        placeholder: t('placeholder.pick'),
        label: `${t('label.source_language')}${!isNew ? '' : '*'}`,
        name: 'src_lang' as Path<TFormValues>,
        className: classes.inputInternalPosition,
        options: languageFilters,
        showSearch: true,
        onlyDisplay: !isEditable,
        rules: {
          required: true,
        },
      },
      {
        inputType: InputTypes.Selections,
        ariaLabel: t('label.destination_language'),
        placeholder: t('placeholder.pick'),
        label: `${t('label.destination_language')}${!isNew ? '' : '*'}`,
        name: 'dst_lang' as Path<TFormValues>,
        className: classes.inputInternalPosition,
        options: languageFilters,
        showSearch: true,
        multiple: true,
        buttons: true,
        onlyDisplay: !isEditable,
        rules: {
          required: true,
        },
      },
    ],
    [
      domainValuesFilter,
      languageFilters,
      projectTypeFilter,
      shouldShowStartTimeFields,
      isNew,
      isEditable,
      t,
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
        className: classes.inputInternalPosition,
        options: tagsFilters,
        showSearch: true,
        multiple: true,
        buttons: true,
        onlyDisplay: !isEditable,
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
        !isNew && classes.adjustedLayout
      )}
      useDivWrapper
    />
  )
}

export default DetailsSection
