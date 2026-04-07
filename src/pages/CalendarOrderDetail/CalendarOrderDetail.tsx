import { FC, useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import {
  useFetchCalendarOrderDetail,
  useUpdateCalendarOrder,
  useCancelCalendarOrder,
  useDeclineCancelCalendarOrder,
  useCreateCalendarOrder,
  useFetchSlotMatching,
  useFetchCalendarTags,
  useCalendarAddFiles,
  useAddCalendarOrderComment,
} from 'hooks/requests/useCalendar'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
import { orderClassifierByLangPriority } from 'helpers'
import { useCalendarRole } from 'hooks/useCalendarRole'
import { useAuth } from 'components/contexts/AuthContext'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useIsMobile } from 'hooks/useIsMobile'
import { OrderDetailContext } from './OrderDetailContext'
import OrderSummaryCard from './OrderSummaryCard'
import OrderDetailsCard from './OrderDetailsCard'
import OrderCommentsCard from './OrderCommentsCard'
import CalendarMobileWizard from './CalendarMobileWizard'
import { areSortedIdArraysEqual, toCalendarApiDateTime } from 'helpers/calendar'
import { calendarBookingStatusLabelKey } from 'helpers/calendarBookingStatus'
import {
  orderDetailIsPast,
  showScheduledCancelBanner,
} from 'helpers/calendarCancelUi'
import classes from './classes.module.scss'

const CalendarOrderDetail: FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { orderId } = useParams<{ orderId: string }>()
  const isCreateMode = !orderId
  const isMobile = useIsMobile()
  const { isTPM, isTranslator, isClient } = useCalendarRole()
  const { institutionUserId } = useAuth()

  const {
    order,
    isLoading,
    isFetching: isRefetchingOrder,
  } = useFetchCalendarOrderDetail(isCreateMode ? null : (orderId ?? null))
  const { mutate: createOrder, isPending: isCreating } =
    useCreateCalendarOrder()
  const { mutate: updateOrder, isPending: isUpdating } =
    useUpdateCalendarOrder()
  const { mutate: cancelOrder, isPending: isCancelling } =
    useCancelCalendarOrder()
  const { mutate: declineCancel } = useDeclineCancelCalendarOrder()
  const { mutate: addFiles } = useCalendarAddFiles(
    isCreateMode ? null : (orderId ?? null)
  )
  const { mutate: addComment, isPending: isPostingComment } =
    useAddCalendarOrderComment(isCreateMode ? null : (orderId ?? null))

  const { classifierValues: allLanguages = [] } = useClassifierValuesFetch(
    { type: ClassifierValueType.Language },
    orderClassifierByLangPriority
  )
  const languages = allLanguages.map((l) => ({
    language: {
      id: l.id,
      value: l.value,
      name: l.name,
      type: l.type,
      meta: { iso3_code: '' },
    },
    pinned: false,
  }))
  const { tags: domains } = useFetchCalendarTags()
  // UI state
  const [metaOpen, setMetaOpen] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)
  const [isCancelPending, setIsCancelPending] = useState(false)
  const [cancelCountdown, setCancelCountdown] = useState(60)
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

  // Pending comment (buffered for create, posted on submit)
  const [pendingComment, setPendingComment] = useState('')

  useEffect(() => {
    if (!isEditing || isCreateMode) return
    setIsAddingComment(false)
    setCommentText('')
    setPendingComment('')
  }, [isEditing, isCreateMode])

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

  const hasFieldChanges =
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
      !areSortedIdArraysEqual(
        domainIds,
        order.tags?.map((tag) => tag.id) ?? []
      ))
  const canSaveEdits = hasFieldChanges || localFiles.length > 0

  const startIso =
    selectedDate && startTimeInput
      ? toCalendarApiDateTime(
          dayjs(`${selectedDate}T${startTimeInput}:00`).toISOString()
        )
      : null
  const endIso = startIso
    ? toCalendarApiDateTime(
        dayjs(startIso).add(durationMinutes, 'minute').toISOString()
      )
    : null

  const canCreateOrder =
    isCreateMode &&
    Boolean(languageId) &&
    Boolean(startIso) &&
    Boolean(endIso) &&
    address.trim().length > 0 &&
    (!isTPM || (Boolean(clientInstitutionId) && Boolean(vendorId)))

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

  const bookingStatusRole = isTPM
    ? 'tpm'
    : isTranslator
      ? 'translator'
      : 'client'
  const statusLabel = order
    ? (t(
        calendarBookingStatusLabelKey(
          order.status,
          order.sub_project_status,
          bookingStatusRole
        ) as never
      ) as string)
    : ''

  const isPast = orderDetailIsPast({
    order,
    isCancelled,
    isCancelPending,
  })
  const scheduledCancelBannerVisible = showScheduledCancelBanner({
    order,
    isCancelled,
    isCancelPending,
  })
  const isOwner =
    !isClient || order?.client_institution_user?.id === institutionUserId
  const clientOrderNotYetAccepted =
    order?.sub_project_status == null ||
    order.sub_project_status === 'REGISTERED' ||
    order.sub_project_status === 'TASKS_SUBMITTED_TO_VENDORS'
  const canModify =
    (isTPM || (isClient && isOwner && clientOrderNotYetAccepted)) &&
    !isCancelled &&
    !isPast &&
    (order?.status === 'NEW' ||
      order?.status === 'REGISTERED' ||
      order?.status === 'IN_PROGRESS')

  const resetFields = () => {
    if (!order) return
    setLocalFiles([])
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
    if (!canCreateOrder || !startIso || !endIso) return
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
        help_files: localFiles.length ? localFiles : undefined,
      },
      {
        onSuccess: (data) => {
          setLocalFiles([])
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
    const saveStart = toCalendarApiDateTime(
      dayjs(`${selectedDate}T${startTimeInput}:00`).toISOString()
    )
    const saveEnd = toCalendarApiDateTime(
      dayjs(saveStart).add(durationMinutes, 'minute').toISOString()
    )
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

  const handleUndoCancel = () => {
    if (!orderId) return
    declineCancel(orderId, {
      onSuccess: () => {
        setIsCancelled(false)
        setIsCancelPending(false)
        setCancelCountdown(60)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.calendar_cancel_declined'),
        })
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
          setCancelCountdown(60)
          setIsConfirmingCancel(false)
          setCancelReason('')
        },
      }
    )
  }

  const contextValue = {
    order: order ?? null,
    isLoading,
    isRefetchingOrder,
    languages,
    domains,
    vendors,
    isCreateMode,
    isTPM,
    isTranslator,
    isClient,
    isPast,
    showScheduledCancelBanner: scheduledCancelBannerVisible,
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
    hasFieldChanges,
    canSaveEdits,
    canCreateOrder,
    isCreating,
    isUpdating,
    isCancelling,
    isCancelled,
    isCancelPending,
    cancelCountdown,
    handleCreate,
    handleSave,
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
