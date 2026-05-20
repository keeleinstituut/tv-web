import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import ToggleInput from 'components/molecules/ToggleInput/ToggleInput'
import DatePickerInput from 'components/molecules/DatePickerInput/DatePickerInput'
import TimePickerInput from 'components/molecules/TimePickerInput/TimePickerInput'
import TextInput from 'components/molecules/TextInput/TextInput'
import SelectionControlsInput from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import {
  REACTION_TIME_OPTIONS,
  ReactionTimeMinutes,
} from 'types/outsourceRequests'

import classes from './classes.module.scss'
import { ComposeProjectRequestDraft } from './types'

dayjs.extend(customParseFormat)

const MAX_SPECIAL_INSTRUCTIONS = 1800

interface Step2Props {
  draft: ComposeProjectRequestDraft
  onChange: (patch: Partial<ComposeProjectRequestDraft>) => void
}

const parseIsoToParts = (iso?: string) => {
  if (!iso) return { date: '', time: '' }
  const d = dayjs(iso)
  if (!d.isValid()) return { date: '', time: '' }
  return { date: d.format('DD/MM/YYYY'), time: d.format('HH:mm') }
}

const composeIso = (date?: string, time?: string): string | undefined => {
  if (!date && !time) return undefined
  const datePart = date || dayjs().format('DD/MM/YYYY')
  const timePart = time || '00:00'
  const parsed = dayjs(`${datePart} ${timePart}`, 'DD/MM/YYYY HH:mm', true)
  if (!parsed.isValid()) return undefined
  return parsed.toISOString()
}

const Step2RequestConditions: FC<Step2Props> = ({ draft, onChange }) => {
  const { t } = useTranslation()

  const { date: deadlineDate, time: deadlineTime } = parseIsoToParts(
    draft.response_deadline_at
  )

  const handleDateChange = useCallback(
    (value: string) => {
      onChange({ response_deadline_at: composeIso(value, deadlineTime) })
    },
    [onChange, deadlineTime]
  )

  const handleTimeChange = useCallback(
    (value: string) => {
      onChange({ response_deadline_at: composeIso(deadlineDate, value) })
    },
    [onChange, deadlineDate]
  )

  const handleCascadeChange = useCallback(
    (next: boolean) => {
      onChange({
        cascade_mode: next,
        reaction_time_minutes: next
          ? (draft.reaction_time_minutes ?? 60)
          : undefined,
        response_deadline_at: next ? undefined : draft.response_deadline_at,
      })
    },
    [draft.reaction_time_minutes, draft.response_deadline_at, onChange]
  )

  const handleReactionTimeChange = useCallback(
    (value: string | string[]) => {
      const num = Number(Array.isArray(value) ? value[0] : value)
      onChange({ reaction_time_minutes: num as ReactionTimeMinutes })
    },
    [onChange]
  )

  const handleInstructionsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value.slice(0, MAX_SPECIAL_INSTRUCTIONS)
      onChange({ special_instructions: value })
    },
    [onChange]
  )

  const reactionTimeOptions = REACTION_TIME_OPTIONS.map((minutes) => ({
    label: t('requests.reaction_time_minutes', { count: minutes }),
    value: String(minutes),
  }))

  return (
    <div className={classes.stepBody}>
      <h2 className={classes.stepTitle}>{t('requests.wizard_step_2')}</h2>
      <p className={classes.stepHint}>{t('requests.step2_subtitle')}</p>

      <div className={classes.formRow}>
        <span className={classes.rowLabel}>
          {t('requests.cascade_mode_label')}
        </span>
        <div className={classes.rowContent}>
          <ToggleInput
            name="cascade_mode"
            label=""
            ariaLabel={t('requests.cascade_mode_label')}
            value={draft.cascade_mode}
            onChange={handleCascadeChange}
            className={classes.modalToggle}
          />
        </div>
      </div>

      {draft.cascade_mode ? (
        <div className={classes.formRow}>
          <span className={classes.rowLabel}>
            {t('requests.response_deadline')}
          </span>
          <div className={classes.rowContent}>
            <div className={classes.fieldStack}>
              <span className={classes.fieldLabel}>
                {t('requests.reaction_time_label')}
                <span className={classes.requiredMark}>*</span>
              </span>
              <div className={classes.reactionTimeSelect}>
                <SelectionControlsInput
                  name="reaction_time_minutes"
                  ariaLabel={t('requests.reaction_time_label')}
                  placeholder={t('requests.reaction_time')}
                  value={
                    draft.reaction_time_minutes !== undefined
                      ? String(draft.reaction_time_minutes)
                      : ''
                  }
                  options={reactionTimeOptions}
                  onChange={handleReactionTimeChange}
                  rules={{ required: true }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={classes.formRow}>
          <span className={classes.rowLabel}>
            {t('requests.response_deadline')}
          </span>
          <div className={classes.rowContent}>
            <div className={classes.dateTimeGroup}>
              <div className={classes.fieldStack}>
                <span className={classes.fieldLabel}>
                  {t('requests.deadline_date')}
                </span>
                <DatePickerInput
                  name="deadline_date"
                  ariaLabel={t('requests.deadline_date')}
                  placeholder="kk.pp.aaaa"
                  value={deadlineDate}
                  onChange={handleDateChange}
                />
              </div>
              <div className={classes.fieldStack}>
                <span className={classes.fieldLabel}>
                  {t('requests.deadline_time')}
                </span>
                <TimePickerInput
                  name="deadline_time"
                  ariaLabel={t('requests.deadline_time')}
                  value={deadlineTime}
                  onChange={handleTimeChange}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={classes.formRow}>
        <span className={classes.rowLabel}>
          {t('requests.special_instructions')}
        </span>
        <div className={classes.rowContent}>
          <div
            className={classNames(classes.fieldStack, classes.fieldStackWide)}
          >
            <span className={classes.fieldLabel}>
              {t('requests.special_instructions_label')}
            </span>
            <TextInput
              name="special_instructions"
              ariaLabel={t('requests.special_instructions_label')}
              placeholder={t('requests.special_instructions_label')}
              value={draft.special_instructions}
              onChange={handleInstructionsChange}
              isTextarea
              maxLength={MAX_SPECIAL_INSTRUCTIONS}
              className={classes.textareaField}
            />
          </div>
          <p className={classes.charCounter}>
            {t('requests.character_count', {
              count: draft.special_instructions.length,
            })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default Step2RequestConditions
