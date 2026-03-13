import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { BookedSlot, CalendarLanguage } from 'types/calendar'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import AttachIcon from 'assets/icons/attach.svg?react'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import ArrowDownIcon from 'assets/icons/arrow_down.svg?react'
import AddIcon from 'assets/icons/add.svg?react'
import DownloadIcon from 'assets/icons/download.svg?react'
import classes from './classes.module.scss'

const formatDurationMins = (mins: number): string => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const hLabel = h === 1 ? 'tund' : 'tundi'
  if (h === 0) return `${m} minutit`
  if (m === 0) return `${h} ${hLabel}`
  return `${h} ${hLabel} ja ${m} minutit`
}

interface CalendarTranslatorBodyProps {
  language: CalendarLanguage | undefined
  slot: BookedSlot | undefined
  date: string
  startTime: string
  duration: string
  isPastSlot: boolean
  isAcceptMode: boolean
  isTranslatorConfirmedView: boolean
  isChangingDuration: boolean
  isConfirmingCancel: boolean
  isMetaOpen: boolean
  durationMinutes: number
  durationNote: string
  isAccepting: boolean
  isDeclining: boolean
  isCancelling: boolean
  isUpdating: boolean
  onAccept: () => void
  onDecline: () => void
  onVoidConfirm: () => void
  onSetIsConfirmingCancel: (v: boolean) => void
  onStartChangeDuration: () => void
  onSetIsMetaOpen: (v: boolean) => void
  onSetDurationMinutes: (fn: (prev: number) => number) => void
  onSetDurationNote: (v: string) => void
}

