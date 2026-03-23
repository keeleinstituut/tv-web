import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import {
  useFetchCalendarLanguages,
  useFetchSlotMatching,
} from 'hooks/requests/useCalendar'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import classes from './mobile.module.scss'

const TOTAL_STEPS = 4

const DURATION_OPTIONS = [
  { value: 30, label: 'calendar.up_to_30min' },
  { value: 60, label: 'calendar.up_to_1h' },
  { value: 90, label: 'calendar.up_to_1h30min' },
  { value: 120, label: 'calendar.up_to_2h' },
  { value: 150, label: 'calendar.up_to_2h30min' },
  { value: 180, label: 'calendar.up_to_3h' },
  { value: 240, label: 'calendar.up_to_4h' },
  { value: 300, label: 'calendar.up_to_5h' },
]

interface Props {
  isTPM: boolean
  languageId: string
  setLanguageId: (v: string) => void
  selectedDate: string
  setSelectedDate: (v: string) => void
  startTimeInput: string
  setStartTimeInput: (v: string) => void
  durationMinutes: number
  setDurationMinutes: (v: number) => void
  serviceType: 'remote' | 'on-site'
  setServiceType: (v: 'remote' | 'on-site') => void
  address: string
  setAddress: (v: string) => void
  clientInstitutionId: string
  setClientInstitutionId: (v: string) => void
  referenceNumber: string
  setReferenceNumber: (v: string) => void
  domainId: string
  setDomainId: (v: string) => void
  vendorId: string
  setVendorId: (v: string) => void
  onSubmit: () => void
  onCancel: () => void
  isCreating: boolean
  createdAt: string | null
  createdOrderId: string | null
  onBackToCalendar: () => void
}

