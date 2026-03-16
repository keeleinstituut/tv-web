import { FC, useState } from 'react'
import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useCalendarRole } from 'hooks/useCalendarRole'
import {
  useCreateCalendarOrder,
  useFetchCalendarLanguages,
  useFetchSlotMatching,
} from 'hooks/requests/useCalendar'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import AttachIcon from 'assets/icons/attach.svg?react'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import classes from './classes.module.scss'

type ServiceType = 'kaugtolge' | 'kontakttolge' | ''

const CalendarNewOrder: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isTPM } = useCalendarRole()
  const { mutate: createOrder, isPending: isCreating } = useCreateCalendarOrder()
  const { languages } = useFetchCalendarLanguages()
  const { classifierValues: domains } = useClassifierValuesFetch({
    type: ClassifierValueType.TranslationDomain,
  })

  const [languageId, setLanguageId] = useState('')
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [serviceType, setServiceType] = useState<ServiceType>('')
  const [location, setLocation] = useState('')
  const [tellija, setTellija] = useState('')
  const [viitenumber, setViitenumber] = useState('')
  const [domainId, setDomainId] = useState('')
  const [vendorId, setVendorId] = useState('')

  const startIso =
    date && startTime ? `${date}T${startTime}:00` : null
  const endIso = startIso
    ? dayjs(startIso).add(durationMinutes, 'minute').toISOString()
    : null

  const slotMatchingParams =
    isTPM && startIso && endIso && languageId
      ? { start_at: startIso, end_at: endIso, language_id: languageId }
      : null
  const { vendors } = useFetchSlotMatching(slotMatchingParams)

  const canSubmit = !!languageId && !!startIso && !!endIso && !isCreating

  const formatDurationMins = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h === 0) return `${m} min`
    if (m === 0) return `${h} ${h === 1 ? 'tund' : 'tundi'}`
    return `${h}h ${m}min`
  }

  const handleSubmit = () => {
    if (!languageId || !startIso || !endIso) return
    createOrder(
      {
        language_id: languageId,
        start_at: startIso,
        end_at: endIso,
        service_type: serviceType === 'kaugtolge' ? 'remote' : 'on-site',
        reference_number: viitenumber || undefined,
        location: serviceType === 'kontakttolge' ? location : undefined,
        meeting_link: serviceType === 'kaugtolge' ? location : undefined,
        client_institution_id: isTPM ? tellija || undefined : undefined,
        domain_id: domainId || undefined,
        vendor_id: isTPM ? vendorId || undefined : undefined,
      },
      {
        onSuccess: (data) => {
          navigate(`/calendar/${data.id}`)
          showNotification({
            type: NotificationTypes.Success,
            title: t('notification.announcement'),
            content: t('success.calendar_order_created'),
          })
        },
      }
    )
  }

  return (
    <div className={classes.page}>
      <h1 className={classes.title}>{t('calendar.add_order')}</h1>
      <div className={classes.card}>
        <div className={classes.form}>
          {/* Tellija — TPM only */}
          {isTPM && (
            <div className={classes.formGroup}>
              <label className={classes.label}>{t('calendar.client')}</label>
              <input
                className={classes.input}
                placeholder={t('calendar.enter_name')}
                value={tellija}
                onChange={(e) => setTellija(e.target.value)}
              />
            </div>
          )}

          {/* Viitenumber */}
          <div className={classes.formGroup}>
            <label className={classes.label}>
              {t('calendar.reference_number')}
            </label>
            <input
              className={classes.input}
              placeholder={t('calendar.enter_number')}
              value={viitenumber}
              onChange={(e) => setViitenumber(e.target.value)}
            />
          </div>

          {/* Keel */}
          <div className={classes.formGroup}>
            <label className={classes.label}>{t('calendar.language')}</label>
            <select
              className={classes.select}
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

          {/* Kuupäev */}
          <div className={classes.formGroup}>
            <label className={classes.label}>{t('calendar.date')}</label>
            <input
              type="date"
              className={classes.input}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Alates + Kestus */}
          <div className={classes.formRow}>
            <div className={classes.formGroup}>
              <label className={classes.label}>{t('calendar.from')}</label>
              <input
                type="time"
                className={classes.input}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className={classes.formGroup}>
              <label className={classes.label}>{t('calendar.duration')}</label>
              <div className={classes.durationStepper}>
                <button
                  className={classes.stepperBtn}
                  onClick={() =>
                    setDurationMinutes((v) => Math.max(30, v - 30))
                  }
                >
                  −
                </button>
                <span className={classes.stepperValue}>
                  {formatDurationMins(durationMinutes)}
                </span>
                <button
                  className={classes.stepperBtn}
                  onClick={() => setDurationMinutes((v) => v + 30)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Tellimuse tüüp */}
          <div className={classes.formGroup}>
            <label className={classes.label}>{t('calendar.order_type')}</label>
            <select
              className={classes.select}
              value={serviceType}
              onChange={(e) => {
                setServiceType(e.target.value as ServiceType)
                setLocation('')
              }}
            >
              <option value="" disabled>
                {t('calendar.select_type')}
              </option>
              <option value="kaugtolge">
                {t('calendar.service_type_remote')}
              </option>
              <option value="kontakttolge">
                {t('calendar.service_type_contact')}
              </option>
            </select>
          </div>

          {/* Asukoht / Koosoleku link */}
          {serviceType === 'kontakttolge' && (
            <div className={classes.formGroup}>
              <label className={classes.label}>{t('calendar.location')}</label>
              <input
                className={classes.input}
                placeholder={t('calendar.enter_address')}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}
          {serviceType === 'kaugtolge' && (
            <div className={classes.formGroup}>
              <label className={classes.label}>
                {t('calendar.meeting_link')}
              </label>
              <input
                className={classes.input}
                placeholder={t('calendar.enter_link')}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          )}

          {/* Valdkond */}
          <div className={classes.formGroup}>
            <label className={classes.label}>{t('calendar.domain')}</label>
            <select
              className={classes.select}
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

          {/* Teostaja — TPM only */}
          {isTPM && (
            <div className={classes.formGroup}>
              <label className={classes.label}>{t('calendar.translator')}</label>
              <select
                className={classes.select}
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
              >
                <option value="">{t('calendar.select_translator')}</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.institution_user.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Lisamaterjal */}
        <div className={classes.divider} />
        <div className={classes.sectionRow}>
          <div className={classes.sectionLabel}>
            <AttachIcon className={classes.sectionIcon} />
            <span>{t('calendar.attachments')}</span>
          </div>
          <button className={classes.sectionBtn}>
            {t('calendar.add_attachment')}
          </button>
        </div>

        {/* Kommentaarid */}
        <div className={classes.divider} />
        <div className={classes.sectionRow}>
          <div className={classes.sectionLabel}>
            <ChevronLeft className={classes.sectionChevron} />
            <span>{t('calendar.comments')}</span>
          </div>
          <button className={classes.sectionBtn}>
            {t('calendar.add_comment')}
          </button>
        </div>

        {/* Footer */}
        <div className={classes.footer}>
          <Button
            appearance={AppearanceTypes.Primary}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isCreating ? t('calendar.saving') : t('calendar.create_order')}
          </Button>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={() => navigate('/calendar')}
          >
            {t('calendar.cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CalendarNewOrder
