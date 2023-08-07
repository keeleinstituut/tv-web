import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import classes from './classes.module.scss'
import DynamicForm, {
  InputTypes,
  FieldProps,
} from 'components/organisms/DynamicForm/DynamicForm'
import { Control, FieldValues, Path } from 'react-hook-form'
import { ClassifierValueType } from 'types/classifierValues'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'

interface DetailsSectionProps<TFormValues extends FieldValues> {
  control: Control<TFormValues>
}

const DetailsSection = <TFormValues extends FieldValues>({
  control,
}: DetailsSectionProps<TFormValues>) => {
  const { t } = useTranslation()
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
        inputType: InputTypes.Selections,
        ariaLabel: t('label.order_type'),
        placeholder: t('placeholder.pick'),
        label: `${t('label.order_type')}*`,
        name: 'type_classifier_value_id' as Path<TFormValues>,
        className: classes.inputInternalPosition,
        options: projectTypeFilter,
        showSearch: true,
        rules: {
          required: true,
        },
      },
      // TODO: translation_domain info missing right now, this is based on dummydata
      {
        inputType: InputTypes.Selections,
        ariaLabel: t('label.translation_domain'),
        placeholder: t('placeholder.pick'),
        label: `${t('label.translation_domain')}*`,
        name: 'translation_domain' as Path<TFormValues>,
        className: classes.inputInternalPosition,
        options: domainValuesFilter,
        showSearch: true,
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
      },
      {
        inputType: InputTypes.DateTime,
        ariaLabel: t('label.deadline'),
        placeholder: t('placeholder.date'),
        label: `${t('label.deadline')}*`,
        className: classes.customInternalClass,
        name: 'deadline_at' as Path<TFormValues>,
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
        // TODO: need to add textarea option for Text input for this
        // isTextarea: true,
      },
      {
        inputType: InputTypes.Text,
        ariaLabel: t('label.reference_number'),
        placeholder: t('placeholder.write_here'),
        label: `${t('label.reference_number')}`,
        name: 'reference_number' as Path<TFormValues>,
        className: classes.inputInternalPosition,
      },
      {
        inputType: InputTypes.Selections,
        ariaLabel: t('label.source_language'),
        placeholder: t('placeholder.pick'),
        label: `${t('label.source_language')}*`,
        name: 'src_lang' as Path<TFormValues>,
        className: classes.inputInternalPosition,
        options: languageFilters,
        showSearch: true,
        rules: {
          required: true,
        },
      },
      {
        inputType: InputTypes.Selections,
        ariaLabel: t('label.destination_language'),
        placeholder: t('placeholder.pick'),
        label: `${t('label.destination_language')}*`,
        name: 'dst_lang' as Path<TFormValues>,
        className: classes.inputInternalPosition,
        options: languageFilters,
        showSearch: true,
        multiple: true,
        buttons: true,
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
      t,
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

export default DetailsSection
