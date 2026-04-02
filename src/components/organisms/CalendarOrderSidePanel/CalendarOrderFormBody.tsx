import { FC, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import { ServiceType } from 'types/calendar'
import { useFetchInfiniteProjectPerson } from 'hooks/requests/useUsers'
import MultiSelect from 'components/molecules/MultiSelect/MultiSelect'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import AddIcon from 'assets/icons/add.svg?react'
import DeleteIcon from 'assets/icons/delete.svg?react'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { useSidePanel } from './SidePanelContext'
import DurationStepper from './DurationStepper'
import classes from './classes.module.scss'

const CalendarOrderFormBody: FC = () => {
  const { t } = useTranslation()
  const {
    language,
    isViewMode,
    date,
    startTime,
    duration,
    isTPM,
    referenceNumber,
    setReferenceNumber: onSetReferenceNumber,
    serviceType,
    setServiceType: onSetServiceType,
    location,
    setLocation: onSetLocation,
    clientInstitutionId,
    setClientInstitutionId: onSetClientInstitutionId,
    domainIds,
    setDomainIds: onSetDomainIds,
    vendorId,
    vendorLocked,
    setVendorId: onSetVendorId,
    durationMinutes,
    setDurationMinutes: onSetDurationMinutes,
    domains,
    vendors,
    pendingFiles,
    setPendingFiles,
    pendingComment,
    setPendingComment,
  } = useSidePanel()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFilesOpen, setIsFilesOpen] = useState(false)
  const [isAddingComment, setIsAddingComment] = useState(false)

  const { users: clients } = useFetchInfiniteProjectPerson(
    undefined,
    'client',
    isTPM
  )

  return (
    <>
      <div className={classes.form}>
        <p className={classes.requiredNotice}>
          {t('calendar.required_notice')}
        </p>

        {/* Tellija — TPM only */}
        {isTPM && (
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
                  {[c.user.forename, c.user.surname].filter(Boolean).join(' ')}
                </option>
              ))}
            </select>
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
            value={referenceNumber}
            onChange={(e) => onSetReferenceNumber(e.target.value)}
          />
        </div>

        {/* Keel */}
        <div className={classes.formGroup}>
          <label className={classes.label}>
            {t('calendar.language')}
            <span className={classes.requiredMark}>*</span>
          </label>
          <div className={classes.inputReadonly}>
            {language?.language.name ?? ''}
          </div>
        </div>

        {/* Kuupäev */}
        <div className={classes.formGroup}>
          <label className={classes.label}>
            {t('calendar.date')}
            <span className={classes.requiredMark}>*</span>
          </label>
          <div className={classes.inputReadonly}>{date}</div>
        </div>

        {/* Alates + Kestus */}
        <div className={classes.formRow}>
          <div className={classes.formGroup}>
            <label className={classes.label}>
              {t('calendar.from')}
              <span className={classes.requiredMark}>*</span>
            </label>
            <div className={classes.inputReadonly}>{startTime}</div>
          </div>
          <div className={classes.formGroup}>
            <label className={classes.label}>
              {t('calendar.duration')}
              <span className={classes.requiredMark}>*</span>
            </label>
            {isViewMode ? (
              <div className={classes.inputReadonly}>{duration}</div>
            ) : (
              <DurationStepper
                durationMinutes={durationMinutes}
                onSetDurationMinutes={onSetDurationMinutes}
              />
            )}
          </div>
        </div>

        {/* Tellimuse tüüp */}
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

        {/* Asukoht / Koosoleku link */}
        {serviceType === 'kontakttolge' && (
          <div className={classes.formGroup}>
            <label className={classes.label}>
              {t('calendar.location')}
              <span className={classes.requiredMark}>*</span>
            </label>
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
              <span className={classes.requiredMark}>*</span>
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
          <MultiSelect
            options={domains ?? []}
            value={domainIds}
            onChange={onSetDomainIds}
            placeholder={t('calendar.select_domain')}
          />
        </div>

        {/* Teostaja — TPM only */}
        {isTPM && (
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
        )}
      </div>

      {/* Lisamaterjal */}
      <div className={classes.divider} />
      <div className={classes.sectionRow}>
        <button
          className={classes.sectionLabel}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: pendingFiles.length ? 'pointer' : 'default',
          }}
          onClick={() => pendingFiles.length && setIsFilesOpen(!isFilesOpen)}
        >
          <span>{t('calendar.attachments')}</span>
          {!!pendingFiles.length && (
            <>
              <ChevronLeft
                className={classNames(classes.sectionChevron, {
                  [classes.sectionChevronOpen]: isFilesOpen,
                })}
              />
              <span className={classes.sectionNote}>{pendingFiles.length}</span>
            </>
          )}
        </button>
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: 'none' }}
            onChange={(e) => {
              const files = Array.from(e.target.files ?? [])
              if (files.length) {
                setPendingFiles([...pendingFiles, ...files])
                setIsFilesOpen(true)
              }
              e.target.value = ''
            }}
          />
          <button
            className={classes.sectionBtn}
            onClick={() => fileInputRef.current?.click()}
          >
            {t('calendar.add_short')}
            <AddIcon style={{ width: 16, height: 16 }} />
          </button>
        </>
      </div>
      {isFilesOpen && !!pendingFiles.length && (
        <div className={classes.fileList}>
          {pendingFiles.map((f, i) => (
            <div key={`${f.name}-${i}`} className={classes.fileItem}>
              <span className={classes.fileLink}>{f.name}</span>
              <button
                className={classes.fileIconBtn}
                onClick={() =>
                  setPendingFiles(pendingFiles.filter((_, idx) => idx !== i))
                }
              >
                <DeleteIcon style={{ width: 24, height: 24 }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Kommentaarid */}
      <div className={classes.divider} />
      <div className={classes.sectionRow}>
        <span className={classes.sectionLabel}>{t('calendar.comments')}</span>
        {!isAddingComment && (
          <button
            className={classes.sectionBtn}
            onClick={() => setIsAddingComment(true)}
          >
            {t('calendar.add_short')}
            <AddIcon style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>
      {pendingComment && !isAddingComment && (
        <div className={classes.commentContent}>
          <span className={classes.commentText}>{pendingComment}</span>
        </div>
      )}
      {isAddingComment && (
        <div className={classes.commentForm}>
          <textarea
            className={classes.textarea}
            placeholder={t('calendar.write_text')}
            value={pendingComment}
            onChange={(e) => setPendingComment(e.target.value)}
            autoFocus
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button
              appearance={AppearanceTypes.Primary}
              disabled={!pendingComment.trim()}
              onClick={() => setIsAddingComment(false)}
            >
              {t('calendar.save')}
            </Button>
            <Button
              appearance={AppearanceTypes.Secondary}
              onClick={() => {
                setIsAddingComment(false)
                setPendingComment('')
              }}
            >
              {t('calendar.cancel')}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}

export default CalendarOrderFormBody
