import { useTranslation } from 'react-i18next'
import { find, isEmpty, map } from 'lodash'
import { Control, FieldValues, useWatch } from 'react-hook-form'
import classNames from 'classnames'

import classes from './classes.module.scss'

type LanguageLabelsProps<TFormValues extends FieldValues> = {
  srcLanguageValue?: string
  dstLanguageValues?: string[]
  control: Control<TFormValues>
  languageOptions?: { label: string; value: string }[]
  className?: string
}

function LanguageLabels<TFormValues extends FieldValues>({
  control,
  languageOptions,
  srcLanguageValue,
  dstLanguageValues,
  className,
}: LanguageLabelsProps<TFormValues>) {
  const { t } = useTranslation()

  const findLabelByValue = (
    languageIds: string[],
    languageOptions: { label: string; value: string }[] | undefined
  ) => {
    return map(languageIds, (languageValue) => {
      const language = find(languageOptions, { value: languageValue }) as
        | { value: string; label: string }
        | undefined
      return language ? language.label : ''
    })
  }

  const formValues = useWatch({
    control,
  }).new

  const selectedSrcLanguageId =
    srcLanguageValue || formValues?.src_lang_classifier_value_id?.id

  const selectedDstLanguageIds = isEmpty(
    formValues?.dst_lang_classifier_value_id?.id
  )
    ? dstLanguageValues
    : formValues?.dst_lang_classifier_value_id?.id

  const srcValue = findLabelByValue(
    [selectedSrcLanguageId] as unknown as string[],
    languageOptions
  )

  const dstValues = findLabelByValue(
    selectedDstLanguageIds as unknown as string[],
    languageOptions
  )

  const srcLanguageLabel = srcValue
  const dstLanguageLabels = dstValues

  return (
    <div className={classNames(className)}>
      <div hidden={!srcLanguageLabel} className={classes.languageContianer}>
        <p className={classes.sourceLanguage}>{`${t(
          'vendors.source_language'
        )}*`}</p>
        <p
          className={!isEmpty(srcLanguageLabel?.[0]) ? classes.languageTag : ''}
        >
          {srcLanguageLabel}
        </p>
      </div>
      <div hidden={!dstLanguageLabels} className={classes.languageContianer}>
        <p className={classes.destinationLanguage}>
          {`${t('vendors.destination_language')}*`}
        </p>
        {map(dstLanguageLabels, (label, index) => (
          <p
            key={index}
            className={
              !isEmpty(dstLanguageLabels?.[0]) ? classes.languageTag : ''
            }
          >
            {label}
          </p>
        ))}
      </div>
    </div>
  )
}

export default LanguageLabels
