import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { BookedSlot, CalendarLanguage } from 'types/calendar'
import { ClassifierValue } from 'types/classifierValues'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import AttachIcon from 'assets/icons/attach.svg?react'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import ArrowDownIcon from 'assets/icons/arrow_down.svg?react'
import AddIcon from 'assets/icons/add.svg?react'
import DownloadIcon from 'assets/icons/download.svg?react'
import classes from './classes.module.scss'

export type ServiceType = 'kaugtolge' | 'kontakttolge' | ''

const formatDurationMins = (mins: number): string => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const hLabel = h === 1 ? 'tund' : 'tundi'
  if (h === 0) return `${m} minutit`
  if (m === 0) return `${h} ${hLabel}`
  return `${h} ${hLabel} ja ${m} minutit`
}

interface CalendarClientBodyProps {
  language: CalendarLanguage | undefined
  slot: BookedSlot | undefined
  date: string
  startTime: string
  duration: string
  isPastSlot: boolean
  isEditing: boolean
  isConfirmingCancel: boolean
  isMetaOpen: boolean
  durationMinutes: number
  viitenumber: string
  serviceType: ServiceType
  location: string
  kuupaev: string
  algusaeg: string
  domainId: string
  domains: ClassifierValue[] | undefined
  isUpdating: boolean
  isCancelling: boolean
  onStartEdit: () => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onVoidConfirm: () => void
  onSetIsConfirmingCancel: (v: boolean) => void
  onSetIsMetaOpen: (v: boolean) => void
  onSetViitenumber: (v: string) => void
  onSetServiceType: (v: ServiceType) => void
  onSetLocation: (v: string) => void
  onSetKuupaev: (v: string) => void
  onSetAlgusaeg: (v: string) => void
  onSetDomainId: (v: string) => void
  onSetDurationMinutes: (fn: (prev: number) => number) => void
}

