import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useForm, Controller } from 'react-hook-form'
import { includes } from 'lodash'
import Container from 'components/atoms/Container/Container'
import Button, { AppearanceTypes, SizeTypes } from 'components/molecules/Button/Button'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import {
  useFetchInstitutionMainLanguages,
  useSyncInstitutionMainLanguages,
} from 'hooks/requests/useInstitutions'
import {
  useFetchInstitutionSettings,
  useUpdateInstitutionSettings,
} from 'hooks/requests/useCalendar'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import { orderClassifierByLangPriority } from 'helpers'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'
import CalendarSelect from 'components/molecules/CalendarSelect/CalendarSelect'
import SmallTooltip from 'components/molecules/SmallTooltip/SmallTooltip'
import EditIcon from 'assets/icons/edit.svg?react'
import MultiSelectInput from './MultiSelectInput'
import classes from './classes.module.scss'

interface FormValues {
  languages: string[]
}

const BUFFER_OPTIONS = [0, 30, 60, 90, 120].map((val) => ({
  value: String(val),
  label: val === 30 ? '30 minutit (vaikimisi)' : `${val} minutit`,
}))

const DEFAULT_REACTION_TIME_HOURS = 0.5
const REACTION_TIME_STEP_HOURS = 0.25
const REACTION_TIME_MIN_HOURS = 0.25

const minutesToHours = (minutes: number) =>
  Math.round((minutes / 60) * 100) / 100
const hoursToMinutes = (hours: number) => Math.round(hours * 60)

