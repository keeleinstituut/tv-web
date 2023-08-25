import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { find, isUndefined, map } from 'lodash'
import { Control, useWatch } from 'react-hook-form'
import { FormValues } from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'

import classes from './classes.module.scss'

type LanguageLabelsProps = {
  srcLanguageValue?: string
  dstLanguageValues?: string[]
  control: Control<FormValues>
  languageOptions?: { label: string; value: string }[]
}

const LanguageLabels: FC<LanguageLabelsProps> = ({
  control,
  languageOptions,
  srcLanguageValue,
  dstLanguageValues,
}) => {
  const { t } = useTranslation()

  const findLabelByValue = (values: string[] | string | undefined) => {
    const valueArray = Array.isArray(values) ? values : [values]
    return map(valueArray, (value) => find(languageOptions, { value })?.label)
  }

  const sourceLanguageLabel = findLabelByValue(
    useWatch({ control, name: 'src_lang_classifier_value_id' })
  )
  const destinationLanguageLabels = findLabelByValue(
    useWatch({ control, name: 'dst_lang_classifier_value_id' })
  )

  const srcLanguageLabel = srcLanguageValue
    ? srcLanguageValue
    : sourceLanguageLabel

  const dstLanguageLabels = dstLanguageValues
    ? dstLanguageValues
    : destinationLanguageLabels

  if (!srcLanguageLabel || !dstLanguageLabels) return null

  return (
    <>
      <div className={classes.languageContianer}>
        <p className={classes.sourceLanguage}>{`${t(
          'vendors.source_language'
        )}*`}</p>
        <p
          className={
            !isUndefined(srcLanguageLabel[0]) ? classes.languageTag : ''
          }
        >
          {srcLanguageLabel}
        </p>
      </div>
      <div className={classes.languageContianer}>
        <p className={classes.destinationLanguage}>
          {`${t('vendors.destination_language')}*`}
        </p>
        {map(dstLanguageLabels, (label, index) => (
          <p
            key={index}
            className={
              !isUndefined(dstLanguageLabels[0]) ? classes.languageTag : ''
            }
          >
            {label}
          </p>
        ))}
      </div>
    </>
  )
}

export default LanguageLabels