const CalendarClientBody: FC<CalendarClientBodyProps> = ({
  language,
  slot,
  date,
  startTime,
  duration,
  isPastSlot,
  isEditing,
  isConfirmingCancel,
  isMetaOpen,
  durationMinutes,
  viitenumber,
  serviceType,
  location,
  kuupaev,
  algusaeg,
  domainId,
  domains,
  isUpdating,
  isCancelling,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onVoidConfirm,
  onSetIsConfirmingCancel,
  onSetIsMetaOpen,
  onSetViitenumber,
  onSetServiceType,
  onSetLocation,
  onSetKuupaev,
  onSetAlgusaeg,
  onSetDomainId,
  onSetDurationMinutes,
}) => {
  const { t } = useTranslation()

  return (
    <>
      {/* Top action bar — hidden for past/completed slots */}
      {!isPastSlot && isEditing ? (
        <div className={classes.clientEditBar}>
          <button className={classes.loobuLink} onClick={onCancelEdit}>
            <ChevronLeft style={{ width: 14, height: 14 }} />
            {t('calendar.abandon_editing')}
          </button>
          <Button
            appearance={AppearanceTypes.Primary}
            onClick={onSaveEdit}
            disabled={isUpdating}
          >
            {isUpdating ? t('calendar.saving') : t('calendar.save')}
          </Button>
        </div>
      ) : !isPastSlot ? (
        <div className={classes.translatorActions}>
          {isConfirmingCancel ? (
            <>
              <Button
                appearance={AppearanceTypes.Primary}
                onClick={onVoidConfirm}
                disabled={isCancelling}
              >
                {isCancelling
                  ? t('calendar.voiding')
                  : t('calendar.void_confirm_yes')}
              </Button>
              <Button
                appearance={AppearanceTypes.Secondary}
                onClick={() => onSetIsConfirmingCancel(false)}
                disabled={isCancelling}
              >
                {t('calendar.void_confirm_no')}
              </Button>
            </>
          ) : (
            <>
              <Button
                appearance={AppearanceTypes.Secondary}
                onClick={onStartEdit}
              >
                {t('calendar.edit')}
              </Button>
              <Button
                appearance={AppearanceTypes.Secondary}
                onClick={() => onSetIsConfirmingCancel(true)}
              >
                {t('calendar.void')}
              </Button>
            </>
          )}
        </div>
      ) : null}

      <div className={classes.form}>
        {/* Status badge */}
        <div className={classes.statusBadgeGrey}>
          {slot?.assignment?.status === 'completed'
            ? t('calendar.status_completed')
            : slot?.assignment?.status === 'cancelled'
              ? t('calendar.status_cancelled')
              : slot?.assignment?.status === 'confirmed'
                ? t('calendar.status_forwarded')
                : t('calendar.status_pending')}
        </div>

        {isEditing && (
          <p className={classes.requiredNotice}>
            {t('calendar.required_fields_notice')}
          </p>
        )}

        {/* Viitenumber */}
        {isEditing ? (
          <div className={classes.formGroup}>
            <label className={classes.label}>
              {t('calendar.reference_number')}
            </label>
            <input
              className={classes.input}
              value={viitenumber}
              onChange={(e) => onSetViitenumber(e.target.value)}
            />
          </div>
        ) : slot?.assignment?.reference_number ? (
          <div className={classes.formGroup}>
            <span className={classes.label}>
              {t('calendar.reference_number')}
            </span>
            <span className={classes.readValue}>
              {slot.assignment.reference_number}
            </span>
          </div>
        ) : null}

        {/* Keel */}
        <div className={classes.formGroup}>
          <label className={classes.label}>{t('calendar.language')}</label>
          <div className={classes.inputReadonly}>
            {language?.language.name ?? ''}
          </div>
        </div>

        {/* Kuupäev ja kellaaeg / algusaeg */}
        <div className={classes.formGroup}>
          <label className={classes.label}>
            {isEditing
              ? t('calendar.date_and_start_time')
              : t('calendar.date_and_time')}
          </label>
          {isEditing ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className={classes.input}
                value={kuupaev}
                onChange={(e) => onSetKuupaev(e.target.value)}
                placeholder="pp.kk.aaaa"
              />
              <input
                className={classes.input}
                style={{ width: 90, flexShrink: 0 }}
                value={algusaeg}
                onChange={(e) => onSetAlgusaeg(e.target.value)}
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
            <label className={classes.label}>{t('calendar.duration')}</label>
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
            <span className={classes.sectionNote}>
              {t('calendar.cannot_extend_time')}
            </span>
          </div>
        ) : (
          <div className={classes.formGroup}>
            <span className={classes.label}>{t('calendar.duration')}</span>
            <span className={classes.readValue}>{duration}</span>
            {slot?.assignment?.updated_at && (
              <span className={classes.sectionNote}>
                {t('calendar.last_modified', {
                  date: dayjs(slot.assignment.updated_at).format(
                    'DD.MM.YYYY [kell] HH:mm'
                  ),
                })}
              </span>
            )}
          </div>
        )}

        {/* Tellimuse viis */}
        {isEditing ? (
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
        ) : (
          slot?.assignment?.service_type && (
            <div className={classes.formGroup}>
              <span className={classes.label}>{t('calendar.order_way')}</span>
              <span className={classes.readValue}>
                {slot.assignment.service_type === 'remote'
                  ? t('calendar.service_type_remote')
                  : t('calendar.service_type_contact')}
              </span>
            </div>
          )
        )}

        {/* Asukoht / Koosoleku link */}
        {isEditing ? (
          <>
            {serviceType === 'kontakttolge' && (
              <div className={classes.formGroup}>
                <label className={classes.label}>
                  {t('calendar.location')}
                </label>
                <input
                  className={classes.input}
                  value={location}
                  onChange={(e) => onSetLocation(e.target.value)}
                  placeholder={t('calendar.enter_address')}
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
                  value={location}
                  onChange={(e) => onSetLocation(e.target.value)}
                  placeholder={t('calendar.enter_link')}
                />
              </div>
            )}
          </>
        ) : (
          slot?.assignment?.service_type && (
            <>
              {slot.assignment.service_type === 'on-site' &&
                slot.assignment.location && (
                  <div className={classes.formGroup}>
                    <span className={classes.label}>
                      {t('calendar.location')}
                    </span>
                    <span className={classes.readValueBlue}>
                      {slot.assignment.location}
                    </span>
                  </div>
                )}
              {slot.assignment.service_type === 'remote' &&
                slot.assignment.meeting_link && (
                  <div className={classes.formGroup}>
                    <span className={classes.label}>
                      {t('calendar.meeting_link')}
                    </span>
                    <a
                      className={classes.meetingLink}
                      href={slot.assignment.meeting_link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {slot.assignment.meeting_link}
                    </a>
                  </div>
                )}
            </>
          )
        )}

        {/* Valdkond — edit only */}
        {isEditing && (
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
        )}

        {/* Metaandmed — view only */}
        {!isEditing && (
          <>
            <button
              className={classes.metaToggle}
              onClick={() => onSetIsMetaOpen(!isMetaOpen)}
            >
              <ArrowDownIcon
                className={classNames(classes.metaIcon, {
                  [classes.metaIconOpen]: isMetaOpen,
                })}
              />
              <span>{t('calendar.order_meta')}</span>
            </button>
            {isMetaOpen && (
              <div className={classes.metaContent}>
                {slot?.assignment?.reference_number && (
                  <div className={classes.metaGroup}>
                    <span className={classes.metaLabel}>
                      {t('calendar.reference_number')}
                    </span>
                    <span className={classes.metaValue}>
                      {slot.assignment.reference_number}
                    </span>
                  </div>
                )}
                {slot?.assignment?.client && (
                  <>
                    <div className={classes.metaRow}>
                      <div className={classes.metaGroup}>
                        <span className={classes.metaLabel}>
                          {t('calendar.client_name')}
                        </span>
                        <span className={classes.metaValue}>
                          {slot.assignment.client.name}
                        </span>
                      </div>
                      <div className={classes.metaGroup}>
                        <span className={classes.metaLabel}>
                          {t('calendar.institution')}
                        </span>
                        <span className={classes.metaValue}>
                          {slot.assignment.client.institution}
                        </span>
                      </div>
                    </div>
                    <div className={classes.metaRow}>
                      <div className={classes.metaGroup}>
                        <span className={classes.metaLabel}>
                          {t('calendar.email')}
                        </span>
                        <span className={classes.metaValue}>
                          {slot.assignment.client.email}
                        </span>
                      </div>
                      <div className={classes.metaGroup}>
                        <span className={classes.metaLabel}>
                          {t('calendar.phone')}
                        </span>
                        <span className={classes.metaValue}>
                          {slot.assignment.client.phone}
                        </span>
                      </div>
                    </div>
                  </>
                )}
                {slot?.assignment?.coordinator && (
                  <>
                    <div className={classes.metaGroup}>
                      <span className={classes.metaLabel}>
                        {t('calendar.coordinator_name')}
                      </span>
                      <span className={classes.metaValue}>
                        {slot.assignment.coordinator.name}
                      </span>
                    </div>
                    <div className={classes.metaRow}>
                      <div className={classes.metaGroup}>
                        <span className={classes.metaLabel}>
                          {t('calendar.email')}
                        </span>
                        <span className={classes.metaValue}>
                          {slot.assignment.coordinator.email}
                        </span>
                      </div>
                      <div className={classes.metaGroup}>
                        <span className={classes.metaLabel}>
                          {t('calendar.phone')}
                        </span>
                        <span className={classes.metaValue}>
                          {slot.assignment.coordinator.phone}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Lisamaterjalid */}
      <div className={classes.divider} />
      <div className={classes.sectionRow}>
        <div className={classes.sectionLabel}>
          <AttachIcon className={classes.sectionIcon} />
          <span>{t('calendar.attachments')}</span>
          {slot?.assignment?.files?.length ? (
            <>
              <ChevronLeft className={classes.sectionChevron} />
              <button className={classes.sectionLinkBtn}>
                {t('calendar.download_files', {
                  count: slot.assignment.files.length,
                })}
              </button>
            </>
          ) : null}
        </div>
        {!isPastSlot && (
          <button className={classes.sectionBtn}>
            {t('calendar.add_short')}
            <AddIcon style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>
      {isPastSlot && !!slot?.assignment?.files?.length && (
        <div className={classes.fileList}>
          <div className={classes.fileListHeader}>
            {t('calendar.file_list_header')}
          </div>
          {slot.assignment.files.map((f, i) => (
            <div key={i} className={classes.fileItem}>
              <button className={classes.fileLink}>{f.name}</button>
              <DownloadIcon className={classes.downloadIcon} />
            </div>
          ))}
        </div>
      )}

      {/* Kommentaarid */}
      <div className={classes.divider} />
      <div className={classes.sectionRow}>
        <div className={classes.sectionLabel}>
          <ChevronLeft className={classes.sectionChevron} />
          <span>{t('calendar.comments')}</span>
          {slot?.assignment?.last_comment_date && (
            <span className={classes.sectionNote}>
              {t('calendar.last_commented', {
                date: slot.assignment.last_comment_date,
              })}
            </span>
          )}
        </div>
        <button className={classes.sectionBtn}>
          {t('calendar.add_short')}
          <AddIcon style={{ width: 16, height: 16 }} />
        </button>
      </div>
      {isPastSlot && !!slot?.assignment?.comments?.length && (
        <>
          {slot.assignment.comments.map((c, i) => (
            <div key={i} className={classes.commentContent}>
              <span className={classes.commentAuthor}>{c.author}</span>
              <span className={classes.commentText}>{c.text}</span>
              <span className={classes.commentDate}>
                {t('calendar.added_at', {
                  date: dayjs(c.created_at).format('DD.MM.YYYY [kell] HH:mm'),
                })}
              </span>
            </div>
          ))}
        </>
      )}
    </>
  )
}

export default CalendarClientBody
