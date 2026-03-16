import { FC, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import {
  useFetchCalendarOrderDetail,
  useUpdateCalendarOrder,
  useAcceptCalendarOrder,
  useCancelCalendarOrder,
  useCreateCalendarOrder,
  useFetchCalendarLanguages,
  useFetchSlotMatching,
} from 'hooks/requests/useCalendar'
import { useCalendarRole } from 'hooks/useCalendarRole'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import ArrowDownIcon from 'assets/icons/arrow_down.svg?react'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import classes from './classes.module.scss'

const CalendarOrderDetail: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const isCreateMode = !orderId
  const { isTPM, isTranslator } = useCalendarRole()
  const isClient = !isTPM && !isTranslator

  const { order, isLoading } = useFetchCalendarOrderDetail(isCreateMode ? null : (orderId ?? null))
  const { mutate: createOrder, isPending: isCreating } = useCreateCalendarOrder()
  const { mutate: updateOrder, isPending: isUpdating } = useUpdateCalendarOrder()
  const { mutate: acceptOrder, isPending: isAccepting } = useAcceptCalendarOrder()
  const { mutate: cancelOrder, isPending: isCancelling } = useCancelCalendarOrder()

  const { languages } = useFetchCalendarLanguages()
  const { classifierValues: domains } = useClassifierValuesFetch({
    type: ClassifierValueType.TranslationDomain,
  })

  // UI state
  const [metaOpen, setMetaOpen] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingDuration, setIsChangingDuration] = useState(false)
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false)
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [commentText, setCommentText] = useState('')

  // Editable field state
  const [kuupaev, setKuupaev] = useState('')
  const [algusaeg, setAlgusaeg] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [durationEndTime, setDurationEndTime] = useState('')
  const [serviceType, setServiceType] = useState<'remote' | 'on-site'>('on-site')
  const [aadress, setAadress] = useState('')
  const [tellija, setTellija] = useState('')
  const [viitenumber, setViitenumber] = useState('')
  const [languageId, setLanguageId] = useState('')
  const [domainId, setDomainId] = useState('')
  const [vendorId, setVendorId] = useState('')

  useEffect(() => {
    if (!order) return
    setKuupaev(dayjs(order.start_at).format('YYYY-MM-DD'))
    setAlgusaeg(dayjs(order.start_at).format('HH:mm'))
    setDurationMinutes(dayjs(order.end_at).diff(dayjs(order.start_at), 'minute'))
    setServiceType(order.service_type)
    setAadress(order.service_type === 'on-site' ? (order.location ?? '') : (order.meeting_link ?? ''))
    setTellija(order.client?.name ?? '')
    setViitenumber(order.reference_number ?? '')
  }, [order])

  const startIso = kuupaev && algusaeg ? `${kuupaev}T${algusaeg}:00` : null
  const endIso = startIso ? dayjs(startIso).add(durationMinutes, 'minute').toISOString() : null

  const slotMatchingParams =
    isTPM && isCreateMode && startIso && endIso && languageId
      ? { start_at: startIso, end_at: endIso, language_id: languageId }
      : null
  const { vendors } = useFetchSlotMatching(slotMatchingParams)

  if (isCreateMode && isTranslator) {
    navigate('/calendar', { replace: true })
    return null
  }

  if (!isCreateMode && (isLoading || !order)) {
    return <div className={classes.loading}>...</div>
  }

  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h === 0) return `${m} min`
    if (m === 0) return `${h} ${h === 1 ? 'tund' : 'tundi'}`
    return `${h}h ${m}min`
  }

  const fmt = (iso?: string) => (iso ? dayjs(iso).format('DD.MM.YYYY  HH:mm') : '–')

  // Detail-mode derived values (only used when order exists)
  const startDt = order ? dayjs(order.start_at) : null
  const endDt = order ? dayjs(order.end_at) : null
  const orderDurationMins = startDt && endDt ? endDt.diff(startDt, 'minute') : 0
  const durationLabel = formatMins(orderDurationMins)

  const statusLabel = order
    ? order.status === 'pending'
      ? t('calendar.status_pending')
      : order.status === 'confirmed'
        ? isTranslator
          ? t('calendar.status_ongoing')
          : t('calendar.status_confirmed')
        : order.status === 'cancelled'
          ? t('calendar.status_cancelled')
          : t('calendar.status_completed')
    : ''

  const isPast = order ? dayjs(order.start_at).isBefore(dayjs()) : false
  const canModify =
    (isTPM || isClient) &&
    !isPast &&
    order?.status !== 'cancelled' &&
    order?.status !== 'completed'

  const resetFields = () => {
    if (!order) return
    setKuupaev(dayjs(order.start_at).format('YYYY-MM-DD'))
    setAlgusaeg(dayjs(order.start_at).format('HH:mm'))
    setDurationMinutes(orderDurationMins)
    setServiceType(order.service_type)
    setAadress(order.service_type === 'on-site' ? (order.location ?? '') : (order.meeting_link ?? ''))
    setTellija(order.client?.name ?? '')
    setViitenumber(order.reference_number ?? '')
  }

  const handleCreate = () => {
    if (!languageId || !startIso || !endIso) return
    createOrder(
      {
        language_id: languageId,
        start_at: startIso,
        end_at: endIso,
        service_type: serviceType,
        reference_number: viitenumber || undefined,
        location: serviceType === 'on-site' ? aadress : undefined,
        meeting_link: serviceType === 'remote' ? aadress : undefined,
        client_institution_id: isTPM ? tellija || undefined : undefined,
        domain_id: domainId || undefined,
        vendor_id: isTPM ? vendorId || undefined : undefined,
      },
      {
        onSuccess: (data) => {
          navigate(`/calendar/${data.id}`)
          showNotification({
            type: NotificationTypes.Success,
            title: t('notification.announcement'),
            content: t('success.calendar_order_created'),
          })
        },
      }
    )
  }

  const handleSave = () => {
    if (!orderId) return
    const saveStart = `${kuupaev}T${algusaeg}:00`
    const saveEnd = dayjs(saveStart).add(durationMinutes, 'minute').toISOString()
    updateOrder(
      {
        id: orderId,
        start_at: saveStart,
        end_at: saveEnd,
        service_type: serviceType,
        location: serviceType === 'on-site' ? aadress : undefined,
        meeting_link: serviceType === 'remote' ? aadress : undefined,
        reference_number: viitenumber || undefined,
        client_institution_id: isTPM ? tellija || undefined : undefined,
      },
      {
        onSuccess: () => {
          setIsEditing(false)
          showNotification({
            type: NotificationTypes.Success,
            title: t('notification.announcement'),
            content: t('success.calendar_order_updated'),
          })
        },
      }
    )
  }

  const handleSaveDuration = () => {
    if (!orderId || !order || !durationEndTime) return
    const date = dayjs(order.start_at).format('YYYY-MM-DD')
    const endIsoNew = `${date}T${durationEndTime}:00`
    updateOrder(
      { id: orderId, end_at: endIsoNew },
      {
        onSuccess: () => {
          setIsChangingDuration(false)
          showNotification({
            type: NotificationTypes.Success,
            title: t('notification.announcement'),
            content: t('success.calendar_order_updated'),
          })
        },
      }
    )
  }

  const handleAccept = () => {
    if (!orderId) return
    acceptOrder(orderId, {
      onSuccess: () => {
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.calendar_order_accepted'),
        })
      },
    })
  }

  const handleCancelOrder = () => {
    if (!orderId) return
    cancelOrder(orderId, {
      onSuccess: () => {
        setIsConfirmingCancel(false)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.calendar_order_cancelled'),
        })
      },
    })
  }

  const renderSummaryFields = () => {
    if (isCreateMode) {
      return (
        <>
          {isTPM && (
            <div className={classes.field}>
              <span className={classes.fieldLabel}>{t('calendar.client')}</span>
              <input
                className={classes.editInput}
                value={tellija}
                onChange={(e) => setTellija(e.target.value)}
                placeholder={t('calendar.enter_name')}
              />
            </div>
          )}
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
            <select
              className={classes.editSelect}
              value={languageId}
              onChange={(e) => {
                setLanguageId(e.target.value)
                setVendorId('')
              }}
            >
              <option value="" disabled>
                {t('calendar.select_language')}
              </option>
              {languages.map((lang) => (
                <option key={lang.language.id} value={lang.language.id}>
                  {lang.language.name}
                </option>
              ))}
            </select>
          </div>
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.date_and_start_time')}</span>
            <div className={classes.timeRow}>
              <input
                type="date"
                className={classes.editInput}
                value={kuupaev}
                onChange={(e) => setKuupaev(e.target.value)}
              />
              <input
                type="time"
                className={classes.editInputNarrow}
                value={algusaeg}
                onChange={(e) => setAlgusaeg(e.target.value)}
              />
            </div>
          </div>
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.duration')}</span>
            <div className={classes.durationStepper}>
              <button
                className={classes.stepperBtn}
                onClick={() => setDurationMinutes((v) => Math.max(30, v - 30))}
              >
                −
              </button>
              <span className={classes.stepperValue}>{formatMins(durationMinutes)}</span>
              <button
                className={classes.stepperBtn}
                onClick={() => setDurationMinutes((v) => v + 30)}
              >
                +
              </button>
            </div>
          </div>
        </>
      )
    }

    if (isTranslator) {
      return (
        <>
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.language')}</span>
            <span className={classes.fieldValue}>{order!.language.name}</span>
          </div>
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.date_and_time')}</span>
            <span className={classes.fieldValue}>
              {startDt!.format('DD.MM.YYYY')} / {startDt!.format('HH:mm')}
            </span>
          </div>
          {isChangingDuration ? (
            <div className={classes.field}>
              <span className={classes.fieldLabel}>{t('calendar.duration_until')} *</span>
              <input
                type="time"
                className={classes.editInputNarrow}
                value={durationEndTime}
                onChange={(e) => setDurationEndTime(e.target.value)}
                autoFocus
              />
              <div style={{ marginTop: 8 }}>
                <Button
                  appearance={AppearanceTypes.Primary}
                  onClick={handleSaveDuration}
                  disabled={isUpdating || !durationEndTime}
                >
                  {isUpdating ? t('calendar.saving') : t('calendar.save')}
                </Button>
              </div>
            </div>
          ) : (
            <div className={classes.field}>
              <span className={classes.fieldLabel}>{t('calendar.duration')}</span>
              <span className={classes.fieldValue}>{durationLabel}</span>
              <Button
                appearance={AppearanceTypes.Secondary}
                onClick={() => {
                  setDurationEndTime(endDt ? endDt.format('HH:mm') : '')
                  setIsChangingDuration(true)
                }}
                disabled={order!.status === 'pending'}
              >
                {t('calendar.change_duration_btn')}
              </Button>
            </div>
          )}
        </>
      )
    }

    if (!isEditing) {
      return (
        <>
          {isTPM && (
            <>
              <div className={classes.field}>
                <span className={classes.fieldLabel}>{t('calendar.client')}</span>
                <span className={classes.fieldValue}>{order!.client?.name || '–'}</span>
              </div>
              <div className={classes.field}>
                <span className={classes.fieldLabel}>{t('calendar.reference_number')}</span>
                <span className={classes.fieldValue}>{order!.reference_number || '–'}</span>
              </div>
            </>
          )}
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.language')}</span>
            <span className={classes.fieldValue}>{order!.language.name}</span>
          </div>
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.date_and_time')}</span>
            <span className={classes.fieldValue}>
              {startDt!.format('DD.MM.YYYY')} / {startDt!.format('HH:mm')}
            </span>
          </div>
          <div className={classes.field}>
            <span className={classes.fieldLabel}>{t('calendar.duration')}</span>
            <span className={classes.fieldValue}>{durationLabel}</span>
          </div>
        </>
      )
    }

    // Edit mode
    return (
      <>
        {isTPM && (
          <>
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
          </>
        )}
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.language')}</span>
          <span className={classes.fieldValue}>{order!.language.name}</span>
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.date_and_start_time')}</span>
          <div className={classes.timeRow}>
            <input
              type="date"
              className={classes.editInput}
              value={kuupaev}
              onChange={(e) => setKuupaev(e.target.value)}
            />
            <input
              type="time"
              className={classes.editInputNarrow}
              value={algusaeg}
              onChange={(e) => setAlgusaeg(e.target.value)}
            />
          </div>
        </div>
        <div className={classes.field}>
          <span className={classes.fieldLabel}>{t('calendar.duration')}</span>
          <div className={classes.durationStepper}>
            <button
              className={classes.stepperBtn}
              onClick={() => setDurationMinutes((v) => Math.max(30, v - 30))}
            >
              −
            </button>
            <span className={classes.stepperValue}>{formatMins(durationMinutes)}</span>
            <button
              className={classes.stepperBtn}
              onClick={() => setDurationMinutes((v) => v + 30)}
            >
              +
            </button>
          </div>
        </div>
      </>
    )
  }

  const isServiceEditable = isCreateMode || isEditing
  const activeServiceType = isServiceEditable ? serviceType : order?.service_type ?? 'on-site'

  return (
    <div className={classes.page}>
      {/* Top actions — detail mode only */}
      {!isCreateMode && (
        <div className={classes.topActions}>
          {isTPM && order?.status === 'pending' && (
            <Button
              appearance={AppearanceTypes.Primary}
              onClick={handleAccept}
              disabled={isAccepting}
            >
              {t('calendar.confirm_order')}
            </Button>
          )}
          {isTranslator && order?.status === 'pending' && (
            <Button
              appearance={AppearanceTypes.Primary}
              onClick={handleAccept}
              disabled={isAccepting}
            >
              {t('calendar.confirm_order')}
            </Button>
          )}
          {isTranslator && (order?.status === 'confirmed' || order?.status === 'completed') && !isChangingDuration && (
            <Button
              appearance={AppearanceTypes.Secondary}
              onClick={() => cancelOrder(orderId!, {
                onSuccess: () => {
                  showNotification({
                    type: NotificationTypes.Success,
                    title: t('notification.announcement'),
                    content: t('success.calendar_order_cancelled'),
                  })
                },
              })}
              disabled={isCancelling}
            >
              {t('calendar.cancel_booking')}
            </Button>
          )}
          {isTranslator && isChangingDuration && (
            <Button
              appearance={AppearanceTypes.Primary}
              onClick={handleSaveDuration}
              disabled={isUpdating || !durationEndTime}
            >
              {isUpdating ? t('calendar.saving') : t('calendar.save_changes_btn')}
            </Button>
          )}
          {canModify && !isEditing && !isConfirmingCancel && (
            <>
              <Button
                appearance={AppearanceTypes.Secondary}
                onClick={() => setIsEditing(true)}
              >
                {t('calendar.edit')}
              </Button>
              <Button
                appearance={AppearanceTypes.Secondary}
                onClick={() => setIsConfirmingCancel(true)}
              >
                {t('calendar.cancel_order')}
              </Button>
            </>
          )}
          {isConfirmingCancel && (
            <>
              <span className={classes.cancelPrompt}>
                {t('calendar.cancel_order_confirm')}
              </span>
              <Button
                appearance={AppearanceTypes.Primary}
                onClick={handleCancelOrder}
                disabled={isCancelling}
              >
                {t('calendar.void_confirm_yes')}
              </Button>
              <Button
                appearance={AppearanceTypes.Secondary}
                onClick={() => setIsConfirmingCancel(false)}
              >
                {t('calendar.void_confirm_no')}
              </Button>
            </>
          )}
        </div>
      )}

      {/* Card 1: Summary */}
      <div className={classes.card}>
        <div className={classes.cardHeader}>
          {isCreateMode ? (
            <h1 className={classes.orderTitle}>{t('calendar.add_order')}</h1>
          ) : (
            <>
              <h1 className={classes.orderTitle}>
                {t('calendar.order_prefix')} {order!.ext_id}
              </h1>
              <span className={classes.statusBadge}>{statusLabel}</span>
            </>
          )}
        </div>

        <div className={classes.summaryGrid}>
          <div className={classes.summaryLeft}>{renderSummaryFields()}</div>

          {!isCreateMode && (
            <div className={classes.timestamps}>
              <div className={classes.tsRow}>
                <span className={classes.tsLabel}>{t('calendar.created_at_label')}</span>
                <span className={classes.tsValue}>{fmt(order!.created_at)}</span>
              </div>
              <div className={classes.tsRow}>
                <span className={classes.tsLabel}>{t('calendar.updated_at_label')}</span>
                <span className={classes.tsValue}>{fmt(order!.updated_at)}</span>
              </div>
              <div className={classes.tsRow}>
                <span className={classes.tsLabel}>{t('calendar.accepted_at_label')}</span>
                <span className={classes.tsValue}>{fmt(order!.accepted_at)}</span>
              </div>
              <div className={classes.tsRow}>
                <span className={classes.tsLabel}>{t('calendar.cancelled_at_label')}</span>
                <span className={classes.tsValue}>{fmt(order!.cancelled_at)}</span>
              </div>
              <div className={classes.tsRow}>
                <span className={classes.tsLabel}>{t('calendar.completed_at_label')}</span>
                <span className={classes.tsValue}>{fmt(order!.completed_at)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Edit footer for Client/TPM (detail mode) */}
        {isEditing && (
          <div className={classes.editFooter}>
            <Button
              appearance={AppearanceTypes.Primary}
              onClick={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? t('calendar.saving') : t('calendar.save')}
            </Button>
            <Button
              appearance={AppearanceTypes.Secondary}
              onClick={() => {
                resetFields()
                setIsEditing(false)
              }}
            >
              {t('calendar.cancel_changes')}
            </Button>
          </div>
        )}

        {/* Collapsible metadata — detail mode only */}
        {!isCreateMode && (
          <>
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
                {order!.reference_number && (
                  <div className={classes.metaField}>
                    <span className={classes.metaLabel}>{t('calendar.order_id_label')}</span>
                    <span className={classes.metaValue}>{order!.reference_number}</span>
                  </div>
                )}
                {order!.client && (
                  <>
                    <div className={classes.metaRow}>
                      <div className={classes.metaField}>
                        <span className={classes.metaLabel}>{t('calendar.client_name')}</span>
                        <span className={classes.metaValue}>{order!.client.name}</span>
                      </div>
                      <div className={classes.metaField}>
                        <span className={classes.metaLabel}>{t('calendar.institution')}</span>
                        <span className={classes.metaValue}>{order!.client.institution}</span>
                      </div>
                    </div>
                    <div className={classes.metaRow}>
                      <div className={classes.metaField}>
                        <span className={classes.metaLabel}>{t('calendar.email')}</span>
                        <span className={classes.metaValue}>{order!.client.email}</span>
                      </div>
                      <div className={classes.metaField}>
                        <span className={classes.metaLabel}>{t('calendar.phone')}</span>
                        <span className={classes.metaValue}>{order!.client.phone}</span>
                      </div>
                    </div>
                  </>
                )}
                {order!.coordinator && (
                  <>
                    <div className={classes.metaField}>
                      <span className={classes.metaLabel}>{t('calendar.coordinator_name')}</span>
                      <span className={classes.metaValue}>{order!.coordinator.name}</span>
                    </div>
                    <div className={classes.metaRow}>
                      <div className={classes.metaField}>
                        <span className={classes.metaLabel}>{t('calendar.email')}</span>
                        <span className={classes.metaValue}>{order!.coordinator.email}</span>
                      </div>
                      <div className={classes.metaField}>
                        <span className={classes.metaLabel}>{t('calendar.phone')}</span>
                        <span className={classes.metaValue}>{order!.coordinator.phone}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Card 2: Order details */}
      <div className={classes.card}>
        <h2 className={classes.sectionTitle}>{t('calendar.order_details_title')}</h2>
        <div className={classes.detailsGrid}>
          <div className={classes.detailsLeft}>
            <div className={classes.field}>
              <span className={classes.fieldLabel}>{t('calendar.order_way')}</span>
              {isServiceEditable ? (
                <div className={classes.serviceToggle}>
                  <button
                    className={`${classes.serviceOption} ${serviceType === 'on-site' ? classes.serviceOptionActive : ''}`}
                    onClick={() => {
                      setServiceType('on-site')
                      setAadress('')
                    }}
                  >
                    {t('calendar.service_type_contact')}
                  </button>
                  <button
                    className={`${classes.serviceOption} ${serviceType === 'remote' ? classes.serviceOptionActive : ''}`}
                    onClick={() => {
                      setServiceType('remote')
                      setAadress('')
                    }}
                  >
                    {t('calendar.service_type_remote')}
                  </button>
                </div>
              ) : (
                <div className={classes.serviceToggle}>
                  <span
                    className={`${classes.serviceOption} ${order!.service_type === 'on-site' ? classes.serviceOptionActive : ''}`}
                  >
                    {t('calendar.service_type_contact')}
                  </span>
                  <span
                    className={`${classes.serviceOption} ${order!.service_type === 'remote' ? classes.serviceOptionActive : ''}`}
                  >
                    {t('calendar.service_type_remote')}
                  </span>
                </div>
              )}
            </div>

            <div className={classes.field}>
              <span className={classes.fieldLabel}>
                {activeServiceType === 'on-site'
                  ? t('calendar.location')
                  : t('calendar.meeting_link')}
              </span>
              {isServiceEditable ? (
                <input
                  className={classes.editInput}
                  value={aadress}
                  onChange={(e) => setAadress(e.target.value)}
                  placeholder={
                    activeServiceType === 'on-site'
                      ? t('calendar.enter_address')
                      : t('calendar.enter_link')
                  }
                />
              ) : isTranslator ? (
                order!.service_type === 'on-site' ? (
                  <div className={classes.readonlyInput}>{order!.location}</div>
                ) : (
                  <a
                    className={classes.meetingLink}
                    href={order!.meeting_link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {order!.meeting_link}
                  </a>
                )
              ) : (
                <span className={classes.fieldValue}>
                  {order!.service_type === 'on-site' ? order!.location : order!.meeting_link}
                </span>
              )}
            </div>

            <div className={classes.field}>
              <span className={classes.fieldLabel}>{t('calendar.domain')}</span>
              {isCreateMode ? (
                <select
                  className={classes.editSelect}
                  value={domainId}
                  onChange={(e) => setDomainId(e.target.value)}
                >
                  <option value="">{t('calendar.select_domain')}</option>
                  {(domains ?? []).map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              ) : order!.domain ? (
                <span className={classes.domainChip}>{order!.domain}</span>
              ) : null}
            </div>

            {isTPM && isCreateMode && (
              <div className={classes.field}>
                <span className={classes.fieldLabel}>{t('calendar.translator')}</span>
                <select
                  className={classes.editSelect}
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
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

          <div className={classes.detailsRight}>
            <div className={classes.filesSection}>
              <div className={classes.filesSectionHeader}>
                <span className={classes.filesSectionTitle}>
                  {isClient ? t('calendar.files_and_links') : t('calendar.attachments')}
                </span>
                {isTPM && (
                  <Button appearance={AppearanceTypes.Primary}>
                    {t('calendar.add_file')}
                  </Button>
                )}
              </div>
              {!isCreateMode && order!.files_count === 0 && isTPM ? (
                <div className={classes.noFilesRow}>
                  <span>{t('calendar.no_files_msg')}</span>
                </div>
              ) : !isCreateMode && order!.files_count > 0 ? (
                <div className={classes.fileTable}>
                  <div className={classes.fileTableHeader}>
                    <span>{t('calendar.file_list_header')}</span>
                    <span>{t('calendar.updated_at_label')}</span>
                  </div>
                  {Array.from({ length: order!.files_count }).map((_, i) => (
                    <div key={i} className={classes.fileRow}>
                      <span>Faili_nimi.doc</span>
                      <div className={classes.fileRowActions}>
                        <span className={classes.fileDate}>dd.mm.yyyy hh:mm</span>
                        <button className={classes.fileIconBtn} title="Laadi alla">
                          ↓
                        </button>
                        {isClient && (
                          <button className={classes.fileIconBtn} title="Kustuta">
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : isCreateMode && isTPM ? (
                <div className={classes.noFilesRow}>
                  <span>{t('calendar.no_files_msg')}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Card 3: Comments */}
      <div className={classes.card}>
        <h2 className={classes.sectionTitle}>{t('calendar.comments')}</h2>
        <div className={classes.comments}>
          {!isCreateMode &&
            order!.comments.map((c, i) => (
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
                      {t('calendar.edit')}
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        {isAddingComment ? (
          <div className={classes.commentForm}>
            <textarea
              className={classes.commentTextarea}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={t('calendar.write_text')}
              autoFocus
            />
            <div className={classes.commentFormActions}>
              <Button
                appearance={AppearanceTypes.Primary}
                disabled={!commentText.trim()}
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
        ) : (
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={() => setIsAddingComment(true)}
          >
            {t('calendar.add_comment_btn')}
          </Button>
        )}
      </div>

      {/* Create mode footer */}
      {isCreateMode && (
        <div className={classes.editFooter}>
          <Button
            appearance={AppearanceTypes.Primary}
            onClick={handleCreate}
            disabled={!languageId || !startIso || !endIso || isCreating}
          >
            {isCreating ? t('calendar.saving') : t('calendar.create_order')}
          </Button>
          <Button
            appearance={AppearanceTypes.Secondary}
            onClick={() => navigate('/calendar')}
          >
            {t('calendar.cancel')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default CalendarOrderDetail
