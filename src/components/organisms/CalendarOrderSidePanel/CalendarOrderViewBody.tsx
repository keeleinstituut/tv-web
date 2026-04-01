import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { ServiceType } from 'types/calendar'
import { useFetchInfiniteProjectPerson } from 'hooks/requests/useUsers'
import { calendarBookingStatusLabelKey } from 'helpers/calendarBookingStatus'
import { useCalendarRole } from 'hooks/useCalendarRole'
import MultiSelect from 'components/molecules/MultiSelect/MultiSelect'
import DurationStepper from './DurationStepper'
import SlotMetaSection from './SlotMetaSection'
import OrderServiceLocationReadonly from './OrderServiceLocationReadonly'
import OrderActionBar from './OrderActionBar'
import OrderStatusBanners from './OrderStatusBanners'
import OrderAttachments from './OrderAttachments'
import OrderComments from './OrderComments'
import { useSidePanel } from './SidePanelContext'
import classes from './classes.module.scss'

const CalendarOrderViewBody: FC = () => {
  const { t } = useTranslation()
  const {
    language,
    slot,
    date,
    startTime,
    duration,
    isEditing,
    isCancelled,
    durationMinutes,
    setDurationMinutes: onSetDurationMinutes,
    referenceNumber,
    setReferenceNumber: onSetReferenceNumber,
    serviceType,
    setServiceType: onSetServiceType,
    location,
    setLocation: onSetLocation,
    selectedDate,
    setSelectedDate: onSetSelectedDate,
    startTimeInput,
    setStartTimeInput: onSetStartTimeInput,
    clientInstitutionId,
    setClientInstitutionId: onSetClientInstitutionId,
    domainIds,
    setDomainIds: onSetDomainIds,
    vendorId,
    vendorLocked,
    setVendorId: onSetVendorId,
    vendorName,
    isTPM,
    domains,
    vendors,
    order,
    isMetaOpen,
    setIsMetaOpen: onSetIsMetaOpen,
  } = useSidePanel()
  const { isTranslator } = useCalendarRole()

  const { users: clients } = useFetchInfiniteProjectPerson(
    undefined,
    'client',
    isTPM && isEditing
  )

  const assignment = slot?.assignment
  const bookingStatusRole = isTPM
    ? 'tpm'
    : isTranslator
      ? 'translator'
      : 'client'
  const bookingStatusKey = calendarBookingStatusLabelKey(
    order?.status ?? assignment?.project_status ?? null,
    order?.sub_project_status ?? assignment?.sub_project?.status ?? null,
    bookingStatusRole
  )
  const hasScheduledCancelAt =
    typeof order?.cancel_at === 'string' && order.cancel_at.trim().length > 0

  return (
    <>
      <OrderActionBar />
      <OrderStatusBanners />

      <div className={classes.form}>
        {/* Status badge */}
        <div className={classes.statusBadgeGrey}>
          {hasScheduledCancelAt
            ? t('calendar.status_cancelling')
            : isTPM && isCancelled
              ? t('calendar.status_cancelled')
              : (t(bookingStatusKey as never) as string)}
        </div>

        {isEditing && (
          <p className={classes.requiredNotice}>
            {t('calendar.required_fields')}
          </p>
        )}

        {/* Tellija — TPM only */}
        {isTPM &&
          (isEditing ? (
            <div className={classes.formGroup}>
              <label className={classes.label}>
                {t('calendar.client')}
                <span className={classes.requiredMark}>*</span>
              </label>
              <select
                className={classes.select}
                value={clientInstitutionId}
                onChange={(e) => onSetClientInstitutionId(e.target.value)}
              >
                <option value="">{t('calendar.select_client')}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {[c.user.forename, c.user.surname]
                      .filter(Boolean)
                      .join(' ')}
                  </option>
                ))}
              </select>
            </div>
          ) : assignment?.client ? (
            <div className={classes.formGroup}>
              <span className={classes.label}>{t('calendar.client')}</span>
              <span className={classes.readValue}>
                {assignment.client.name}
              </span>
            </div>
          ) : null)}

        {/* Viitenumber */}
        {isEditing ? (
          <div className={classes.formGroup}>
            <label className={classes.label}>
              {t('calendar.reference_number')}
              <span className={classes.requiredMark}>*</span>
            </label>
            <input
              className={classes.input}
              value={referenceNumber}
              onChange={(e) => onSetReferenceNumber(e.target.value)}
            />
          </div>
        ) : assignment?.reference_number ? (
          <div className={classes.formGroup}>
            <span className={classes.label}>
              {t('calendar.reference_number')}
            </span>
            <span className={classes.readValue}>
              {assignment.reference_number}
            </span>
          </div>
        ) : null}

        {/* Keel */}
        <div className={classes.formGroup}>
          <span className={classes.label}>
            {t('calendar.language')}
            {isEditing && <span className={classes.requiredMark}>*</span>}
          </span>
          {isEditing ? (
            <div className={classes.inputReadonly}>
              {language?.language.name ?? ''}
            </div>
          ) : (
            <span className={classes.readValue}>
              {language?.language.name ?? ''}
            </span>
          )}
        </div>

        {/* Kuupäev ja kellaaeg */}
        <div className={classes.formGroup}>
          <label className={classes.label}>
            {isEditing
              ? t('calendar.date_and_start_time')
              : t('calendar.date_and_time')}
            {isEditing && <span className={classes.requiredMark}>*</span>}
          </label>
          {isEditing ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className={classes.input}
                value={selectedDate}
                onChange={(e) => onSetSelectedDate(e.target.value)}
                placeholder="pp.kk.aaaa"
              />
              <input
                className={classes.input}
                style={{ width: 90, flexShrink: 0 }}
                value={startTimeInput}
                onChange={(e) => onSetStartTimeInput(e.target.value)}
                placeholder="hh:mm"
              />
            </div>
          ) : (
            <span className={classes.readValue}>
              {date} / {startTime}
            </span>
          )}
        </div>

        {/* Kestus */}
        {isEditing ? (
          <div className={classes.durationGroup}>
            <label className={classes.label}>
              {t('calendar.duration')}
              <span className={classes.requiredMark}>*</span>
            </label>
            <DurationStepper
              durationMinutes={durationMinutes}
              onSetDurationMinutes={onSetDurationMinutes}
            />
            {!isTPM && (
              <span className={classes.sectionNote}>
                {t('calendar.cannot_extend_time')}
              </span>
            )}
          </div>
        ) : (
          <div className={classes.formGroup}>
            <span className={classes.label}>{t('calendar.duration')}</span>
            <span className={classes.readValue}>{duration}</span>
            {assignment?.updated_at && (
              <span className={classes.sectionNote}>
                {t('calendar.last_modified', {
                  date: dayjs(assignment.updated_at).format(
                    'DD.MM.YYYY [kell] HH:mm'
                  ),
                })}
              </span>
            )}
          </div>
        )}

        {/* Teostaja — TPM only */}
        {isTPM &&
          (isEditing ? (
            <div className={classes.formGroup}>
              <label className={classes.label}>
                {t('calendar.translator')}
                <span className={classes.requiredMark}>*</span>
              </label>
              <select
                className={classes.select}
                value={vendorId}
                disabled={vendorLocked}
                onChange={(e) => onSetVendorId(e.target.value)}
              >
                <option value="">{t('calendar.select_translator')}</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          ) : vendorName || assignment ? (
            <div className={classes.formGroup}>
              <span className={classes.label}>{t('calendar.translator')}</span>
              <span className={classes.readValue}>{vendorName ?? '—'}</span>
            </div>
          ) : null)}

        {/* Tellimuse viis */}
        {isEditing ? (
          <div className={classes.formGroup}>
            <label className={classes.label}>
              {t('calendar.order_way')}
              <span className={classes.requiredMark}>*</span>
            </label>
            <select
              className={classes.select}
              value={serviceType}
              onChange={(e) => {
                onSetServiceType(e.target.value as ServiceType)
                onSetLocation('')
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
        ) : (assignment?.service_type ?? order?.service_type) ? (
          <OrderServiceLocationReadonly
            variant="view"
            serviceType={
              assignment?.service_type ?? order?.service_type ?? null
            }
            location={order?.location}
            meetingLink={order?.meeting_link}
          />
        ) : null}

        {/* Asukoht / Koosoleku link — edit mode only */}
        {isEditing && serviceType === 'kontakttolge' && (
          <div className={classes.formGroup}>
            <label className={classes.label}>
              {t('calendar.location')}
              <span className={classes.requiredMark}>*</span>
            </label>
            <input
              className={classes.input}
              value={location}
              onChange={(e) => onSetLocation(e.target.value)}
              placeholder={t('calendar.enter_address')}
            />
          </div>
        )}
        {isEditing && serviceType === 'kaugtolge' && (
          <div className={classes.formGroup}>
            <label className={classes.label}>
              {t('calendar.meeting_link')}
              <span className={classes.requiredMark}>*</span>
            </label>
            <input
              className={classes.input}
              value={location}
              onChange={(e) => onSetLocation(e.target.value)}
              placeholder={t('calendar.enter_link')}
            />
          </div>
        )}

        {/* Valdkond */}
        {isEditing ? (
          <div className={classes.formGroup}>
            <label className={classes.label}>{t('calendar.domain')}</label>
            <MultiSelect
              options={domains ?? []}
              value={domainIds}
              onChange={onSetDomainIds}
              placeholder={t('calendar.select_domain')}
            />
          </div>
        ) : order?.tags?.length ? (
          <div className={classes.formGroup}>
            <span className={classes.label}>{t('calendar.domain')}</span>
            <div className={classes.tagList}>
              {order.tags.map((tag) => (
                <span key={tag.id} className={classes.domainChip}>
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Metaandmed — view only */}
        {!isEditing && (
          <SlotMetaSection
            source={order}
            isMetaOpen={isMetaOpen}
            onToggle={() => onSetIsMetaOpen(!isMetaOpen)}
          />
        )}
      </div>

      <OrderAttachments />
      <OrderComments />
    </>
  )
}

export default CalendarOrderViewBody
