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
} from 'hooks/requests/useCalendar'
import { useCalendarRole } from 'hooks/useCalendarRole'
import { useClassifierValuesFetch } from 'hooks/requests/useClassifierValues'
import { ClassifierValueType } from 'types/classifierValues'
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
  const [editingCommentIdx, setEditingCommentIdx] = useState<number | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')

  // Editable field state
  const [selectedDate, setSelectedDate] = useState('')
  const [startTimeInput, setStartTimeInput] = useState('')
  const [durationMinutes, setDurationMinutes] = useState(60)
  const [durationEndTime, setDurationEndTime] = useState('')
  const [serviceType, setServiceType] = useState<'remote' | 'on-site'>('on-site')
  const [address, setAddress] = useState('')
  const [clientInstitutionId, setClientInstitutionId] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [languageId, setLanguageId] = useState('')
  const [domainId, setDomainId] = useState('')
  const [vendorId, setVendorId] = useState('')

  // File upload state
  const [localFiles, setLocalFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mobile wizard state (create mode only)
  const [mobileCreatedAt, setMobileCreatedAt] = useState<string | null>(null)
  const [mobileCreatedOrderId, setMobileCreatedOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (!order) return
    setSelectedDate(dayjs(order.start_at).format('YYYY-MM-DD'))
    setStartTimeInput(dayjs(order.start_at).format('HH:mm'))
    setDurationMinutes(dayjs(order.end_at).diff(dayjs(order.start_at), 'minute'))
    setServiceType(order.service_type)
    setAddress(order.service_type === 'on-site' ? (order.location ?? '') : (order.meeting_link ?? ''))
    setClientInstitutionId(order.client?.name ?? '')
    setReferenceNumber(order.reference_number ?? '')
  }, [order])

  const startIso = selectedDate && startTimeInput ? `${selectedDate}T${startTimeInput}:00` : null
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
    setSelectedDate(dayjs(order.start_at).format('YYYY-MM-DD'))
    setStartTimeInput(dayjs(order.start_at).format('HH:mm'))
    setDurationMinutes(orderDurationMins)
    setServiceType(order.service_type)
    setAddress(order.service_type === 'on-site' ? (order.location ?? '') : (order.meeting_link ?? ''))
    setClientInstitutionId(order.client?.name ?? '')
    setReferenceNumber(order.reference_number ?? '')
  }

  const handleCreate = () => {
    if (!languageId || !startIso || !endIso) return
    createOrder(
      {
        language_id: languageId,
        start_at: startIso,
        end_at: endIso,
        service_type: serviceType,
        reference_number: referenceNumber || undefined,
        location: serviceType === 'on-site' ? address : undefined,
        meeting_link: serviceType === 'remote' ? address : undefined,
        client_institution_id: isTPM ? clientInstitutionId || undefined : undefined,
        domain_id: domainId || undefined,
        vendor_id: isTPM ? vendorId || undefined : undefined,
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
    const saveStart = `${selectedDate}T${startTimeInput}:00`
    const saveEnd = dayjs(saveStart).add(durationMinutes, 'minute').toISOString()
    updateOrder(
      {
        id: orderId,
        start_at: saveStart,
        end_at: saveEnd,
        service_type: serviceType,
        location: serviceType === 'on-site' ? address : undefined,
        meeting_link: serviceType === 'remote' ? address : undefined,
        reference_number: referenceNumber || undefined,
        client_institution_id: isTPM ? clientInstitutionId || undefined : undefined,
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
        domainId={domainId}
        setDomainId={setDomainId}
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
    domainId,
    setDomainId,
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
    </OrderDetailContext.Provider>
  )
}

export default CalendarOrderDetail
