import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import dayjs from 'dayjs'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import DownloadIcon from 'assets/icons/download.svg?react'
import { useSidePanel } from './SidePanelContext'
import OrderServiceLocationReadonly from './OrderServiceLocationReadonly'
import SlotMetaSection from './SlotMetaSection'
import classes from './classes.module.scss'

const CalendarClientPastBody: FC = () => {
  const { t } = useTranslation()
  const {
    language,
    slot,
    date,
    startTime,
    duration,
    isMetaOpen,
    setIsMetaOpen: onSetIsMetaOpen,
    order,
    downloadFile,
  } = useSidePanel()

  const [isFilesOpen, setIsFilesOpen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)

  return (
    <>
      {/* Status badge + read-only fields */}
      <div className={classes.form}>
        <div className={classes.statusBadgeGrey}>
          {t('calendar.status_completed')}
        </div>

        {/* Collapsible metaandmed */}
        <SlotMetaSection
          source={order}
          isMetaOpen={isMetaOpen}
          onToggle={() => onSetIsMetaOpen(!isMetaOpen)}
        />

        {slot?.assignment?.reference_number && (
          <div className={classes.formGroup}>
            <span className={classes.label}>
              {t('calendar.reference_number')}
            </span>
            <span className={classes.readValue}>
              {slot.assignment.reference_number}
            </span>
          </div>
        )}

        <div className={classes.formGroup}>
          <span className={classes.label}>{t('calendar.language')}</span>
          <span className={classes.readValue}>
            {language?.language.name ?? ''}
          </span>
        </div>

        <div className={classes.formGroup}>
          <span className={classes.label}>{t('calendar.date_and_time')}</span>
          <span className={classes.readValue}>
            {date} / {startTime}
          </span>
        </div>

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

        <OrderServiceLocationReadonly
          variant="past"
          serviceType={slot?.assignment?.service_type}
          location={slot?.assignment?.location}
          meetingLink={slot?.assignment?.meeting_link}
        />
      </div>

      {/* Lisamaterjalid */}
      <div className={classes.divider} />
      <div className={classes.sectionRow}>
        <span className={classes.sectionLabel}>
          {t('calendar.attachments')}
        </span>
        {!!order?.source_files?.length && (
          <button
            className={classes.sectionBtn}
            onClick={() => setIsFilesOpen(!isFilesOpen)}
          >
            <span className={classes.sectionNote}>
              {order.source_files.length}
            </span>
            <ChevronLeft
              className={classNames(classes.sectionChevron, {
                [classes.sectionChevronOpen]: isFilesOpen,
              })}
            />
          </button>
        )}
      </div>
      {isFilesOpen && !!order?.source_files?.length && (
        <div className={classes.fileList}>
          {order.source_files.map((f) => (
            <div key={f.id} className={classes.fileItem}>
              <button
                className={classes.fileLink}
                onClick={() =>
                  downloadFile({
                    id: f.id,
                    file_name: f.file_name,
                    collection: f.collection_name ?? 'help',
                  })
                }
              >
                {f.name}
              </button>
              <DownloadIcon
                className={classes.downloadIcon}
                onClick={() =>
                  downloadFile({
                    id: f.id,
                    file_name: f.file_name,
                    collection: f.collection_name ?? 'help',
                  })
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
        <span className={classes.sectionLabel}>{t('calendar.comments')}</span>
        {!!slot?.assignment?.comments?.length && (
          <button
            className={classes.sectionBtn}
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          >
            <span className={classes.sectionNote}>
              {slot.assignment.comments.length}
            </span>
            <ChevronLeft
              className={classNames(classes.sectionChevron, {
                [classes.sectionChevronOpen]: isCommentsOpen,
              })}
            />
          </button>
        )}
      </div>
      {isCommentsOpen && !!slot?.assignment?.comments?.length && (
        <>
          {slot.assignment.comments.map((c, i) => (
            <div key={c.created_at ?? i} className={classes.commentContent}>
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

export default CalendarClientPastBody
