import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import dayjs from 'dayjs'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { formatDurationMins } from 'helpers/calendar'
import AttachIcon from 'assets/icons/attach.svg?react'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import ArrowDownIcon from 'assets/icons/arrow_down.svg?react'
import AddIcon from 'assets/icons/add.svg?react'
import DownloadIcon from 'assets/icons/download.svg?react'
import { useSidePanel } from './SidePanelContext'
import classes from './classes.module.scss'

const CalendarTranslatorBody: FC = () => {
  const { t } = useTranslation()
  const {
    language,
    slot,
    date,
    startTime,
    duration,
    isPastSlot,
    isChangingDuration,
    isConfirmingCancel,
    setIsConfirmingCancel: onSetIsConfirmingCancel,
    isMetaOpen,
    setIsMetaOpen: onSetIsMetaOpen,
    durationMinutes,
    setDurationMinutes: onSetDurationMinutes,
    durationNote,
    setDurationNote: onSetDurationNote,
    isCancelling,
    handleVoidConfirm: onVoidConfirm,
    handleStartChangeDuration: onStartChangeDuration,
  } = useSidePanel()

  return (
    <>
      {/* Action buttons — hidden for past slots */}
      {!isPastSlot && (
        <div className={classes.translatorActions}>
          {isChangingDuration ? (
            <Button
              appearance={AppearanceTypes.Secondary}
              onClick={() => onSetIsConfirmingCancel(true)}
              disabled={isCancelling}
            >
              {t('calendar.cancel_order')}
            </Button>
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
              <Button
                appearance={AppearanceTypes.Primary}
                onClick={onStartChangeDuration}
              >
                {t('calendar.change_duration')}
              </Button>
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
            <div className={classes.meetingLinkRow}>
              <a
                className={classes.meetingLink}
                href={`https://${slot.assignment.meeting_link}`}
                target="_blank"
                rel="noreferrer"
              >
                {slot.assignment.meeting_link}
              </a>
              <button
                className={classes.copyBtn}
                onClick={() =>
                  navigator.clipboard.writeText(
                    `https://${slot.assignment?.meeting_link ?? ''}`
                  )
                }
                title={t('label.copy' as never)}
              >
                <svg
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                >
                  <rect
                    x="7"
                    y="7"
                    width="10"
                    height="10"
                    rx="1.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M13 7V5C13 4.17 12.33 3.5 11.5 3.5H4.5C3.67 3.5 3 4.17 3 5v7c0 .83.67 1.5 1.5 1.5H7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
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
          {!!slot?.assignment?.files?.length && (
            <button className={classes.sectionLinkBtn}>
              {t('calendar.download_files', {
                count: slot.assignment.files.length,
              })}
            </button>
          )}
        </div>
      </div>
      {(isChangingDuration || isPastSlot) && slot?.assignment?.files?.length ? (
        <div className={classes.fileList}>
          <div className={classes.fileListHeader}>
            {t('calendar.file_list_header')}
          </div>
          {slot.assignment.files.map((f) => (
            <div key={f.name} className={classes.fileItem}>
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
          {!!slot?.assignment?.last_comment_date && (
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
      {!!(isChangingDuration || isPastSlot) &&
        !!slot?.assignment?.comments?.length && (
          <>
            {slot.assignment.comments.map((c) => (
              <div
                key={`${c.author}-${c.created_at}`}
                className={classes.commentContent}
              >
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
