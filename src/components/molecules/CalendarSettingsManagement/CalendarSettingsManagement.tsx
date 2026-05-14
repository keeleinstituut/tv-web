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
  useFetchCalendarSettings,
  useUpdateCalendarSettings,
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

const REACTION_TIME_OPTIONS = [15, 30, 60, 90, 120].map((val) => ({
  value: String(val),
  label: val === 30 ? '30 minutit (vaikimisi)' : `${val} minutit`,
}))

const CalendarSettingsManagement: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const canEdit = includes(userPrivileges, Privileges.EditInstitution)
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingBuffer, setIsEditingBuffer] = useState(false)
  const [isEditingReactionTime, setIsEditingReactionTime] = useState(false)

  const { mainLanguages } = useFetchInstitutionMainLanguages()
  const { syncMainLanguages, isLoading } = useSyncInstitutionMainLanguages()

  const { settings } = useFetchCalendarSettings()
  const { updateSettings, isLoading: isUpdatingSettings } =
    useUpdateCalendarSettings()

  const [bufferBefore, setBufferBefore] = useState<number | null>(null)
  const [bufferAfter, setBufferAfter] = useState<number | null>(null)
  const [reactionTime, setReactionTime] = useState<number | null>(null)

  const effectiveBefore = bufferBefore ?? settings?.buffer_before_minutes ?? 30
  const effectiveAfter = bufferAfter ?? settings?.buffer_after_minutes ?? 30
  const effectiveReactionTime =
    reactionTime ?? settings?.reaction_time_minutes ?? 30

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
          content: t('success.calendar_settings_updated'),
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
        content: t('success.calendar_settings_updated'),
      })
      setBufferBefore(null)
      setBufferAfter(null)
      setIsEditingBuffer(false)
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [updateSettings, settings, effectiveBefore, effectiveAfter, t])

  const handleReactionTimeEdit = useCallback(() => {
    setReactionTime(settings?.reaction_time_minutes ?? 30)
    setIsEditingReactionTime(true)
  }, [settings])

  const handleReactionTimeCancel = useCallback(() => {
    setReactionTime(null)
    setIsEditingReactionTime(false)
  }, [])

  const handleReactionTimeSave = useCallback(async () => {
    try {
      await updateSettings({
        reaction_time_minutes: effectiveReactionTime,
        buffer_before_minutes: settings?.buffer_before_minutes ?? 30,
        buffer_after_minutes: settings?.buffer_after_minutes ?? 30,
        ...(settings?.default_project_type_id
          ? { default_project_type_id: settings.default_project_type_id }
          : {}),
      })
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.calendar_settings_updated'),
      })
      setReactionTime(null)
      setIsEditingReactionTime(false)
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [updateSettings, settings, effectiveReactionTime, t])

  return (
    <>
      <Container className={classes.container}>
        <div className={classes.header}>
          <h3 className={classes.title}>{t('calendar_settings.title')}</h3>
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
                {t('calendar_settings.save_and_close')}
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
          {t('calendar_settings.description')}
        </p>
        <div className={classes.field}>
          <label className={classes.fieldLabel}>
            {t('calendar_settings.calendar_languages')}
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
            {t('calendar_settings.time_rules_title')}
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
                {t('calendar_settings.save_and_close')}
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
          {t('calendar_settings.time_rules_description')}
        </p>
        <div className={classes.bufferRow}>
          <div className={classes.field}>
            <label className={classes.fieldLabel}>
              {t('calendar_settings.buffer_before')}
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
              {t('calendar_settings.buffer_after')}
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
              {t('calendar_settings.reaction_time_title')}
            </h3>
            <SmallTooltip
              tooltipContent={t('calendar_settings.reaction_time_tooltip')}
              ariaLabel={t('calendar_settings.reaction_time_title')}
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
                {t('calendar_settings.save_and_close')}
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
              {t('calendar_settings.reaction_time_label')}
              <span className={classes.required}>*</span>
            </label>
            <CalendarSelect
              options={REACTION_TIME_OPTIONS}
              value={String(effectiveReactionTime)}
              onChange={(v) => setReactionTime(Number(v))}
              disabled={!isEditingReactionTime}
            />
          </div>
        </div>
      </Container>
    </>
  )
}

export default CalendarSettingsManagement