const InstitutionSettingsManagement: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const canEdit = includes(userPrivileges, Privileges.EditInstitution)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingBuffer, setIsEditingBuffer] = useState(false)
  const [isEditingReactionTime, setIsEditingReactionTime] = useState(false)
  const [isEditingAutoAcceptance, setIsEditingAutoAcceptance] = useState(false)

  const { mainLanguages } = useFetchInstitutionMainLanguages()
  const { syncMainLanguages, isLoading } = useSyncInstitutionMainLanguages()

  const { settings } = useFetchInstitutionSettings()
  const { updateSettings, isLoading: isUpdatingSettings } =
    useUpdateInstitutionSettings()

  const [bufferBefore, setBufferBefore] = useState<number | null>(null)
  const [bufferAfter, setBufferAfter] = useState<number | null>(null)
  // Stored locally in HOURS; converted to/from minutes at the BE boundary.
  const [reactionTimeHours, setReactionTimeHours] = useState<string>('')
  // null = feature disabled (will send null to BE); string = enabled with day count
  const [verbalDays, setVerbalDays] = useState<string | null>(null)
  const [nonVerbalDays, setNonVerbalDays] = useState<string | null>(null)

  const effectiveBefore = bufferBefore ?? settings?.buffer_before_minutes ?? 30
  const effectiveAfter = bufferAfter ?? settings?.buffer_after_minutes ?? 30
  const storedReactionHours = minutesToHours(
    settings?.reaction_time_minutes ?? 30
  )
  const parsedReactionHours = parseFloat(reactionTimeHours.replace(',', '.'))
  const effectiveReactionHours = Number.isFinite(parsedReactionHours)
    ? parsedReactionHours
    : storedReactionHours

  const storedVerbalDays = settings?.verbal_auto_acceptance_threshold_days ?? null
  const storedNonVerbalDays = settings?.non_verbal_auto_acceptance_threshold_days ?? null
  const effectiveVerbalDays = isEditingAutoAcceptance
    ? verbalDays
    : storedVerbalDays !== null ? String(storedVerbalDays) : null
  const effectiveNonVerbalDays = isEditingAutoAcceptance
    ? nonVerbalDays
    : storedNonVerbalDays !== null ? String(storedNonVerbalDays) : null

  const { classifierValuesFilters: languageOptions = [] } =
    useClassifierValuesFetch(
      { type: ClassifierValueType.Language },
      orderClassifierByLangPriority
    )

  const currentLanguageIds = mainLanguages.map((l) => l.language_id)

  const { control, handleSubmit, reset } = useForm<FormValues>({
    values: { languages: currentLanguageIds },
  })

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        await syncMainLanguages(values)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.institution_settings_updated'),
        })
        setIsEditing(false)
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [syncMainLanguages, t]
  )

  const handleCancel = useCallback(() => {
    reset({ languages: currentLanguageIds })
    setIsEditing(false)
  }, [reset, currentLanguageIds])

  const handleBufferEdit = useCallback(() => {
    setBufferBefore(settings?.buffer_before_minutes ?? 30)
    setBufferAfter(settings?.buffer_after_minutes ?? 30)
    setIsEditingBuffer(true)
  }, [settings])

  const handleBufferCancel = useCallback(() => {
    setBufferBefore(null)
    setBufferAfter(null)
    setIsEditingBuffer(false)
  }, [])

  const handleBufferSave = useCallback(async () => {
    try {
      await updateSettings({
        reaction_time_minutes: settings?.reaction_time_minutes ?? 30,
        buffer_before_minutes: effectiveBefore,
        buffer_after_minutes: effectiveAfter,
        ...(settings?.default_project_type_id
          ? { default_project_type_id: settings.default_project_type_id }
          : {}),
      })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.institution_settings_updated'),
      })
      setBufferBefore(null)
      setBufferAfter(null)
      setIsEditingBuffer(false)
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [updateSettings, settings, effectiveBefore, effectiveAfter, t])

  const handleReactionTimeEdit = useCallback(() => {
    const initial = settings?.reaction_time_minutes
      ? minutesToHours(settings.reaction_time_minutes)
      : DEFAULT_REACTION_TIME_HOURS
    setReactionTimeHours(String(initial))
    setIsEditingReactionTime(true)
  }, [settings])

  const handleReactionTimeCancel = useCallback(() => {
    setReactionTimeHours('')
    setIsEditingReactionTime(false)
  }, [])

  const handleReactionTimeSave = useCallback(async () => {
    const hours = parseFloat(reactionTimeHours.replace(',', '.'))
    if (!Number.isFinite(hours) || hours < REACTION_TIME_MIN_HOURS) {
      showNotification({
        type: NotificationTypes.Error,
        title: t('notification.error'),
        content: t('institution_settings.reaction_time_invalid'),
      })
      return
    }
    try {
      await updateSettings({
        reaction_time_minutes: hoursToMinutes(hours),
        buffer_before_minutes: settings?.buffer_before_minutes ?? 30,
        buffer_after_minutes: settings?.buffer_after_minutes ?? 30,
        ...(settings?.default_project_type_id
          ? { default_project_type_id: settings.default_project_type_id }
          : {}),
      })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.institution_settings_updated'),
      })
      setReactionTimeHours('')
      setIsEditingReactionTime(false)
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [updateSettings, settings, reactionTimeHours, t])

  const handleAutoAcceptanceEdit = useCallback(() => {
    setVerbalDays(storedVerbalDays !== null ? String(storedVerbalDays) : null)
    setNonVerbalDays(storedNonVerbalDays !== null ? String(storedNonVerbalDays) : null)
    setIsEditingAutoAcceptance(true)
  }, [storedVerbalDays, storedNonVerbalDays])

  const handleAutoAcceptanceCancel = useCallback(() => {
    setVerbalDays(null)
    setNonVerbalDays(null)
    setIsEditingAutoAcceptance(false)
  }, [])

  const handleAutoAcceptanceSave = useCallback(async () => {
    const verbalParsed = verbalDays !== null ? parseInt(verbalDays, 10) : null
    const nonVerbalParsed = nonVerbalDays !== null ? parseInt(nonVerbalDays, 10) : null

    const isVerbalInvalid = verbalParsed !== null && (isNaN(verbalParsed) || verbalParsed < 1 || verbalParsed > 365)
    const isNonVerbalInvalid = nonVerbalParsed !== null && (isNaN(nonVerbalParsed) || nonVerbalParsed < 1 || nonVerbalParsed > 365)

    if (isVerbalInvalid || isNonVerbalInvalid) {
      showNotification({
        type: NotificationTypes.Error,
        title: t('notification.error'),
        content: t('institution_settings.threshold_invalid'),
      })
      return
    }

    try {
      await updateSettings({
        verbal_auto_acceptance_threshold_days: verbalParsed,
        non_verbal_auto_acceptance_threshold_days: nonVerbalParsed,
      })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.institution_settings_updated'),
      })
      setVerbalDays(null)
      setNonVerbalDays(null)
      setIsEditingAutoAcceptance(false)
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [updateSettings, settings, verbalDays, nonVerbalDays, t])

  return (
    <>
      <Container className={classes.container}>
        <div className={classes.header}>
          <h3 className={classes.title}>{t('institution_settings.title')}</h3>
          {isEditing ? (
            <div className={classes.actions}>
              <Button
                appearance={AppearanceTypes.Secondary}
                size={SizeTypes.S}
                onClick={handleCancel}
              >
                {t('button.cancel')}
              </Button>
              <Button
                size={SizeTypes.S}
                loading={isLoading}
                onClick={handleSubmit(onSubmit)}
              >
                {t('institution_settings.save_and_close')}
              </Button>
            </div>
          ) : canEdit ? (
            <Button
              appearance={AppearanceTypes.Text}
              size={SizeTypes.S}
              icon={EditIcon}
              onClick={() => setIsEditing(true)}
            >
              {t('button.change')}
            </Button>
          ) : null}
        </div>
        <p className={classes.description}>
          {t('institution_settings.description')}
        </p>
        <div className={classes.field}>
          <label className={classes.fieldLabel}>
            {t('institution_settings.calendar_languages')}
          </label>
          <Controller
            control={control}
            name="languages"
            render={({ field }) => (
              <MultiSelectInput
                options={languageOptions.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
                value={field.value}
                onChange={field.onChange}
                disabled={!isEditing}
              />
            )}
          />
        </div>
      </Container>

      <Container className={classes.container}>
        <div className={classes.header}>
          <h3 className={classes.title}>
            {t('institution_settings.time_rules_title')}
          </h3>
          {isEditingBuffer ? (
            <div className={classes.actions}>
              <Button
                appearance={AppearanceTypes.Secondary}
                size={SizeTypes.S}
                onClick={handleBufferCancel}
              >
                {t('button.cancel')}
              </Button>
              <Button
                size={SizeTypes.S}
                loading={isUpdatingSettings}
                onClick={handleBufferSave}
              >
                {t('institution_settings.save_and_close')}
              </Button>
            </div>
          ) : canEdit ? (
            <Button
              appearance={AppearanceTypes.Text}
              size={SizeTypes.S}
              icon={EditIcon}
              onClick={handleBufferEdit}
            >
              {t('button.change')}
            </Button>
          ) : null}
        </div>
        <p className={classes.description}>
          {t('institution_settings.time_rules_description')}
        </p>
        <div className={classes.bufferRow}>
          <div className={classes.field}>
            <label className={classes.fieldLabel}>
              {t('institution_settings.buffer_before')}
              <span className={classes.required}>*</span>
            </label>
            <CalendarSelect
              options={BUFFER_OPTIONS}
              value={String(effectiveBefore)}
              onChange={(v) => setBufferBefore(Number(v))}
              disabled={!isEditingBuffer}
            />
          </div>
          <div className={classes.field}>
            <label className={classes.fieldLabel}>
              {t('institution_settings.buffer_after')}
              <span className={classes.required}>*</span>
            </label>
            <CalendarSelect
              options={BUFFER_OPTIONS}
              value={String(effectiveAfter)}
              onChange={(v) => setBufferAfter(Number(v))}
              disabled={!isEditingBuffer}
            />
          </div>
        </div>
      </Container>

      <Container className={classes.container}>
        <div className={classes.header}>
          <div className={classes.titleWithTooltip}>
            <h3 className={classes.title}>
              {t('institution_settings.reaction_time_title')}
            </h3>
            <SmallTooltip
              tooltipContent={t('institution_settings.reaction_time_tooltip')}
              ariaLabel={t('institution_settings.reaction_time_title')}
            />
          </div>
          {isEditingReactionTime ? (
            <div className={classes.actions}>
              <Button
                appearance={AppearanceTypes.Secondary}
                size={SizeTypes.S}
                onClick={handleReactionTimeCancel}
              >
                {t('button.cancel')}
              </Button>
              <Button
                size={SizeTypes.S}
                loading={isUpdatingSettings}
                onClick={handleReactionTimeSave}
              >
                {t('institution_settings.save_and_close')}
              </Button>
            </div>
          ) : canEdit ? (
            <Button
              appearance={AppearanceTypes.Text}
              size={SizeTypes.S}
              icon={EditIcon}
              onClick={handleReactionTimeEdit}
            >
              {t('button.change')}
            </Button>
          ) : null}
        </div>
        <div className={classes.reactionField}>
          <div className={classes.field}>
            <label className={classes.fieldLabel}>
              {t('institution_settings.reaction_time_label')}
              <span className={classes.required}>*</span>
            </label>
            <div className={classes.reactionInputRow}>
              <input
                type="number"
                className={classes.reactionInput}
                value={
                  isEditingReactionTime
                    ? reactionTimeHours
                    : String(effectiveReactionHours)
                }
                min={REACTION_TIME_MIN_HOURS}
                step={REACTION_TIME_STEP_HOURS}
                disabled={!isEditingReactionTime}
                onChange={(e) => setReactionTimeHours(e.target.value)}
              />
              <span className={classes.reactionUnit}>
                {t('institution_settings.reaction_time_hours_suffix')}
              </span>
            </div>
          </div>
        </div>
      </Container>

      <Container className={classes.container}>
        <div className={classes.header}>
          <h3 className={classes.title}>
            {t('institution_settings.auto_acceptance_title')}
          </h3>
          {isEditingAutoAcceptance ? (
            <div className={classes.actions}>
              <Button
                appearance={AppearanceTypes.Secondary}
                size={SizeTypes.S}
                onClick={handleAutoAcceptanceCancel}
              >
                {t('button.cancel')}
              </Button>
              <Button
                size={SizeTypes.S}
                loading={isUpdatingSettings}
                onClick={handleAutoAcceptanceSave}
              >
                {t('institution_settings.save_and_close')}
              </Button>
            </div>
          ) : canEdit ? (
            <Button
              appearance={AppearanceTypes.Text}
              size={SizeTypes.S}
              icon={EditIcon}
              onClick={handleAutoAcceptanceEdit}
            >
              {t('button.change')}
            </Button>
          ) : null}
        </div>
        <p className={classes.description}>
          {t('institution_settings.auto_acceptance_description')}
        </p>
        <div className={classes.field}>
          <label className={classes.checkboxRow}>
            <input
              type="checkbox"
              checked={effectiveVerbalDays !== null}
              disabled={!isEditingAutoAcceptance}
              onChange={(e) => setVerbalDays(e.target.checked ? '7' : null)}
            />
            <span className={classes.fieldLabel}>
              {t('institution_settings.verbal_threshold_label')}
            </span>
          </label>
          {effectiveVerbalDays !== null && (
            <div className={classes.reactionInputRow}>
              <input
                type="number"
                className={classes.reactionInput}
                value={effectiveVerbalDays}
                min={1}
                max={365}
                step={1}
                disabled={!isEditingAutoAcceptance}
                onChange={(e) => setVerbalDays(e.target.value)}
              />
              <span className={classes.reactionUnit}>
                {t('institution_settings.days_suffix')}
              </span>
            </div>
          )}
        </div>
        <div className={classes.field}>
          <label className={classes.checkboxRow}>
            <input
              type="checkbox"
              checked={effectiveNonVerbalDays !== null}
              disabled={!isEditingAutoAcceptance}
              onChange={(e) => setNonVerbalDays(e.target.checked ? '14' : null)}
            />
            <span className={classes.fieldLabel}>
              {t('institution_settings.non_verbal_threshold_label')}
            </span>
          </label>
          {effectiveNonVerbalDays !== null && (
            <div className={classes.reactionInputRow}>
              <input
                type="number"
                className={classes.reactionInput}
                value={effectiveNonVerbalDays}
                min={1}
                max={365}
                step={1}
                disabled={!isEditingAutoAcceptance}
                onChange={(e) => setNonVerbalDays(e.target.value)}
              />
              <span className={classes.reactionUnit}>
                {t('institution_settings.days_suffix')}
              </span>
            </div>
          )}
        </div>
      </Container>
    </>
  )
}

export default InstitutionSettingsManagement
