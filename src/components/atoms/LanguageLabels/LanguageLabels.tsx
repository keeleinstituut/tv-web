import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { find, isUndefined, map } from 'lodash'
import { Control, useWatch } from 'react-hook-form'
import { FormValues } from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'
import classNames from 'classnames'

import classes from './classes.module.scss'

type LanguageLabelsProps = {
  srcLanguageValue?: string
  dstLanguageValues?: string[]
  control: Control<FormValues>
  languageOptions?: { label: string; value: string }[]
  className?: string
}

const LanguageLabels: FC<LanguageLabelsProps> = ({
  control,
  languageOptions,
  srcLanguageValue,
  dstLanguageValues,
  className,
}) => {
  const { t } = useTranslation()

  const findLabelByValue = (
    languageIds: string[],
    languageOptions: { label: string; value: string }[] | undefined
  ) => {
    return map(languageIds, (dstLanguage) => {
      const language = find(languageOptions, { value: dstLanguage }) as
        | { value: string; label: string }
        | undefined
      return language ? language.label : ''
    })
  }

  const sourceLanguageLabels = findLabelByValue(
    [
      useWatch({
        control,
        name: 'new.src_lang_classifier_value_id',
      }),
    ] as unknown as string[],
    languageOptions
  )

  const destinationLanguageLabels = findLabelByValue(
    useWatch({
      control,
      name: 'dst_lang_classifier_value_id',
    }) as unknown as string[],
    languageOptions
  )

  const language = useWatch({
    control,
  })

  console.log('language', language.new?.src_lang_classifier_value_id)
  console.log('sourceLanguageLabels', sourceLanguageLabels)

  const srcLanguageLabel = srcLanguageValue
    ? srcLanguageValue
    : sourceLanguageLabels
  const dstLanguageLabels = dstLanguageValues
    ? dstLanguageValues
    : destinationLanguageLabels

  return (
    <div className={classNames(className)}>
      <div hidden={!srcLanguageLabel} className={classes.languageContianer}>
        <p className={classes.sourceLanguage}>{`${t(
          'vendors.source_language'
        )}*`}</p>
        <p
          className={
            !isUndefined(srcLanguageLabel?.[0]) ? classes.languageTag : ''
          }
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
              !isUndefined(dstLanguageLabels?.[0]) ? classes.languageTag : ''
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
