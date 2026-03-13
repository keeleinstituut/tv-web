import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import dayjs from 'dayjs'
import { BookedSlot, CalendarLanguage } from 'types/calendar'
import AttachIcon from 'assets/icons/attach.svg?react'
import ChevronLeft from 'assets/icons/chevron_left.svg?react'
import ArrowDownIcon from 'assets/icons/arrow_down.svg?react'
import AddIcon from 'assets/icons/add.svg?react'
import DownloadIcon from 'assets/icons/download.svg?react'
import DeleteIcon from 'assets/icons/delete.svg?react'
import classes from './classes.module.scss'

interface CalendarClientPastBodyProps {
  language: CalendarLanguage | undefined
  slot: BookedSlot | undefined
  date: string
  startTime: string
  duration: string
  isMetaOpen: boolean
  onSetIsMetaOpen: (v: boolean) => void
}

const CalendarClientPastBody: FC<CalendarClientPastBodyProps> = ({
  language,
  slot,
  date,
  startTime,
  duration,
  isMetaOpen,
  onSetIsMetaOpen,
}) => {
  const { t } = useTranslation()

  return (
    <>
      {/* Status badge + read-only fields */}
      <div className={classes.form}>
        <div className={classes.statusBadgeGrey}>
          {t('calendar.status_completed')}
        </div>

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

        {slot?.assignment?.service_type && (
          <>
            <div className={classes.formGroup}>
              <span className={classes.label}>{t('calendar.order_way')}</span>
              <span className={classes.readValue}>
                {slot.assignment.service_type === 'remote'
                  ? t('calendar.service_type_remote')
                  : t('calendar.service_type_contact')}
              </span>
            </div>
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
        <button className={classes.sectionBtn}>
          {t('calendar.add_short')}
          <AddIcon style={{ width: 16, height: 16 }} />
        </button>
      </div>
      {slot?.assignment?.files?.length ? (
        <div className={classes.fileList}>
          <div className={classes.fileListHeader}>
            {t('calendar.file_list_header')}
          </div>
          {slot.assignment.files.map((f, i) => (
            <div key={i} className={classes.fileItem}>
              <button className={classes.fileLink}>{f.name}</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className={classes.fileIconBtn}>
                  <DownloadIcon style={{ width: 24, height: 24 }} />
                </button>
                <button className={classes.fileIconBtn}>
                  <DeleteIcon style={{ width: 24, height: 24 }} />
                </button>
              </div>
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
      <div className={classes.commentForm}>
        <div className={classes.formGroup}>
          <span className={classes.label}>
            {t('calendar.add_comment_btn')}
          </span>
          <textarea
            className={classes.textarea}
            placeholder={t('calendar.write_text')}
          />
        </div>
      </div>
      {slot?.assignment?.comments?.map((c, i) => (
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
  )
}

export default CalendarClientPastBody
