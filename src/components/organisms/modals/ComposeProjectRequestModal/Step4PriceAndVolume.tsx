import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import TextInput from 'components/molecules/TextInput/TextInput'
import SelectionControlsInput from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import { OutsourceRequestPriceMode } from 'types/outsourceRequests'

import classes from './classes.module.scss'
import { ComposeProjectRequestDraft } from './types'
import InlineVolumeEditor from './InlineVolumeEditor'

interface Step4Props {
  draft: ComposeProjectRequestDraft
  onChange: (patch: Partial<ComposeProjectRequestDraft>) => void
  assignmentId: string
  sub_project_id: string
}

const PRICE_MODE_OPTIONS = [
  OutsourceRequestPriceMode.PricelistBased,
  OutsourceRequestPriceMode.FixedPrice,
  OutsourceRequestPriceMode.AskForPrice,
]

const parseOptionalNumber = (raw: string): number | undefined => {
  if (raw.trim() === '') return undefined
  const num = Number(raw.replace(',', '.'))
  return Number.isFinite(num) ? num : undefined
}

const Step4PriceAndVolume: FC<Step4Props> = ({
  draft,
  onChange,
  assignmentId,
  sub_project_id,
}) => {
  const { t } = useTranslation()

  const handlePriceModeChange = useCallback(
    (value: string | string[]) => {
      const v = Array.isArray(value) ? value[0] : value
      onChange({
        price_mode:
          (v as OutsourceRequestPriceMode) ??
          OutsourceRequestPriceMode.PricelistBased,
        price: undefined,
      })
    },
    [onChange]
  )

  const handlePriceChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      onChange({ price: parseOptionalNumber(e.target.value) })
    },
    [onChange]
  )

  const priceModeOptions = PRICE_MODE_OPTIONS.map((mode) => ({
    label: t(`requests.price_mode.${mode}`),
    value: mode,
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
          {t('requests.price_mode_label')}
        </span>
        <div className={classes.rowContent}>
          <SelectionControlsInput
            name="price_mode"
            ariaLabel={t('requests.price_mode_label')}
            value={draft.price_mode}
            options={priceModeOptions}
            onChange={handlePriceModeChange}
          />
        </div>
      </div>

      {draft.price_mode === OutsourceRequestPriceMode.FixedPrice && (
        <div className={classes.formRow}>
          <span className={classes.rowLabel}>{t('requests.price_label')}</span>
          <div className={classes.rowContent}>
            <div className={classes.priceField}>
              <TextInput
                name="price"
                ariaLabel={t('requests.price_label')}
                type="number"
                min={0}
                step="0.01"
                value={draft.price !== undefined ? String(draft.price) : ''}
                onChange={handlePriceChange}
              />
              <span className={classes.priceSuffix}>€</span>
            </div>
          </div>
        </div>
      )}

      {draft.price_mode !== OutsourceRequestPriceMode.FixedPrice && (
        <div className={classes.formRow}>
          <span className={classes.rowLabel}>
            {t('requests.task_volume_label')}
          </span>
          <div className={classes.rowContent}>
            <InlineVolumeEditor
              assignmentId={assignmentId}
              sub_project_id={sub_project_id}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Step4PriceAndVolume