const CalendarMobileWizard: FC<Props> = ({
  isTPM,
  languageId,
  setLanguageId,
  selectedDate,
  setSelectedDate,
  startTimeInput,
  setStartTimeInput,
  durationMinutes,
  setDurationMinutes,
  serviceType,
  setServiceType,
  address,
  setAddress,
  clientInstitutionId,
  setClientInstitutionId,
  referenceNumber,
  setReferenceNumber,
  domainId,
  setDomainId,
  vendorId,
  setVendorId,
  onSubmit,
  onCancel,
  isCreating,
  createdAt,
  createdOrderId,
  onBackToCalendar,
}) => {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [commentText, setCommentText] = useState('')
  const [addingComment, setAddingComment] = useState(false)

  const { languages } = useFetchCalendarLanguages()
  const { classifierValues: domains } = useClassifierValuesFetch({
    type: ClassifierValueType.TranslationDomain,
  })

  const startIso = selectedDate && startTimeInput ? `${selectedDate}T${startTimeInput}:00` : null
  const endIso = startIso
    ? dayjs(startIso).add(durationMinutes, 'minute').toISOString()
    : null

  const slotMatchingParams =
    isTPM && startIso && endIso && languageId
      ? { start_at: startIso, end_at: endIso, language_id: languageId }
      : null
  const { vendors } = useFetchSlotMatching(slotMatchingParams)

  const step1Valid = !!languageId && !!selectedDate && !!startTimeInput

  // ─── Success screen ───────────────────────────────────────────────────────

  if (createdAt) {
    return (
      <div className={classes.wizard}>
        <div className={classes.success}>
          <h1 className={classes.successTitle}>
            {t('calendar.order_submitted_title')}
          </h1>
          <p className={classes.successDate}>
            {t('calendar.created_at_label')}{' '}
            {dayjs(createdAt).format('DD.MM.YYYY [kell] HH:mm')}
          </p>

          <div className={classes.statusRow}>
            <span className={classes.statusLabel}>{t('calendar.status')}</span>
            <span className={classes.statusBadge}>
              {t('calendar.status_pending')}
            </span>
          </div>

          <div className={classes.whatNext}>
            <h3 className={classes.whatNextTitle}>{t('calendar.what_next')}</h3>
            <p className={classes.whatNextText}>
              {t('calendar.what_next_text')}
            </p>
          </div>

          <Button
            appearance={AppearanceTypes.Primary}
            onClick={onBackToCalendar}
            className={classes.successBtn}
          >
            {t('calendar.back_to_calendar')}
          </Button>
        </div>
      </div>
    )
  }

  // ─── Progress bar ─────────────────────────────────────────────────────────

  const renderProgress = () => (
    <div className={classes.progress}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`${classes.progressSegment} ${i < step ? classes.progressSegmentFilled : ''}`}
        />
      ))}
    </div>
  )

  // ─── Step header ──────────────────────────────────────────────────────────

  const STEP_TITLES = [
    t('calendar.step_basic_info'),
    t('calendar.order_details_title'),
    t('calendar.comments'),
    t('calendar.files_and_links'),
  ]

  const renderStepHeader = () => (
    <div className={classes.stepHeader}>
      <div className={classes.stepCircle}>{step}</div>
      <h2 className={classes.stepTitle}>{STEP_TITLES[step - 1]}</h2>
    </div>
  )

  // ─── Step 1: Basic info ───────────────────────────────────────────────────

  const renderStep1 = () => (
    <div className={classes.stepContent}>
      <p className={classes.requiredNotice}>
        {t('calendar.required_notice')}
      </p>

      {isTPM && (
        <div className={classes.field}>
          <label className={classes.fieldLabel}>{t('calendar.client')}</label>
          <input
            className={classes.fieldInput}
            value={clientInstitutionId}
            onChange={(e) => setClientInstitutionId(e.target.value)}
            placeholder={t('calendar.enter_name')}
          />
        </div>
      )}

      <div className={classes.field}>
        <label className={classes.fieldLabel}>{t('calendar.reference_number')}</label>
        <input
          className={classes.fieldInput}
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
          placeholder={t('calendar.enter_number')}
        />
      </div>

      <div className={classes.field}>
        <label className={classes.fieldLabel}>{t('calendar.language')} *</label>
        <select
          className={classes.fieldSelect}
          value={languageId}
          onChange={(e) => {
            setLanguageId(e.target.value)
            setVendorId('')
          }}
        >
          <option value="" disabled>
            {t('calendar.select_language')}
          </option>
          {languages.map((lang) => (
            <option key={lang.language.id} value={lang.language.id}>
              {lang.language.name}
            </option>
          ))}
        </select>
      </div>

      <div className={classes.field}>
        <label className={classes.fieldLabel}>{t('calendar.date_and_start_time')} *</label>
        <div className={classes.timeRow}>
          <input
            type="date"
            className={classes.fieldInput}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <input
            type="time"
            className={classes.fieldInput}
            value={startTimeInput}
            onChange={(e) => setStartTimeInput(e.target.value)}
          />
        </div>
      </div>

      <div className={classes.field}>
        <label className={classes.fieldLabel}>{t('calendar.duration')} *</label>
        <select
          className={classes.fieldSelect}
          value={durationMinutes}
          onChange={(e) => setDurationMinutes(Number(e.target.value))}
        >
          {DURATION_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {t(label as never)}
            </option>
          ))}
        </select>
      </div>

      {isTPM && (
        <div className={classes.field}>
          <label className={classes.fieldLabel}>{t('calendar.translator')} *</label>
          <select
            className={classes.fieldSelect}
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
          >
            <option value="">{t('calendar.select_translator')}</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )

  // ─── Step 2: Order details ────────────────────────────────────────────────

  const renderStep2 = () => (
    <div className={classes.stepContent}>
      <p className={classes.requiredNotice}>
        {t('calendar.required_notice')}
      </p>

      <div className={classes.field}>
        <label className={classes.fieldLabel}>{t('calendar.order_way')} *</label>
        <div className={classes.serviceToggle}>
          <button
            type="button"
            className={`${classes.serviceOption} ${serviceType === 'on-site' ? classes.serviceOptionActive : ''}`}
            onClick={() => {
              setServiceType('on-site')
              setAddress('')
            }}
          >
            {t('calendar.service_type_contact')}
          </button>
          <button
            type="button"
            className={`${classes.serviceOption} ${serviceType === 'remote' ? classes.serviceOptionActive : ''}`}
            onClick={() => {
              setServiceType('remote')
              setAddress('')
            }}
          >
            {t('calendar.service_type_remote')}
          </button>
        </div>
      </div>

      <div className={classes.field}>
        <label className={classes.fieldLabel}>
          {serviceType === 'on-site'
            ? t('calendar.location')
            : t('calendar.meeting_link')}
          {' '}*
        </label>
        <input
          className={classes.fieldInput}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder={
            serviceType === 'on-site'
              ? t('calendar.enter_address')
              : t('calendar.enter_link')
          }
        />
      </div>

      <div className={classes.field}>
        <label className={classes.fieldLabel}>{t('calendar.domain')}</label>
        <select
          className={classes.fieldSelect}
          value={domainId}
          onChange={(e) => setDomainId(e.target.value)}
        >
          <option value="">{t('calendar.select_domain')}</option>
          {(domains ?? []).map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )

  // ─── Step 3: Comments ─────────────────────────────────────────────────────

  const renderStep3 = () => (
    <div className={classes.stepContent}>
      {addingComment ? (
        <>
          <textarea
            className={classes.commentTextarea}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t('calendar.write_text')}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              appearance={AppearanceTypes.Primary}
              disabled={!commentText.trim()}
              onClick={() => setAddingComment(false)}
            >
              {t('calendar.save')}
            </Button>
            <Button
              appearance={AppearanceTypes.Secondary}
              onClick={() => {
                setAddingComment(false)
                setCommentText('')
              }}
            >
              {t('calendar.cancel')}
            </Button>
          </div>
        </>
      ) : (
        <>
          {commentText && (
            <div className={classes.comment}>
              <span className={classes.commentText}>{commentText}</span>
            </div>
          )}
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={() => setAddingComment(true)}
          >
            {t('calendar.add_comment_btn')}
          </Button>
        </>
      )}
    </div>
  )

  // ─── Step 4: Files ────────────────────────────────────────────────────────

  const renderStep4 = () => (
    <div className={classes.stepContent}>
      <p className={classes.emptyFiles}>{t('calendar.no_files_msg')}</p>
    </div>
  )

  const renderStepContent = () => {
    if (step === 1) return renderStep1()
    if (step === 2) return renderStep2()
    if (step === 3) return renderStep3()
    return renderStep4()
  }

  const isLastStep = step === TOTAL_STEPS

  return (
    <div className={classes.wizard}>
      {renderProgress()}
      {renderStepHeader()}
      {renderStepContent()}

      <div className={classes.footer}>
        <Button
          appearance={AppearanceTypes.Secondary}
          className={classes.footerBtn}
          onClick={onCancel}
        >
          {t('calendar.cancel')}
        </Button>
        {isLastStep ? (
          <Button
            appearance={AppearanceTypes.Primary}
            className={classes.footerBtn}
            onClick={onSubmit}
            disabled={!step1Valid || isCreating}
          >
            {isCreating ? t('calendar.saving') : t('calendar.create_order')}
          </Button>
        ) : (
          <Button
            appearance={AppearanceTypes.Primary}
            className={classes.footerBtn}
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 1 && !step1Valid}
          >
            {t('calendar.next')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default CalendarMobileWizard