const CalendarTranslatorBody: FC<CalendarTranslatorBodyProps> = ({
  language,
  slot,
  date,
  startTime,
  duration,
  isPastSlot,
  isAcceptMode,
  isTranslatorConfirmedView,
  isChangingDuration,
  isConfirmingCancel,
  isMetaOpen,
  durationMinutes,
  durationNote,
  isAccepting,
  isDeclining,
  isCancelling,
  onAccept,
  onDecline,
  onVoidConfirm,
  onSetIsConfirmingCancel,
  onStartChangeDuration,
  onSetIsMetaOpen,
  onSetDurationMinutes,
  onSetDurationNote,
}) => {
  const { t } = useTranslation()

  return (
    <>
      {/* Action buttons — hidden for past confirmed slots; accept always visible */}
      {(!isPastSlot || isAcceptMode) && (
        <div className={classes.translatorActions}>
          {isChangingDuration ? (
            <Button
              appearance={AppearanceTypes.Secondary}
              onClick={() => onSetIsConfirmingCancel(true)}
              disabled={isCancelling}
            >
              {t('calendar.cancel_order')}
            </Button>
          ) : isAcceptMode ? (
            <>
              <Button
                appearance={AppearanceTypes.Primary}
                onClick={onAccept}
                disabled={isAccepting || isDeclining}
              >
                {isAccepting ? t('calendar.saving') : t('calendar.accept')}
              </Button>
              <Button
                appearance={AppearanceTypes.Secondary}
                onClick={onDecline}
                disabled={isAccepting || isDeclining}
              >
                {isDeclining ? t('calendar.saving') : t('calendar.decline')}
              </Button>
            </>
          ) : isConfirmingCancel ? (
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
              {isTranslatorConfirmedView && (
                <Button
                  appearance={AppearanceTypes.Primary}
                  onClick={onStartChangeDuration}
                >
                  {t('calendar.change_duration')}
                </Button>
              )}
              <Button
                appearance={AppearanceTypes.Secondary}
                onClick={() => onSetIsConfirmingCancel(true)}
              >
                {t('calendar.cancel_order')}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Read-only order fields */}
      <div className={classes.form}>
        <div className={classes.formGroup}>
          <label className={classes.label}>{t('calendar.language')}</label>
          <span className={classes.readValue}>
            {language?.language.name ?? ''}
          </span>
        </div>
        <div className={classes.formGroup}>
          <label className={classes.label}>{t('calendar.date')}</label>
          <span className={classes.readValue}>{date}</span>
        </div>
        <div className={classes.formGroup}>
          <label className={classes.label}>{t('calendar.start')}</label>
          <span className={classes.readValue}>{startTime}</span>
        </div>

        {/* Kestus — stepper in change mode, read-only otherwise */}
        <div className={classes.durationGroup}>
          <label className={classes.label}>{t('calendar.duration')}</label>
          {isChangingDuration ? (
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
          ) : (
            <span className={classes.readValue}>{duration}</span>
          )}
        </div>

        {slot?.assignment?.service_type && (
          <div className={classes.formGroup}>
            <label className={classes.label}>{t('calendar.order_way')}</label>
            <span className={classes.readValue}>
              {slot.assignment.service_type === 'remote'
                ? t('calendar.service_type_remote')
                : t('calendar.service_type_contact')}
            </span>
          </div>
        )}
        {slot?.assignment?.location && (
          <div className={classes.formGroup}>
            <label className={classes.label}>{t('calendar.location')}</label>
            <span className={classes.readValue}>
              {slot.assignment.location}
            </span>
          </div>
        )}
        {slot?.assignment?.meeting_link && (
          <div className={classes.formGroup}>
            <label className={classes.label}>
              {t('calendar.meeting_link')}
            </label>
            <a
              className={classes.meetingLink}
              href={`https://${slot.assignment.meeting_link}`}
              target="_blank"
              rel="noreferrer"
            >
              {slot.assignment.meeting_link}
            </a>
          </div>
        )}

        {/* Collapsible metaandmed */}
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
      </div>

      {/* Lisamaterjalid */}
      <div className={classes.divider} />
      <div className={classes.sectionRow}>
        <div className={classes.sectionLabel}>
          <AttachIcon className={classes.sectionIcon} />
          <span>{t('calendar.attachments')}</span>
          {isTranslatorConfirmedView && slot?.assignment?.files?.length ? (
            <button className={classes.sectionLinkBtn}>
              {t('calendar.download_files', {
                count: slot.assignment.files.length,
              })}
            </button>
          ) : !isTranslatorConfirmedView ? null : (
            <span className={classes.sectionNote}>
              {t('calendar.available_after_confirmation')}
            </span>
          )}
        </div>
      </div>
      {(isChangingDuration || isPastSlot) && slot?.assignment?.files?.length ? (
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
      ) : null}

      {/* Kommentaarid */}
      <div className={classes.divider} />
      <div className={classes.sectionRow}>
        <div className={classes.sectionLabel}>
          <ChevronLeft className={classes.sectionChevron} />
          <span>{t('calendar.comments')}</span>
          {isTranslatorConfirmedView && slot?.assignment?.last_comment_date && (
            <span className={classes.sectionNote}>
              {t('calendar.last_commented', {
                date: slot.assignment.last_comment_date,
              })}
            </span>
          )}
        </div>
        {isTranslatorConfirmedView && (
          <button className={classes.sectionBtn}>
            {t('calendar.add_short')}
            <AddIcon style={{ width: 16, height: 16 }} />
          </button>
        )}
      </div>
      {!!(isChangingDuration || isPastSlot) &&
        !!slot?.assignment?.comments?.length && (
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
            <div className={classes.sectionRow}>
              <div className={classes.sectionLabel} />
              <button className={classes.sectionBtn}>
                {t('calendar.add_short')}
                <AddIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </>
        )}

      {/* Tõlketeenuse maksumus */}
      {(isChangingDuration || isPastSlot) && (
        <>
          <div className={classes.divider} />
          <div className={classes.sectionRow}>
            <div className={classes.sectionLabel}>
              <ChevronLeft className={classes.sectionChevron} />
              <span>{t('calendar.translation_cost')}</span>
            </div>
          </div>
          <div className={classes.costContent}>
            {slot?.assignment?.price_per_minute && (
              <div className={classes.costGroup}>
                <span className={classes.costLabel}>
                  {t('calendar.cost_per_minute')}
                </span>
                <div className={classes.inputReadonly}>
                  {slot.assignment.price_per_minute}
                </div>
              </div>
            )}
            {slot?.assignment?.billing_method && (
              <div className={classes.costGroup}>
                <span className={classes.costLabel}>
                  {t('calendar.billing_method')}
                </span>
                <div className={classes.inputReadonly}>
                  {slot.assignment.billing_method}
                </div>
              </div>
            )}
            {isChangingDuration && (
              <div className={classes.costGroup}>
                <span className={classes.costLabel}>
                  {t('calendar.add_note')}
                </span>
                <textarea
                  className={classes.textarea}
                  placeholder={t('calendar.write_text')}
                  value={durationNote}
                  onChange={(e) => onSetDurationNote(e.target.value)}
                />
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default CalendarTranslatorBody
