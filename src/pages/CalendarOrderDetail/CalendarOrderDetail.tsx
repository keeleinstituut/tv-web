import { FC, useState, useEffect, useRef } from 'react'
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
  useFetchCalendarTags,
} from 'hooks/requests/useCalendar'
import { useCalendarRole } from 'hooks/useCalendarRole'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useIsMobile } from 'hooks/useIsMobile'
import { OrderDetailContext } from './OrderDetailContext'
import OrderTopActions from './OrderTopActions'
import OrderSummaryCard from './OrderSummaryCard'
import OrderDetailsCard from './OrderDetailsCard'
import OrderCommentsCard from './OrderCommentsCard'
import CalendarMobileWizard from './CalendarMobileWizard'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import classes from './classes.module.scss'

const CalendarOrderDetail: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const isCreateMode = !orderId
  const isMobile = useIsMobile()
  const { isTPM, isTranslator } = useCalendarRole()
  const isClient = !isTPM && !isTranslator

  const { order, isLoading } = useFetchCalendarOrderDetail(
    isCreateMode ? null : (orderId ?? null)
  )
  const { mutate: createOrder, isPending: isCreating } =
    useCreateCalendarOrder()
  const { mutate: updateOrder, isPending: isUpdating } =
    useUpdateCalendarOrder()
  const { mutate: acceptOrder, isPending: isAccepting } =
    useAcceptCalendarOrder()
  const { mutate: cancelOrder, isPending: isCancelling } =
    useCancelCalendarOrder()

  const { languages } = useFetchCalendarLanguages()
  const { tags: domains } = useFetchCalendarTags()

  // UI state
  const [metaOpen, setMetaOpen] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingDuration, setIsChangingDuration] = useState(false)
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [editingCommentIdx, setEditingCommentIdx] = useState<number | null>(
    null
  )
  const [editingCommentText, setEditingCommentText] = useState('')

  // Editable field state
  const [selectedDate, setSelectedDate] = useState('')
  const [startTimeInput, setStartTimeInput] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [durationEndTime, setDurationEndTime] = useState('')
  const [serviceType, setServiceType] = useState<'REMOTE' | 'ON_SITE'>(
    'ON_SITE'
  )
  const [address, setAddress] = useState('')
  const [clientInstitutionId, setClientInstitutionId] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [languageId, setLanguageId] = useState('')
  const [domainIds, setDomainIds] = useState<string[]>([])
  const [vendorId, setVendorId] = useState('')

  // File upload state
  const [localFiles, setLocalFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mobile wizard state (create mode only)
  const [mobileCreatedAt, setMobileCreatedAt] = useState<string | null>(null)
  const [mobileCreatedOrderId, setMobileCreatedOrderId] = useState<
    string | null
  >(null)

  useEffect(() => {
    if (!order) return
    setSelectedDate(dayjs(order.start_at).format('YYYY-MM-DD'))
    setStartTimeInput(dayjs(order.start_at).format('HH:mm'))
    setDurationMinutes(
      dayjs(order.end_at).diff(dayjs(order.start_at), 'minute')
    )
    setServiceType(order.service_type)
    setAddress(
      order.service_type === 'ON_SITE'
        ? (order.location ?? '')
        : (order.meeting_link ?? '')
    )
    setClientInstitutionId(order.client?.name ?? '')
    setReferenceNumber(order.reference_number ?? '')
    setLanguageId(order.language.id)
  }, [order])

  const startIso =
    selectedDate && startTimeInput
      ? dayjs(`${selectedDate}T${startTimeInput}:00`).toISOString().replace(/\.\d+Z$/, 'Z')
      : null
  const endIso = startIso
    ? dayjs(startIso).add(durationMinutes, 'minute').toISOString().replace(/\.\d+Z$/, 'Z')
    : null

  const slotMatchingParams =
    isTPM && (isCreateMode || isEditing) && startIso && endIso && languageId
      ? { start_at: startIso, end_at: endIso, language_id: languageId }
      : null
  const { vendors } = useFetchSlotMatching(slotMatchingParams)

  useEffect(() => {
    if (isCreateMode && isTranslator) {
      navigate('/calendar', { replace: true })
    }
  }, [isCreateMode, isTranslator, navigate])

  if (isCreateMode && isTranslator) return null

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

  const fmt = (iso?: string) =>
    iso ? dayjs(iso).format('DD.MM.YYYY  HH:mm') : '–'

  const startDt = order ? dayjs(order.start_at) : null
  const endDt = order ? dayjs(order.end_at) : null
  const orderDurationMins = startDt && endDt ? endDt.diff(startDt, 'minute') : 0
  const durationLabel = formatMins(orderDurationMins)

  const statusLabel = order
    ? order.status === 'NEW'
      ? t('calendar.status_pending')
      : order.status === 'IN_PROGRESS'
        ? isTranslator
          ? t('calendar.status_ongoing')
          : t('calendar.status_confirmed')
        : t('calendar.status_completed')
    : ''

  const isPast = order ? dayjs(order.start_at).isBefore(dayjs()) : false
  const canModify =
    (isTPM || isClient) &&
    !isPast &&
    order?.status !== 'DONE'

  const resetFields = () => {
    if (!order) return
    setSelectedDate(dayjs(order.start_at).format('YYYY-MM-DD'))
    setStartTimeInput(dayjs(order.start_at).format('HH:mm'))
    setDurationMinutes(orderDurationMins)
    setServiceType(order.service_type)
    setAddress(
      order.service_type === 'ON_SITE'
        ? (order.location ?? '')
        : (order.meeting_link ?? '')
    )
    setClientInstitutionId(order.client?.name ?? '')
    setReferenceNumber(order.reference_number ?? '')
  }

  const handleCreate = (comment?: string) => {
    if (!languageId || !startIso || !endIso) return
    createOrder(
      {
        language_id: languageId,
        start_at: startIso,
        end_at: endIso,
        service_type: serviceType,
        reference_number: referenceNumber || undefined,
        location: serviceType === 'ON_SITE' ? address : undefined,
        meeting_link: serviceType === 'REMOTE' ? address : undefined,
        client_institution_id: isTPM
          ? clientInstitutionId || undefined
          : undefined,
        tag_ids: domainIds.length ? domainIds : undefined,
        vendor_id: isTPM ? vendorId || undefined : undefined,
        comment: comment || undefined,
      },
      {
        onSuccess: (data) => {
          showNotification({
            type: NotificationTypes.Success,
            title: t('notification.announcement'),
            content: t('success.calendar_order_created'),
          })
          if (isMobile) {
            setMobileCreatedAt(data.created_at ?? new Date().toISOString())
            setMobileCreatedOrderId(data.id)
          } else {
            navigate(`/calendar/${data.id}`)
          }
        },
      }
    )
  }

  const handleSave = () => {
    if (!orderId) return
    const saveStart = dayjs(`${selectedDate}T${startTimeInput}:00`).toISOString().replace(/\.\d+Z$/, 'Z')
    const saveEnd = dayjs(saveStart).add(durationMinutes, 'minute').toISOString().replace(/\.\d+Z$/, 'Z')
    updateOrder(
      {
        id: orderId,
        start_at: saveStart,
        end_at: saveEnd,
        service_type: serviceType,
        location: serviceType === 'ON_SITE' ? address : undefined,
        meeting_link: serviceType === 'REMOTE' ? address : undefined,
        reference_number: referenceNumber || undefined,
        client_institution_id: isTPM
          ? clientInstitutionId || undefined
          : undefined,
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
    const endIsoNew = dayjs(`${date}T${durationEndTime}:00`).toISOString().replace(/\.\d+Z$/, 'Z')
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
    if (!orderId || !cancelReason.trim()) return
    cancelOrder(
      { id: orderId, cancellation_reason: cancelReason.trim() },
      {
        onSuccess: () => {
          setIsConfirmingCancel(false)
          setCancelReason('')
          showNotification({
            type: NotificationTypes.Success,
            title: t('notification.announcement'),
            content: t('success.calendar_order_cancelled'),
          })
        },
      }
    )
  }

  if (isCreateMode && isMobile && (isTPM || isClient)) {
    return (
      <CalendarMobileWizard
        isTPM={isTPM}
        languageId={languageId}
        setLanguageId={setLanguageId}
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        startTimeInput={startTimeInput}
        setStartTimeInput={setStartTimeInput}
        durationMinutes={durationMinutes}
        setDurationMinutes={setDurationMinutes}
        serviceType={serviceType}
        setServiceType={setServiceType}
        address={address}
        setAddress={setAddress}
        clientInstitutionId={clientInstitutionId}
        setClientInstitutionId={setClientInstitutionId}
        referenceNumber={referenceNumber}
        setReferenceNumber={setReferenceNumber}
        domainIds={domainIds}
        setDomainIds={setDomainIds}
        vendorId={vendorId}
        setVendorId={setVendorId}
        onSubmit={handleCreate}
        onCancel={() => navigate('/calendar')}
        isCreating={isCreating}
        createdAt={mobileCreatedAt}
        createdOrderId={mobileCreatedOrderId}
        onBackToCalendar={() => navigate('/calendar')}
      />
    )
  }

  const contextValue = {
    order: order ?? null,
    isLoading,
    languages,
    domains,
    vendors,
    isCreateMode,
    isTPM,
    isTranslator,
    isClient,
    isPast,
    canModify,
    startDt,
    endDt,
    durationLabel,
    statusLabel,
    startIso,
    endIso,
    formatMins,
    fmt,
    selectedDate,
    setSelectedDate,
    startTimeInput,
    setStartTimeInput,
    durationMinutes,
    setDurationMinutes,
    durationEndTime,
    setDurationEndTime,
    serviceType,
    setServiceType,
    address,
    setAddress,
    clientInstitutionId,
    setClientInstitutionId,
    referenceNumber,
    setReferenceNumber,
    languageId,
    setLanguageId,
    domainIds,
    setDomainIds,
    vendorId,
    setVendorId,
    localFiles,
    setLocalFiles,
    fileInputRef,
    isEditing,
    setIsEditing,
    isChangingDuration,
    setIsChangingDuration,
    isConfirmingCancel,
    setIsConfirmingCancel,
    cancelReason,
    setCancelReason,
    isAddingComment,
    setIsAddingComment,
    commentText,
    setCommentText,
    editingCommentIdx,
    setEditingCommentIdx,
    editingCommentText,
    setEditingCommentText,
    metaOpen,
    setMetaOpen,
    isCreating,
    isUpdating,
    isAccepting,
    isCancelling,
    handleCreate,
    handleSave,
    handleSaveDuration,
    handleAccept,
    handleCancelOrder,
    resetFields,
  }

  return (
    <OrderDetailContext.Provider value={contextValue}>
      <div className={classes.page}>
        <OrderTopActions />
        <OrderSummaryCard />
        <OrderDetailsCard />
        <OrderCommentsCard />

        {isCreateMode && (
          <div className={classes.editFooter}>
            <Button
              appearance={AppearanceTypes.Primary}
              onClick={() => handleCreate()}
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
    </OrderDetailContext.Provider>
  )
}

export default CalendarOrderDetail
