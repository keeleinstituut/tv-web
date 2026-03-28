import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import dayjs from 'dayjs'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import AttachIcon from 'assets/icons/attach.svg?react'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import AddIcon from 'assets/icons/add.svg?react'
import DownloadIcon from 'assets/icons/download.svg?react'
import { useSidePanel } from './SidePanelContext'
import DurationStepper from './DurationStepper'
import SlotMetaSection from './SlotMetaSection'
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
    order,
    downloadFile,
    addComment,
    isPostingComment,
  } = useSidePanel()

  const [isFilesOpen, setIsFilesOpen] = useState(false)
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [commentText, setCommentText] = useState('')

  const handleSaveComment = () => {
    const text = commentText.trim()
    if (!text) return
    addComment(text)
    setCommentText('')
    setIsAddingComment(false)
  }

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
            <DurationStepper
              durationMinutes={durationMinutes}
              onSetDurationMinutes={onSetDurationMinutes}
            />
          ) : (
            <span className={classes.readValue}>{duration}</span>
          )}
        </div>

        {slot?.assignment?.service_type && (
          <div className={classes.formGroup}>
            <label className={classes.label}>{t('calendar.order_way')}</label>
            <span className={classes.readValue}>
              {slot.assignment.service_type === 'REMOTE'
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
        <SlotMetaSection
          source={order}
          isMetaOpen={isMetaOpen}
          onToggle={() => onSetIsMetaOpen(!isMetaOpen)}
        />
      </div>

      {/* Lisamaterjalid */}
      <div className={classes.divider} />
      <div className={classes.sectionRow}>
        <button
          className={classes.sectionLabel}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: order?.source_files?.length ? 'pointer' : 'default',
          }}
          onClick={() =>
            order?.source_files?.length && setIsFilesOpen(!isFilesOpen)
          }
        >
          <AttachIcon className={classes.sectionIcon} />
          <span>{t('calendar.attachments')}</span>
          {!!order?.source_files?.length && (
            <>
              <ChevronLeft
                className={classNames(classes.sectionChevron, {
                  [classes.sectionChevronOpen]: isFilesOpen,
                })}
              />
              <span className={classes.sectionNote}>
                {order.source_files.length}
              </span>
            </>
          )}
        </button>
      </div>
      {isFilesOpen && !!order?.source_files?.length && (
        <div className={classes.fileList}>
          {order.source_files.map((f) => (
            <div key={f.id} className={classes.fileItem}>
              <button
                className={classes.fileLink}
                onClick={() =>
                  downloadFile({ id: f.id, file_name: f.file_name })
                }
              >
                {f.name}
              </button>
              <DownloadIcon
                className={classes.downloadIcon}
                onClick={() =>
                  downloadFile({ id: f.id, file_name: f.file_name })
                }
                style={{ cursor: 'pointer' }}
              />
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
        </div>
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
      {order?.project_comments?.map((c) => (
        <div key={c.id} className={classes.commentContent}>
          <span className={classes.commentText}>{c.comment}</span>
          <span className={classes.commentDate}>
            {t('calendar.added_at', {
              date: dayjs(c.created_at).format('DD.MM.YYYY [kell] HH:mm'),
            })}
          </span>
        </div>
      ))}
      {isAddingComment && (
        <div className={classes.commentForm}>
          <textarea
            className={classes.textarea}
            placeholder={t('calendar.write_text')}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            autoFocus
          />
          <div className={classes.commentFormActions}>
            <Button
              appearance={AppearanceTypes.Primary}
              disabled={!commentText.trim() || isPostingComment}
              onClick={handleSaveComment}
            >
              {t('calendar.save')}
            </Button>
            <Button
              appearance={AppearanceTypes.Secondary}
              onClick={() => {
                setIsAddingComment(false)
                setCommentText('')
              }}
            >
              {t('calendar.cancel')}
            </Button>
          </div>
        </div>
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
