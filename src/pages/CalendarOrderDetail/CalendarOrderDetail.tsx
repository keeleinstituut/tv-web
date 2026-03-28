import { FC, useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import {
  useFetchCalendarOrderDetail,
  useUpdateCalendarOrder,
  useAcceptCalendarOrder,
  useCancelCalendarOrder,
  useDeclineCancelCalendarOrder,
  useCreateCalendarOrder,
  useFetchCalendarLanguages,
  useFetchSlotMatching,
  useFetchCalendarTags,
  useCalendarAddFiles,
  useAddCalendarOrderComment,
} from 'hooks/requests/useCalendar'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { useCalendarRole } from 'hooks/useCalendarRole'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useIsMobile } from 'hooks/useIsMobile'
import { OrderDetailContext } from './OrderDetailContext'
import OrderSummaryCard from './OrderSummaryCard'
import OrderDetailsCard from './OrderDetailsCard'
import OrderCommentsCard from './OrderCommentsCard'
import CalendarMobileWizard from './CalendarMobileWizard'
import classes from './classes.module.scss'

const CalendarOrderDetail: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const isCreateMode = !orderId
  const isMobile = useIsMobile()
  const { isTPM, isTranslator, isClient } = useCalendarRole()

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
  const { mutate: declineCancel } = useDeclineCancelCalendarOrder()
  const { mutate: addFiles } = useCalendarAddFiles(
    isCreateMode ? null : (orderId ?? null)
  )
  const { mutate: addComment, isPending: isPostingComment } =
    useAddCalendarOrderComment(isCreateMode ? null : (orderId ?? null))

  const { languages } = useFetchCalendarLanguages()
  const { tags: domains } = useFetchCalendarTags()

  // UI state
  const [metaOpen, setMetaOpen] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingDuration, setIsChangingDuration] = useState(false)
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)
  const [isCancelPending, setIsCancelPending] = useState(false)
  const [cancelCountdown, setCancelCountdown] = useState(30)
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

  // Pending comment (buffered for create / edit, posted directly in view mode)
  const [pendingComment, setPendingComment] = useState('')

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
    setClientInstitutionId(order.client_institution_user?.id ?? '')
    setReferenceNumber(order.reference_number ?? '')
    setLanguageId(order.language.id)
    setDomainIds(order.tags?.map((t) => t.id) ?? [])
  }, [order])

  const isDirty =
    isEditing &&
    !!order &&
    (selectedDate !== dayjs(order.start_at).format('YYYY-MM-DD') ||
      startTimeInput !== dayjs(order.start_at).format('HH:mm') ||
      durationMinutes !==
        dayjs(order.end_at).diff(dayjs(order.start_at), 'minute') ||
      serviceType !== order.service_type ||
      address !==
        (order.service_type === 'ON_SITE'
          ? (order.location ?? '')
          : (order.meeting_link ?? '')) ||
      clientInstitutionId !== (order.client_institution_user?.id ?? '') ||
      referenceNumber !== (order.reference_number ?? '') ||
      languageId !== order.language.id ||
      JSON.stringify([...domainIds].sort()) !==
        JSON.stringify([...(order.tags?.map((tag) => tag.id) ?? [])].sort()) ||
      localFiles.length > 0)

  const startIso =
    selectedDate && startTimeInput
      ? dayjs(`${selectedDate}T${startTimeInput}:00`)
          .toISOString()
          .replace(/\.\d+Z$/, 'Z')
      : null
  const endIso = startIso
    ? dayjs(startIso)
        .add(durationMinutes, 'minute')
        .toISOString()
        .replace(/\.\d+Z$/, 'Z')
    : null

  const slotMatchingParams =
    isTPM && (isCreateMode || isEditing) && startIso && endIso && languageId
      ? { start_at: startIso, end_at: endIso, language_id: languageId }
      : null
  const { vendors } = useFetchSlotMatching(slotMatchingParams)

  useEffect(() => {
    if (isCreateMode && isTranslator && !isTPM && !isClient) {
      navigate('/calendar', { replace: true })
    }
  }, [isCreateMode, isTranslator, isTPM, isClient, navigate])

  useEffect(() => {
    if (!isCancelPending) return
    if (cancelCountdown <= 0) {
      setIsCancelPending(false)
      return
    }
    const timer = setTimeout(() => setCancelCountdown((v) => v - 1), 1000)
    return () => clearTimeout(timer)
  }, [isCancelPending, cancelCountdown])

  if (isCreateMode && isTranslator && !isTPM && !isClient) return null

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
      : order.status === 'CANCELLED'
        ? t('calendar.status_cancelled')
        : order.status === 'ACCEPTED'
          ? t('calendar.status_completed')
          : isTranslator
            ? t('calendar.status_ongoing')
            : t('calendar.status_confirmed')
    : ''

  const isPast = order ? dayjs(order.start_at).isBefore(dayjs()) : false
  const canModify =
    (isTPM || isClient) &&
    !isPast &&
    !isCancelled &&
    order?.status !== 'ACCEPTED' &&
    order?.status !== 'CANCELLED'

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
    setClientInstitutionId(order.client_institution_user?.id ?? '')
    setReferenceNumber(order.reference_number ?? '')
    setDomainIds(order.tags?.map((t) => t.id) ?? [])
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
          if (localFiles.length) {
            apiClient.postForm(endpoints.MEDIA_BULK, {
              files: localFiles.map((f) => ({
                content: f,
                reference_object_id: data.id,
                reference_object_type: 'project',
                collection: 'source',
              })),
            })
            setLocalFiles([])
          }
          showNotification({
            type: NotificationTypes.Success,
            title: t('notification.announcement'),
            content: t('success.calendar_order_created'),
          })
          navigate(`/calendar/${data.id}`)
        },
      }
    )
  }

  const handleSave = () => {
    if (!orderId) return
    const saveStart = dayjs(`${selectedDate}T${startTimeInput}:00`)
      .toISOString()
      .replace(/\.\d+Z$/, 'Z')
    const saveEnd = dayjs(saveStart)
      .add(durationMinutes, 'minute')
      .toISOString()
      .replace(/\.\d+Z$/, 'Z')
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
        tag_ids: domainIds.length ? domainIds : undefined,
      },
      {
        onSuccess: () => {
          if (localFiles.length) {
            addFiles(localFiles)
            setLocalFiles([])
          }
          if (pendingComment.trim()) {
            addComment(pendingComment.trim())
            setPendingComment('')
          }
          setIsEditing(false)
          showNotification({
            type: NotificationTypes.Success,
            title: t('notification.announcement'),
            content: t('success.calendar_order_updated'),
          })
        },
        onError: (err: unknown) => {
          const msg = (err as { message?: string })?.message ?? ''
          if (msg.toLowerCase().includes('vendor is not available')) {
            showNotification({
              type: NotificationTypes.Error,
              title: t('notification.error'),
              content: t('calendar.vendor_not_available'),
            })
          }
        },
      }
    )
  }

  const handleSaveDuration = () => {
    if (!orderId || !order || !durationEndTime) return
    const date = dayjs(order.start_at).format('YYYY-MM-DD')
    const endIsoNew = dayjs(`${date}T${durationEndTime}:00`)
      .toISOString()
      .replace(/\.\d+Z$/, 'Z')
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

  const handleUndoCancel = () => {
    if (!orderId) return
    declineCancel(orderId, {
      onSuccess: () => {
        setIsCancelled(false)
        setIsCancelPending(false)
        setCancelCountdown(30)
      },
    })
  }

  const handleCancelOrder = () => {
    if (!orderId || !cancelReason.trim()) return
    cancelOrder(
      {
        id: orderId,
        cancellation_reason: cancelReason.trim(),
        is_delayed: true,
      },
      {
        onSuccess: () => {
          setIsCancelled(true)
          setIsCancelPending(true)
          setCancelCountdown(30)
          setIsConfirmingCancel(false)
          setCancelReason('')
        },
      }
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
    pendingComment,
    setPendingComment,
    addComment,
    isPostingComment,
    isDirty,
    isCreating,
    isUpdating,
    isAccepting,
    isCancelling,
    isCancelled,
    isCancelPending,
    cancelCountdown,
    handleCreate,
    handleSave,
    handleSaveDuration,
    handleAccept,
    handleCancelOrder,
    handleUndoCancel,
    resetFields,
  }

  if (isMobile) {
    return (
      <OrderDetailContext.Provider value={contextValue}>
        <CalendarMobileWizard />
      </OrderDetailContext.Provider>
    )
  }

  return (
    <OrderDetailContext.Provider value={contextValue}>
      <div className={classes.page}>
        <OrderSummaryCard />
        <OrderDetailsCard />
        <OrderCommentsCard />
      </div>
    </OrderDetailContext.Provider>
  )
}

export default CalendarOrderDetail
