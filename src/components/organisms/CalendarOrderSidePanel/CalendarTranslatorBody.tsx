import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import dayjs from 'dayjs'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import DownloadIcon from 'assets/icons/download.svg?react'
import { calendarBookingStatusLabelKey } from 'helpers/calendarBookingStatus'
import { useSidePanel } from './SidePanelContext'
import OrderServiceLocationReadonly from './OrderServiceLocationReadonly'
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
    isMetaOpen,
    setIsMetaOpen: onSetIsMetaOpen,
    order,
    downloadFile,
    isCancelled,
  } = useSidePanel()

  const assignment = slot?.assignment

  const [isFilesOpen, setIsFilesOpen] = useState(false)
  const [isCommentsOpen, setIsCommentsOpen] = useState(false)

  const showCostSection =
    !!slot?.assignment?.price_per_minute ||
    !!slot?.assignment?.billing_method ||
    isPastSlot

  return (
    <>
      <div className={classes.form}>
        <div className={classes.statusBadgeGrey}>
          {order?.cancel_at
            ? t('calendar.status_cancelling')
            : order?.status === 'CANCELLED' || isCancelled
              ? t('calendar.status_cancelled')
              : (t(
                  calendarBookingStatusLabelKey(
                    order?.status ?? assignment?.project_status ?? null,
                    order?.sub_project_status ??
                      assignment?.sub_project?.status ??
                      null,
                    'translator'
                  ) as never
                ) as string)}
        </div>

        <div className={classes.formGroup}>
          <label className={classes.label}>{t('calendar.language')}</label>
          <span className={classes.readValue}>
            {language?.language.name ?? ''}
          </span>
        </div>

        {order?.source_language && (
          <div className={classes.formGroup}>
            <label className={classes.label}>
              {t('calendar.source_language')}
            </label>
            <span className={classes.readValue}>
              {order.source_language.name}
            </span>
          </div>
        )}
        <div className={classes.formGroup}>
          <label className={classes.label}>{t('calendar.date')}</label>
          <span className={classes.readValue}>{date}</span>
        </div>
        <div className={classes.formGroup}>
          <label className={classes.label}>{t('calendar.start')}</label>
          <span className={classes.readValue}>{startTime}</span>
        </div>

        <div className={classes.durationGroup}>
          <label className={classes.label}>{t('calendar.duration')}</label>
          <span className={classes.readValue}>{duration}</span>
        </div>

        <OrderServiceLocationReadonly
          variant="translator"
          serviceType={slot?.assignment?.service_type}
          location={slot?.assignment?.location}
          meetingLink={slot?.assignment?.meeting_link}
        />

        <SlotMetaSection
          source={order}
          isMetaOpen={isMetaOpen}
          onToggle={() => onSetIsMetaOpen(!isMetaOpen)}
        />
      </div>

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
        >
          <span>{t('calendar.attachments')}</span>
        </button>
        {!!order?.source_files?.length && (
          <div
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
            onClick={() =>
              order?.source_files?.length && setIsFilesOpen(!isFilesOpen)
            }
          >
            <span className={classes.sectionNote}>
              {order.source_files.length}
            </span>
            <ChevronLeft
              className={classNames(classes.sectionChevron, {
                [classes.sectionChevronOpen]: isFilesOpen,
              })}
            />
          </div>
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

      <div className={classes.divider} />
      <div className={classes.sectionRow}>
        <span className={classes.sectionLabel}>{t('calendar.comments')}</span>
        {!!order?.project_comments?.length && (
          <button
            type="button"
            className={classes.sectionBtn}
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          >
            <span className={classes.sectionNote}>
              {order.project_comments!.length}
            </span>
            <ChevronLeft
              className={classNames(classes.sectionChevron, {
                [classes.sectionChevronOpen]: isCommentsOpen,
              })}
            />
          </button>
        )}
      </div>
      {isCommentsOpen &&
        !!order?.project_comments?.length &&
        order.project_comments.map((c) => (
          <div key={c.id} className={classes.commentContent}>
            <span className={classes.commentText}>{c.comment}</span>
            <span className={classes.commentDate}>
              {t('calendar.added_at', {
                date: dayjs(c.created_at).format('DD.MM.YYYY [kell] HH:mm'),
              })}
            </span>
          </div>
        ))}

      {showCostSection && (
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
          </div>
        </>
      )}
    </>
  )
}

export default CalendarTranslatorBody
