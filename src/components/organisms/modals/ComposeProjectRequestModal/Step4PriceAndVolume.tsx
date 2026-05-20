import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import ToggleInput from 'components/molecules/ToggleInput/ToggleInput'
import TextInput from 'components/molecules/TextInput/TextInput'
import SelectionControlsInput from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import { VolumeUnits } from 'types/assignments'
import { apiTypeToKey } from 'components/molecules/AddVolumeInput/AddVolumeInput'

import classes from './classes.module.scss'
import { ComposeProjectRequestDraft } from './types'

interface Step4Props {
  draft: ComposeProjectRequestDraft
  onChange: (patch: Partial<ComposeProjectRequestDraft>) => void
}

const VOLUME_UNIT_OPTIONS: VolumeUnits[] = [
  VolumeUnits.CHARACTERS,
  VolumeUnits.WORDS,
  VolumeUnits.PAGES,
  VolumeUnits.MINUTES,
  VolumeUnits.HOURS,
]

const parseOptionalNumber = (raw: string): number | undefined => {
  if (raw.trim() === '') return undefined
  const num = Number(raw.replace(',', '.'))
  return Number.isFinite(num) ? num : undefined
}

const Step4PriceAndVolume: FC<Step4Props> = ({ draft, onChange }) => {
  const { t } = useTranslation()

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({ bulk_volume: parseOptionalNumber(e.target.value) })
    },
    [onChange]
  )

  const handleUnitChange = useCallback(
    (value: string | string[]) => {
      const v = Array.isArray(value) ? value[0] : value
      onChange({ bulk_volume_unit: v ? (v as VolumeUnits) : undefined })
    },
    [onChange]
  )

  const handlePriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({ bulk_price: parseOptionalNumber(e.target.value) })
    },
    [onChange]
  )

  const unitOptions = VOLUME_UNIT_OPTIONS.map((unit) => ({
    label: t(`label.${apiTypeToKey(unit)}`),
    value: unit,
  }))

  return (
    <div className={classes.stepBody}>
      <h2 className={classes.stepTitle}>{t('requests.step4_title')}</h2>
      <div className={classes.stepHintGroup}>
        <p className={classes.stepHint}>{t('requests.step4_subtitle_1')}</p>
        <p className={classes.stepHint}>{t('requests.step4_subtitle_2')}</p>
      </div>

      <div className={classes.formRow}>
        <span className={classes.rowLabel}>
          {t('requests.show_price_label')}
        </span>
        <div className={classes.rowContent}>
          <ToggleInput
            name="include_price"
            label={t('requests.show_price_toggle')}
            value={draft.include_price}
            onChange={(next) => onChange({ include_price: next })}
            className={classes.modalToggle}
          />
        </div>
      </div>

      <div className={classes.formRow}>
        <span className={classes.rowLabel}>
          {t('requests.task_volume_label')}
        </span>
        <div className={classes.rowContent}>
          <div className={classes.dateTimeGroup}>
            <div className={classes.fieldStack}>
              <span className={classes.fieldLabel}>
                {t('requests.quantity')}
              </span>
              <TextInput
                name="bulk_volume_quantity"
                ariaLabel={t('requests.quantity')}
                type="number"
                min={0}
                value={
                  draft.bulk_volume !== undefined
                    ? String(draft.bulk_volume)
                    : ''
                }
                onChange={handleQuantityChange}
              />
            </div>
            <div className={classes.fieldStack}>
              <span className={classes.fieldLabel}>{t('requests.unit')}</span>
              <SelectionControlsInput
                name="bulk_volume_unit"
                ariaLabel={t('requests.unit')}
                placeholder={t('requests.unit')}
                value={draft.bulk_volume_unit ?? ''}
                options={unitOptions}
                onChange={handleUnitChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className={classes.formRow}>
        <span className={classes.rowLabel}>{t('requests.price_label')}</span>
        <div className={classes.rowContent}>
          <div className={classes.priceField}>
            <TextInput
              name="bulk_price"
              ariaLabel={t('requests.add_unit_value')}
              placeholder={t('requests.add_unit_value')}
              type="number"
              min={0}
              step="0.01"
              value={
                draft.bulk_price !== undefined ? String(draft.bulk_price) : ''
              }
              onChange={handlePriceChange}
            />
            <span className={classes.priceSuffix}>€</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Step4PriceAndVolume
