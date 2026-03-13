import { FC, useState, useEffect } from 'react'
import { useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { useFetchCalendarOrderDetail } from 'hooks/requests/useCalendar'
import { useCalendarRole } from 'hooks/useCalendarRole'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import ArrowDownIcon from 'assets/icons/arrow_down.svg?react'
import classes from './classes.module.scss'

const CalendarOrderDetail: FC = () => {
  const { t } = useTranslation()
  const { orderId } = useParams<{ orderId: string }>()
  const { isTPM, isTranslator } = useCalendarRole()
  const isClient = !isTPM && !isTranslator
  const { order, isLoading } = useFetchCalendarOrderDetail(orderId ?? null)
  const [metaOpen, setMetaOpen] = useState(true)

  // Editable field state (Client + TPM)
  const [keel, setKeel] = useState('')
  const [kuupaev, setKuupaev] = useState('')
  const [algusaeg, setAlgusaeg] = useState('')
  const [kestus, setKestus] = useState('')
  const [aadress, setAadress] = useState('')
  // TPM only
  const [tellija, setTellija] = useState('')
  const [viitenumber, setViitenumber] = useState('')
  const [teostaja, setTeostaja] = useState('')
  // Teostaja comment
  const [commentText, setCommentText] = useState('')

  useEffect(() => {
    if (!order) return
    setKeel(order.language.name)
    setKuupaev(dayjs(order.start_at).format('DD.MM.YYYY'))
    setAlgusaeg(dayjs(order.start_at).format('HH:mm'))
    setKestus(String(dayjs(order.end_at).diff(dayjs(order.start_at), 'minute')))
    setAadress(order.location ?? '')
    setTellija(order.client?.name ?? '')
    setViitenumber(order.reference_number ?? '')
  }, [order])

  if (isLoading || !order) {
    return <div className={classes.loading}>...</div>
  }

  const startDt = dayjs(order.start_at)
  const endDt = dayjs(order.end_at)
  const durationMins = endDt.diff(startDt, 'minute')
  const durationLabel =
    durationMins < 60
      ? `${durationMins} min`
      : durationMins % 60 === 0
        ? `${durationMins / 60} ${durationMins / 60 === 1 ? 'tund' : 'tundi'}`
        : `${Math.floor(durationMins / 60)}h ${durationMins % 60}min`

  const fmt = (iso?: string) =>
    iso ? dayjs(iso).format('DD.MM.YYYY  HH:mm') : '–'

  const statusLabel =
    order.status === 'pending'
      ? t('calendar.status_pending')
      : order.status === 'confirmed'
        ? isTranslator
          ? t('calendar.status_ongoing')
          : t('calendar.status_confirmed')
        : order.status === 'cancelled'
          ? t('calendar.status_cancelled')
          : t('calendar.status_completed')

  const renderCard1Left = () => {
    if (isTranslator) {
      return (
        <>
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.language')}</span>
            <span className={classes.fieldValue}>{order.language.name}</span>
          </div>
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.date_and_time')}</span>
            <span className={classes.fieldValue}>
              {startDt.format('DD.MM.YYYY')} / {startDt.format('HH:mm')}
            </span>
          </div>
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.duration')}</span>
            <span className={classes.fieldValue}>{durationLabel}</span>
          </div>
          <Button appearance={AppearanceTypes.Primary}>
            {t('calendar.change_duration_btn')}
          </Button>
        </>
      )
    }

    if (isClient) {
      return (
        <>
          <p className={classes.requiredNotice}>{t('calendar.required_fields_notice')}</p>
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.language')}</span>
            <input
              className={classes.editInput}
              value={keel}
              onChange={(e) => setKeel(e.target.value)}
            />
          </div>
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.date_and_time')}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className={classes.editInput}
                value={kuupaev}
                onChange={(e) => setKuupaev(e.target.value)}
                placeholder="pp.kk.aaaa"
              />
              <input
                className={classes.editInput}
                style={{ width: 100, flexShrink: 0 }}
                value={algusaeg}
                onChange={(e) => setAlgusaeg(e.target.value)}
                placeholder="hh:mm"
              />
            </div>
          </div>
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.duration')}</span>
            <input
              className={classes.editInput}
              style={{ width: 120 }}
              value={kestus}
              onChange={(e) => setKestus(e.target.value)}
              placeholder="min"
            />
          </div>
        </>
      )
    }

    // TPM
    return (
      <>
        <p className={classes.requiredNotice}>{t('calendar.required_fields_notice')}</p>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.client')}</span>
          <input
            className={classes.editInput}
            value={tellija}
            onChange={(e) => setTellija(e.target.value)}
            placeholder={t('calendar.enter_name')}
          />
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.reference_number')}</span>
          <input
            className={classes.editInput}
            value={viitenumber}
            onChange={(e) => setViitenumber(e.target.value)}
            placeholder={t('calendar.enter_number')}
          />
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.language')}</span>
          <input
            className={classes.editInput}
            value={keel}
            onChange={(e) => setKeel(e.target.value)}
          />
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.date_and_start_time')}</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className={classes.editInput}
              value={kuupaev}
              onChange={(e) => setKuupaev(e.target.value)}
              placeholder="pp.kk.aaaa"
            />
            <input
              className={classes.editInput}
              style={{ width: 100, flexShrink: 0 }}
              value={algusaeg}
              onChange={(e) => setAlgusaeg(e.target.value)}
              placeholder="hh:mm"
            />
          </div>
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.duration')}</span>
          <input
            className={classes.editInput}
            style={{ width: 120 }}
            value={kestus}
            onChange={(e) => setKestus(e.target.value)}
            placeholder="min"
          />
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.translator')}</span>
          <input
            className={classes.editInput}
            value={teostaja}
            onChange={(e) => setTeostaja(e.target.value)}
            placeholder={t('calendar.select_translator')}
          />
        </div>
      </>
    )
  }

  const renderFilesSection = () => {
    const title = isClient
      ? t('calendar.files_and_links')
      : t('calendar.attachments')

    return (
      <div className={classes.filesSection}>
        <div className={classes.filesSectionHeader}>
          <span className={classes.filesSectionTitle}>{title}</span>
          {isTPM && (
            <Button appearance={AppearanceTypes.Primary}>
              {t('calendar.add_file')}
            </Button>
          )}
        </div>
        {order.files_count === 0 && isTPM ? (
          <div className={classes.noFilesRow}>
            <span>{t('calendar.no_files_msg')}</span>
          </div>
        ) : order.files_count > 0 ? (
          <div className={classes.fileTable}>
            <div className={classes.fileTableHeader}>
              <span>{t('calendar.file_list_header')}</span>
              <span>{t('calendar.updated_at_label')}</span>
            </div>
            {Array.from({ length: order.files_count }).map((_, i) => (
              <div key={i} className={classes.fileRow}>
                <span>Faili_nimi.doc</span>
                <div className={classes.fileRowActions}>
                  <span className={classes.fileDate}>dd.mm.yyyy hh:mm</span>
                  <button className={classes.fileIconBtn} title="Laadi alla">↓</button>
                  {isClient && (
                    <button className={classes.fileIconBtn} title="Kustuta">✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    )
  }

  const renderComments = () => (
    <div className={classes.card}>
      <h2 className={classes.sectionTitle}>{t('calendar.comments')}</h2>
      <div className={classes.comments}>
        {order.comments.map((c, i) => (
          <div key={i} className={classes.comment}>
            <span className={classes.commentAuthor}>{c.role}</span>
            <span className={classes.commentText}>{c.text}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className={classes.commentDate}>
                {t('calendar.added_at_label', {
                  date: dayjs(c.created_at).format('DD.MM.YYYY [kell] HH:mm'),
                })}
              </span>
              {(isTPM || isClient) && (
                <button className={classes.commentEditLink}>
                  {t('calendar.edit_comment')}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isTranslator ? (
        <div className={classes.commentForm}>
          <span className={classes.commentFormAuthor}>{t('calendar.comments')}</span>
          <textarea
            className={classes.commentTextarea}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={t('calendar.write_text')}
          />
          <div>
            <Button appearance={AppearanceTypes.Primary}>
              {t('calendar.send_comment')}
            </Button>
          </div>
        </div>
      ) : (
        <Button appearance={AppearanceTypes.Secondary}>
          {t('calendar.add_comment_btn')}
        </Button>
      )}
    </div>
  )

  return (
    <div className={classes.page}>
      {/* Top action */}
      {(isTPM || isTranslator) && order.status === 'pending' && (
        <div className={classes.topActions}>
          <Button appearance={AppearanceTypes.Primary}>
            {t('calendar.confirm_order')}
          </Button>
        </div>
      )}

      {/* Card 1: Order summary */}
      <div className={classes.card}>
        <div className={classes.cardHeader}>
          <h1 className={classes.orderTitle}>
            {t('calendar.order_prefix')} {order.ext_id}
          </h1>
          <span className={classes.statusBadge}>{statusLabel}</span>
        </div>

        <div className={classes.summaryGrid}>
          <div className={classes.summaryLeft}>
            {renderCard1Left()}
          </div>

          {/* Right: timestamps */}
          <div className={classes.timestamps}>
            <div className={classes.tsRow}>
              <span className={classes.tsLabel}>{t('calendar.created_at_label')}</span>
              <span className={classes.tsValue}>{fmt(order.created_at)}</span>
            </div>
            <div className={classes.tsRow}>
              <span className={classes.tsLabel}>{t('calendar.updated_at_label')}</span>
              <span className={classes.tsValue}>{fmt(order.updated_at)}</span>
            </div>
            <div className={classes.tsRow}>
              <span className={classes.tsLabel}>{t('calendar.accepted_at_label')}</span>
              <span className={classes.tsValue}>{fmt(order.accepted_at)}</span>
            </div>
            <div className={classes.tsRow}>
              <span className={classes.tsLabel}>{t('calendar.cancelled_at_label')}</span>
              <span className={classes.tsValue}>{fmt(order.cancelled_at)}</span>
            </div>
            <div className={classes.tsRow}>
              <span className={classes.tsLabel}>{t('calendar.completed_at_label')}</span>
              <span className={classes.tsValue}>{fmt(order.completed_at)}</span>
            </div>
          </div>
        </div>

        {/* Collapsible metadata */}
        <button
          className={classes.metaToggle}
          onClick={() => setMetaOpen((v) => !v)}
        >
          <ArrowDownIcon
            className={`${classes.metaIcon} ${metaOpen ? classes.metaIconOpen : ''}`}
          />
          <span>{t('calendar.order_metadata')}</span>
        </button>

        {metaOpen && (
          <div className={classes.metaContent}>
            {order.reference_number && (
              <div className={classes.metaField}>
                <span className={classes.metaLabel}>{t('calendar.order_id_label')}</span>
                <span className={classes.metaValue}>{order.reference_number}</span>
              </div>
            )}
            {order.client && (
              <>
                <div className={classes.metaRow}>
                  <div className={classes.metaField}>
                    <span className={classes.metaLabel}>{t('calendar.client_name')}</span>
                    <span className={classes.metaValue}>{order.client.name}</span>
                  </div>
                  <div className={classes.metaField}>
                    <span className={classes.metaLabel}>{t('calendar.institution')}</span>
                    <span className={classes.metaValue}>{order.client.institution}</span>
                  </div>
                </div>
                <div className={classes.metaRow}>
                  <div className={classes.metaField}>
                    <span className={classes.metaLabel}>{t('calendar.email')}</span>
                    <span className={classes.metaValue}>{order.client.email}</span>
                  </div>
                  <div className={classes.metaField}>
                    <span className={classes.metaLabel}>{t('calendar.phone')}</span>
                    <span className={classes.metaValue}>{order.client.phone}</span>
                  </div>
                </div>
              </>
            )}
            {order.coordinator && (
              <>
                <div className={classes.metaField}>
                  <span className={classes.metaLabel}>{t('calendar.coordinator_name')}</span>
                  <span className={classes.metaValue}>{order.coordinator.name}</span>
                </div>
                <div className={classes.metaRow}>
                  <div className={classes.metaField}>
                    <span className={classes.metaLabel}>{t('calendar.email')}</span>
                    <span className={classes.metaValue}>{order.coordinator.email}</span>
                  </div>
                  <div className={classes.metaField}>
                    <span className={classes.metaLabel}>{t('calendar.phone')}</span>
                    <span className={classes.metaValue}>{order.coordinator.phone}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Card 2: Order details */}
      <div className={classes.card}>
        <h2 className={classes.sectionTitle}>{t('calendar.order_details_title')}</h2>
        <div className={classes.detailsGrid}>
          {/* Left: service type + location + domain */}
          <div className={classes.detailsLeft}>
            <div className={classes.field}>
              <span className={classes.fieldLabel}>{t('calendar.order_way')}</span>
              <div className={classes.serviceToggle}>
                <span
                  className={`${classes.serviceOption} ${order.service_type === 'on-site' ? classes.serviceOptionActive : ''}`}
                >
                  {t('calendar.service_type_contact')}
                </span>
                <span
                  className={`${classes.serviceOption} ${order.service_type === 'remote' ? classes.serviceOptionActive : ''}`}
                >
                  {t('calendar.service_type_remote')}
                </span>
              </div>
            </div>
            {order.location && (
              <div className={classes.field}>
                <span className={classes.fieldLabel}>
                  {order.service_type === 'on-site'
                    ? t('calendar.location')
                    : t('calendar.meeting_link')}
                </span>
                {isTranslator ? (
                  <div className={classes.readonlyInput}>{order.location}</div>
                ) : (
                  <input
                    className={classes.editInput}
                    value={aadress}
                    onChange={(e) => setAadress(e.target.value)}
                  />
                )}
              </div>
            )}
            {order.domain && (
              <div className={classes.field}>
                <span className={classes.fieldLabel}>{t('calendar.domain')}</span>
                <span className={classes.domainChip}>{order.domain}</span>
              </div>
            )}
          </div>

          {/* Right: files */}
          <div className={classes.detailsRight}>
            {renderFilesSection()}
          </div>
        </div>
      </div>

      {/* Card 3: Comments */}
      {renderComments()}
    </div>
  )
}

export default CalendarOrderDetail
