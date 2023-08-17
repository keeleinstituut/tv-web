import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { find, map } from 'lodash'
import { useWatch } from 'react-hook-form'
import { VendorPriceListSecondStepProps } from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'

import classes from './classes.module.scss'

type LanguageLabelsProps = Omit<
  VendorPriceListSecondStepProps,
  'skillsFormFields'
>

const LanguageLabels: FC<LanguageLabelsProps> = ({
  control,
  languageOptions,
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

  if (!sourceLanguageLabel) return null

  return (
    <>
      <div className={classes.languageContianer}>
        <p className={classes.sourceLanguage}>{`${t(
          'vendors.source_language'
        )}*`}</p>
        <p className={classes.languageTag}>{sourceLanguageLabel}</p>
      </div>
      <div className={classes.languageContianer}>
        <p className={classes.destinationLanguage}>
          {`${t('vendors.destination_language')}*`}
        </p>
        {map(destinationLanguageLabels, (label, index) => (
          <p key={index} className={classes.languageTag}>
            {label}
          </p>
        ))}
      </div>
    </>
  )
}

export default LanguageLabels
