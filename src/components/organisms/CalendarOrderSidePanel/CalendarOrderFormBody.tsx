import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { ServiceType } from 'types/calendar'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { formatDurationMins } from 'helpers/calendar'
import AttachIcon from 'assets/icons/attach.svg?react'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import AddIcon from 'assets/icons/add.svg?react'
import { useSidePanel } from './SidePanelContext'
import classes from './classes.module.scss'

const CalendarOrderFormBody: FC = () => {
  const { t } = useTranslation()
  const {
    language,
    slot,
    isViewMode,
    isTPMPendingView,
    isConfirming,
    isRejecting,
    handleConfirmOrder: onConfirmOrder,
    handleRejectOrder: onRejectOrder,
    date,
    startTime,
    duration,
    isTPM,
    viitenumber,
    setViitenumber: onSetViitenumber,
    serviceType,
    setServiceType: onSetServiceType,
    location,
    setLocation: onSetLocation,
    tellija,
    setTellija: onSetTellija,
    domainId,
    setDomainId: onSetDomainId,
    vendorId,
    setVendorId: onSetVendorId,
    durationMinutes,
    setDurationMinutes: onSetDurationMinutes,
    domains,
    vendors,
  } = useSidePanel()

  return (
    <>
      {/* TPM pending order actions */}
      {isTPMPendingView && (
        <div className={classes.translatorActions}>
          <Button
            appearance={AppearanceTypes.Primary}
            onClick={onConfirmOrder}
            disabled={isConfirming || isRejecting}
          >
            {isConfirming ? t('calendar.saving') : t('calendar.confirm_order')}
          </Button>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={onRejectOrder}
            disabled={isConfirming || isRejecting}
          >
            {isRejecting ? t('calendar.saving') : t('calendar.decline')}
          </Button>
        </div>
      )}

      <div className={classes.form}>
        {/* Tellija — TPM only, hidden for pending Client orders */}
        {isTPM && !isTPMPendingView && (
          <div className={classes.formGroup}>
            <label className={classes.label}>{t('calendar.client')}</label>
            <input
              className={classes.input}
              placeholder={t('calendar.enter_name')}
              value={tellija}
              onChange={(e) => onSetTellija(e.target.value)}
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
            onChange={(e) => onSetViitenumber(e.target.value)}
          />
        </div>

        {/* Keel */}
        <div className={classes.formGroup}>
          <label className={classes.label}>{t('calendar.language')}</label>
          <div className={classes.inputReadonly}>
            {language?.language.name ?? ''}
          </div>
        </div>

        {/* Kuupäev */}
        <div className={classes.formGroup}>
          <label className={classes.label}>{t('calendar.date')}</label>
          <div className={classes.inputReadonly}>{date}</div>
        </div>

        {/* Alates + Kestus */}
        <div className={classes.formRow}>
          <div className={classes.formGroup}>
            <label className={classes.label}>{t('calendar.from')}</label>
            <div className={classes.inputReadonly}>{startTime}</div>
          </div>
          <div className={classes.formGroup}>
            <label className={classes.label}>{t('calendar.duration')}</label>
            {isViewMode ? (
              <div className={classes.inputReadonly}>{duration}</div>
            ) : (
              <div className={classes.durationStepper}>
                <button
                  className={classes.stepperBtn}
                  onClick={() =>
                    onSetDurationMinutes((v) => Math.max(30, v - 30))
                  }
                >
                  −
                </button>
                <span className={classes.stepperValue}>
                  {formatDurationMins(durationMinutes)}
                </span>
                <button
                  className={classes.stepperBtn}
                  onClick={() => onSetDurationMinutes((v) => v + 30)}
                >
                  +
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tellimuse tüüp */}
        <div className={classes.formGroup}>
          <label className={classes.label}>{t('calendar.order_type')}</label>
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

        {/* Asukoht / Koosoleku link */}
        {serviceType === 'kontakttolge' && (
          <div className={classes.formGroup}>
            <label className={classes.label}>{t('calendar.location')}</label>
            <input
              className={classes.input}
              placeholder={t('calendar.enter_address')}
              value={location}
              onChange={(e) => onSetLocation(e.target.value)}
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
              onChange={(e) => onSetLocation(e.target.value)}
            />
          </div>
        )}

        {/* Valdkond */}
        <div className={classes.formGroup}>
          <label className={classes.label}>{t('calendar.domain')}</label>
          <select
            className={classes.select}
            value={domainId}
            onChange={(e) => onSetDomainId(e.target.value)}
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
              onChange={(e) => onSetVendorId(e.target.value)}
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
          {isViewMode && !!slot?.assignment?.files?.length && (
            <button className={classes.sectionLinkBtn}>
              {t('calendar.attached_files_count', {
                count: slot.assignment.files.length,
              })}
            </button>
          )}
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

      {/* Tagasiside tõlketeenusele — only for existing orders */}
      {isViewMode && (
        <>
          <div className={classes.divider} />
          <div className={classes.sectionRow}>
            <div className={classes.sectionLabel}>
              <AttachIcon className={classes.sectionIcon} />
              <span>{t('calendar.translation_feedback')}</span>
            </div>
            <button className={classes.sectionBtn}>
              {t('calendar.add_short')}
              <AddIcon style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </>
      )}
    </>
  )
}

export default CalendarOrderFormBody
