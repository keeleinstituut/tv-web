import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import {
  apiServiceTypeToForm,
  areSortedIdArraysEqual,
  formatDuration,
} from 'helpers/calendar'
import {
  isCalendarBookingEventEnded,
  sidePanelIsPastSlot,
} from 'helpers/calendarCancelUi'
import { useCalendarPanel } from 'components/contexts/CalendarContext'
import { useCalendarRole } from 'hooks/useCalendarRole'
import { useAuth } from 'components/contexts/AuthContext'
import {
  useCreateCalendarOrder,
  useUpdateCalendarOrder,
  useCancelCalendarOrder,
  useFetchSlotMatching,
  useCreatePrebook,
  useCancelPrebook,
  useFetchCalendarOrderDetail,
  useFetchCalendarAssignmentDetail,
  useCalendarAddFiles,
  useCalendarDeleteFile,
  useCalendarDownloadFile,
  useDeclineCancelCalendarOrder,
  useAddCalendarOrderComment,
  useFetchCalendarTags,
} from 'hooks/requests/useCalendar'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { ServiceType, UpdateOrderPayload } from 'types/calendar'
import { apiClient } from 'api'
import { endpoints } from 'api/endpoints'
import { useFetchVendor } from 'hooks/requests/useVendors'
import { SidePanelContextValue } from './SidePanelContext'

interface FormState {
  referenceNumber: string
  serviceType: ServiceType
  location: string
  selectedDate: string
  startTimeInput: string
  clientInstitutionId: string
  domainIds: string[]
  vendorId: string
  durationMinutes: number
}

const INITIAL_FORM: FormState = {
  referenceNumber: '',
  serviceType: 'kaugtolge',
  location: '',
  selectedDate: '',
  startTimeInput: '',
  clientInstitutionId: '',
  domainIds: [],
  vendorId: '',
  durationMinutes: 60,
}

export interface PanelDisplayState {
  isOpen: boolean
  isViewMode: boolean
  isTranslatorView: boolean
  isClientPastView: boolean
  isTPMPastView: boolean
  isTPMViewMode: boolean
  showFooter: boolean
  canEdit: boolean
  isPastSlot: boolean
  isEditing: boolean
  isCancelPending: boolean
  isConfirmingCancel: boolean
  isCancelled: boolean
  cancelCountdown: number
  isCreating: boolean
  isUpdating: boolean
  isCancelling: boolean
  projectId: string | undefined
}

export function useCalendarOrderPanelState(): {
  contextValue: SidePanelContextValue
  display: PanelDisplayState
} {
  const { t } = useTranslation()
  const { sidePanelSelection, closeSidePanel } = useCalendarPanel()
  const { isTPM, isClient, isTranslator } = useCalendarRole()
  const { institutionUserId } = useAuth()

  const { mutate: createOrder, isPending: isCreating } =
    useCreateCalendarOrder()
  const { mutate: updateOrder, isPending: isUpdating } =
    useUpdateCalendarOrder()
  const { mutate: cancelOrder, isPending: isCancelling } =
    useCancelCalendarOrder()
  const { mutate: declineCancelOrder, isPending: isDecliningCancel } =
    useDeclineCancelCalendarOrder()
  const { mutate: createPrebook } = useCreatePrebook()
  const { mutate: cancelPrebook } = useCancelPrebook()

  const prebookActiveRef = useRef(false)

  // Cancel prebook on browser/tab close and on in-app navigation (component unmount).
  // fetch + keepalive ensures the request outlives the page lifecycle.
  useEffect(() => {
    const cancelPrebookOnUnload = () => {
      if (!prebookActiveRef.current) return
      const csrfToken = apiClient.instance.defaults.headers.common[
        'X-CSRF-Token'
      ] as string | undefined
      fetch(endpoints.CALENDAR_PREBOOK, {
        method: 'DELETE',
        credentials: 'include',
        keepalive: true,
        headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : undefined,
      })
    }
    window.addEventListener('beforeunload', cancelPrebookOnUnload)
    return () => {
      window.removeEventListener('beforeunload', cancelPrebookOnUnload)
      cancelPrebookOnUnload()
    }
  }, [])

  const editBaselineRef = useRef<{
    serviceType: ServiceType
    referenceNumber: string
    location: string
    clientInstitutionId: string
    domainIds: string[]
    vendorId: string
    selectedDate: string
    startTimeInput: string
    durationMinutes: number
  } | null>(null)

  const [form, setForm] = useState<FormState>(INITIAL_FORM)
  const {
    referenceNumber,
    serviceType,
    location,
    selectedDate,
    startTimeInput,
    clientInstitutionId,
    domainIds,
    vendorId,
    durationMinutes,
  } = form

  const setReferenceNumber = (v: string) =>
    setForm((f) => ({ ...f, referenceNumber: v }))
  const setServiceType = (v: ServiceType) =>
    setForm((f) => ({ ...f, serviceType: v }))
  const setLocation = (v: string) => setForm((f) => ({ ...f, location: v }))
  const setSelectedDate = (v: string) =>
    setForm((f) => ({ ...f, selectedDate: v }))
  const setStartTimeInput = (v: string) =>
    setForm((f) => ({ ...f, startTimeInput: v }))
  const setClientInstitutionId = (v: string) =>
    setForm((f) => ({ ...f, clientInstitutionId: v }))
  const setDomainIds = (v: string[]) => setForm((f) => ({ ...f, domainIds: v }))
  const setVendorId = (v: string) => setForm((f) => ({ ...f, vendorId: v }))
  const setDurationMinutes = (v: number | ((prev: number) => number)) =>
    setForm((f) => ({
      ...f,
      durationMinutes: typeof v === 'function' ? v(f.durationMinutes) : v,
    }))

  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [isCancelled, setIsCancelled] = useState(false)
  const [isCancelPending, setIsCancelPending] = useState(false)
  const [cancelCountdown, setCancelCountdown] = useState(60)
  const [isMetaOpen, setIsMetaOpen] = useState(false)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [pendingComment, setPendingComment] = useState('')

  const isOpen = sidePanelSelection !== null
  const isViewMode = !!sidePanelSelection?.slot
  const isTranslatorView = isTranslator && isViewMode && !isTPM
  const isFormMode = !isViewMode || isEditing

  const language = sidePanelSelection?.language
  const startIso = sidePanelSelection?.startIso
  const endIso = sidePanelSelection?.endIso
  const slot = sidePanelSelection?.slot

  const date = startIso ? dayjs(startIso).format('DD.MM.YYYY') : ''
  const startTime = startIso ? dayjs(startIso).format('HH:mm') : ''
  const duration = startIso && endIso ? formatDuration(startIso, endIso) : ''
  const slotDurationMinutes =
    startIso && endIso ? dayjs(endIso).diff(dayjs(startIso), 'minute') : 60

  const projectId = slot?.assignment?.sub_project?.id
  const assignmentId = slot?.assignment?.id

  const useAssignmentEndpoint = isTranslator && !isTPM
  const { order: projectOrder } = useFetchCalendarOrderDetail(
    !useAssignmentEndpoint ? (projectId ?? null) : null
  )
  const { order: assignmentOrder } = useFetchCalendarAssignmentDetail(
    useAssignmentEndpoint ? (assignmentId ?? null) : null
  )
  const order = useAssignmentEndpoint ? assignmentOrder : projectOrder

  // Fetch vendor details (email, phone) via GET /vendors/{id}
  const slotVendorId =
    sidePanelSelection?.vendorId || slot?.assignment?.vendor_id
  const { vendor: vendorDetail } = useFetchVendor({
    id: isViewMode ? slotVendorId : undefined,
  })
  const { mutate: addFilesMutate, isPending: isAddingFiles } =
    useCalendarAddFiles(projectId)
  const { mutate: deleteFileMutate, isPending: isDeletingFile } =
    useCalendarDeleteFile(projectId)
  const { mutate: downloadFileMutate } = useCalendarDownloadFile({ projectId })
  const { mutate: addComment, isPending: isPostingComment } =
    useAddCalendarOrderComment(projectId)

  const isOwner =
    !isClient || order?.client_institution_user?.id === institutionUserId
  const clientOrderNotYetAccepted =
    order?.sub_project_status == null ||
    order.sub_project_status === 'REGISTERED' ||
    order.sub_project_status === 'TASKS_SUBMITTED_TO_VENDORS'
  const canEdit = isTPM || (isClient && isOwner && clientOrderNotYetAccepted)
  const isRequiredFilled =
    !!serviceType &&
    !!location.trim() &&
    (!isTPM || !!clientInstitutionId) &&
    (!isTPM || !!vendorId)

  const assignmentStatus = slot?.assignment?.status
  const assignmentWorkEnded = assignmentStatus === 'DONE'
  const orderTerminal =
    order?.status === 'ACCEPTED' || order?.status === 'CANCELLED'
  const hasScheduledCancelAt =
    typeof order?.cancel_at === 'string' && order.cancel_at.trim().length > 0
  const inReversibleCancelWindow =
    (isCancelled && isCancelPending) || hasScheduledCancelAt
  const eventEndedByClock = isCalendarBookingEventEnded(
    order?.end_at ?? endIso ?? slot?.end_at
  )
  const isPastSlot = sidePanelIsPastSlot({
    assignmentWorkEnded,
    orderTerminal,
    isCancelled,
    inReversibleCancelWindow,
    eventEndedByClock,
  })
  const isClientPastView = isClient && isViewMode && isPastSlot

  // Compute effective start/end ISO strings (use edited values during edit mode)
  const editedStartIso = useMemo(() => {
    if (!isEditing) return startIso
    if (!selectedDate || !startTimeInput) return startIso
    const parsed = dayjs(
      `${selectedDate} ${startTimeInput}`,
      'DD.MM.YYYY HH:mm'
    )
    return parsed.isValid() ? parsed.toISOString() : startIso
  }, [isEditing, selectedDate, startTimeInput, startIso])

  const editedEndIso = useMemo(() => {
    if (!editedStartIso) return endIso
    if (!isEditing) return endIso
    return dayjs(editedStartIso).add(durationMinutes, 'minute').toISOString()
  }, [isEditing, editedStartIso, durationMinutes, endIso])

  const effectiveStartIso = isEditing ? editedStartIso : startIso
  const effectiveEndIso = isEditing ? editedEndIso : endIso
  const slotMatchingParams =
    isFormMode && isTPM && effectiveStartIso && effectiveEndIso && language
      ? {
          start_at: effectiveStartIso,
          end_at: effectiveEndIso,
          language_id: language.language.id,
        }
      : null
  const { vendors } = useFetchSlotMatching(slotMatchingParams)

  const { tags: domains } = useFetchCalendarTags()

  // Reset state when panel opens/closes
  useEffect(() => {
    if (!isOpen) {
      setForm(INITIAL_FORM)
      setPendingFiles([])
      setPendingComment('')
      setIsEditing(false)
      setIsConfirmingCancel(false)
      setCancelReason('')
      setIsCancelled(false)
      setIsCancelPending(false)
      setCancelCountdown(60)
      setIsMetaOpen(false)
    } else {
      if (sidePanelSelection?.vendorId) {
        setVendorId(sidePanelSelection.vendorId)
      }
      if (!isViewMode) {
        setDurationMinutes(slotDurationMinutes)
      }
      if (isTPM && sidePanelSelection?.slot?.assignment?.status === 'NEW') {
        const a = sidePanelSelection.slot.assignment
        setReferenceNumber(a.reference_number ?? '')
        setServiceType(apiServiceTypeToForm(a.service_type))
        setLocation(a.meeting_link ?? a.location ?? '')
      }
    }
    if (isOpen && isClientPastView) {
      setIsMetaOpen(true)
    }
  }, [sidePanelSelection]) // eslint-disable-line react-hooks/exhaustive-deps

  // Create prebook when opening a new (non-view) slot
  useEffect(() => {
    if (!isOpen || isViewMode || !language || !startIso || !endIso) return
    prebookActiveRef.current = true
    createPrebook(
      {
        language_id: language.language.id,
        start_at: startIso,
        end_at: endIso,
        ...(sidePanelSelection?.vendorId
          ? { vendor_id: sidePanelSelection.vendorId }
          : {}),
      },
      {
        onSuccess: () => {
          if (!prebookActiveRef.current) cancelPrebook()
        },
        onError: (err: unknown) => {
          prebookActiveRef.current = false
          const msg = (err as { message?: string })?.message ?? ''
          if (msg.toLowerCase().includes('only one prebook')) {
            showNotification({
              type: NotificationTypes.Error,
              title: t('notification.error'),
              content: t('calendar.prebook_limit'),
            })
          }
        },
      }
    )
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-issue prebook when duration changes so the reserved range matches the order end time
  useEffect(() => {
    if (!isOpen || isViewMode || !language || !startIso) return
    const computedEnd = dayjs(startIso)
      .add(durationMinutes, 'minute')
      .toISOString()
    const timer = setTimeout(() => {
      cancelPrebook()
      prebookActiveRef.current = true
      createPrebook(
        {
          language_id: language.language.id,
          start_at: startIso,
          end_at: computedEnd,
          ...(sidePanelSelection?.vendorId
            ? { vendor_id: sidePanelSelection.vendorId }
            : {}),
        },
        {
          onSuccess: () => {
            if (!prebookActiveRef.current) cancelPrebook()
          },
          onError: () => {
            prebookActiveRef.current = false
          },
        }
      )
    }, 600)
    return () => clearTimeout(timer)
  }, [durationMinutes]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cancel countdown tick
  useEffect(() => {
    if (!isCancelPending) return
    if (cancelCountdown <= 0) {
      setIsCancelPending(false)
      return
    }
    const timer = setTimeout(() => setCancelCountdown((v) => v - 1), 1000)
    return () => clearTimeout(timer)
  }, [isCancelPending, cancelCountdown])

  const handleClose = useCallback(() => {
    if (prebookActiveRef.current) {
      cancelPrebook()
      prebookActiveRef.current = false
    }
    closeSidePanel()
  }, [cancelPrebook, closeSidePanel])

  const handleSubmit = () => {
    if (!language || !startIso || !serviceType) return
    const computedEndIso = dayjs(startIso)
      .add(durationMinutes, 'minute')
      .toISOString()
    createOrder(
      {
        language_id: language.language.id,
        start_at: startIso,
        end_at: computedEndIso,
        service_type: serviceType === 'kaugtolge' ? 'REMOTE' : 'ON_SITE',
        reference_number: referenceNumber || undefined,
        location: serviceType === 'kontakttolge' ? location : undefined,
        meeting_link: serviceType === 'kaugtolge' ? location : undefined,
        client_institution_id: isTPM
          ? clientInstitutionId || undefined
          : undefined,
        tag_ids: domainIds.length ? domainIds : undefined,
        vendor_id: isTPM ? vendorId || undefined : undefined,
        comment: pendingComment || undefined,
        help_files: pendingFiles.length ? pendingFiles : undefined,
      },
      {
        onSuccess: () => {
          setPendingFiles([])
          setPendingComment('')
          prebookActiveRef.current = false
          closeSidePanel()
          showNotification({
            type: NotificationTypes.Success,
            title: t('notification.announcement'),
            content: t('success.calendar_order_created'),
          })
        },
        onError: (err: unknown) => {
          showValidationErrorMessage(err)
        },
      }
    )
  }

  const handleStartEdit = () => {
    setIsEditing(true)
    setPendingComment('')
    setIsConfirmingCancel(false)

    const initServiceType = apiServiceTypeToForm(slot?.assignment?.service_type)
    const initReferenceNumber = slot?.assignment?.reference_number ?? ''
    const initLocation =
      slot?.assignment?.location ?? order?.meeting_link ?? order?.location ?? ''
    const initClientInstitutionId = order?.client_institution_user?.id ?? ''
    const initDomainIds = order?.tags?.map((tag) => tag.id) ?? []

    setForm({
      referenceNumber: initReferenceNumber,
      serviceType: initServiceType,
      location: initLocation,
      selectedDate: date,
      startTimeInput: startTime,
      durationMinutes: slotDurationMinutes,
      clientInstitutionId: initClientInstitutionId,
      domainIds: initDomainIds,
      vendorId: form.vendorId,
    })

    editBaselineRef.current = {
      serviceType: initServiceType,
      referenceNumber: initReferenceNumber,
      location: initLocation,
      clientInstitutionId: initClientInstitutionId,
      domainIds: initDomainIds,
      vendorId: form.vendorId,
      selectedDate: date,
      startTimeInput: startTime,
      durationMinutes: slotDurationMinutes,
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setForm(INITIAL_FORM)
    editBaselineRef.current = null
  }

  const handleSaveEdit = () => {
    if (!projectId) return
    const b = editBaselineRef.current
    const payload: UpdateOrderPayload = { id: projectId }

    if (!b || serviceType !== b.serviceType) {
      payload.service_type =
        serviceType === 'kaugtolge'
          ? 'REMOTE'
          : serviceType === 'kontakttolge'
            ? 'ON_SITE'
            : undefined
    }
    if (!b || referenceNumber !== b.referenceNumber) {
      payload.reference_number = referenceNumber || undefined
    }
    if (!b || location !== b.location || serviceType !== b.serviceType) {
      payload.location =
        serviceType === 'kontakttolge' ? location || undefined : undefined
      payload.meeting_link =
        serviceType === 'kaugtolge' ? location || undefined : undefined
    }
    if (isTPM && (!b || clientInstitutionId !== b.clientInstitutionId)) {
      payload.client_institution_id = clientInstitutionId || undefined
    }
    if (!b || !areSortedIdArraysEqual(domainIds, b.domainIds)) {
      payload.tag_ids = domainIds.length ? domainIds : undefined
    }
    if (isTPM && (!b || vendorId !== b.vendorId)) {
      payload.vendor_id = vendorId || undefined
    }

    const dateTimeChanged =
      !b ||
      selectedDate !== b.selectedDate ||
      startTimeInput !== b.startTimeInput ||
      durationMinutes !== b.durationMinutes
    if (dateTimeChanged && editedStartIso && editedEndIso) {
      payload.start_at = editedStartIso
      payload.end_at = editedEndIso
    }

    updateOrder(payload, {
      onSuccess: () => {
        setIsEditing(false)
        editBaselineRef.current = null
      },
      onError: (err: unknown) => {
        showValidationErrorMessage(err)
      },
    })
  }

  const handleVoidConfirm = () => {
    if (!projectId || !cancelReason.trim()) return
    cancelOrder(
      {
        id: projectId,
        cancellation_reason: cancelReason.trim(),
        is_delayed: true,
      },
      {
        onSuccess: () => {
          setCancelReason('')
          setIsConfirmingCancel(false)
          setIsCancelled(true)
          setIsCancelPending(true)
          setCancelCountdown(60)
        },
      }
    )
  }

  const handleDeclineCancel = useCallback(() => {
    if (!projectId) return
    declineCancelOrder(projectId, {
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
  }, [projectId, declineCancelOrder, t])

  const contextValue = useMemo<SidePanelContextValue>(
    () => ({
      language,
      slot,
      date,
      startTime,
      duration,
      isPastSlot,
      isViewMode,
      isTPM,
      referenceNumber,
      setReferenceNumber,
      serviceType,
      setServiceType,
      location,
      setLocation,
      selectedDate,
      setSelectedDate,
      startTimeInput,
      setStartTimeInput,
      clientInstitutionId,
      setClientInstitutionId,
      domainIds,
      setDomainIds,
      vendorId,
      setVendorId,
      durationMinutes,
      setDurationMinutes,
      isEditing,
      isConfirmingCancel,
      setIsConfirmingCancel,
      cancelReason,
      setCancelReason,
      isCancelled,
      isCancelPending,
      cancelCountdown,
      isMetaOpen,
      setIsMetaOpen,
      vendorName:
        sidePanelSelection?.vendorName ||
        (vendorDetail?.institution_user
          ? [
              vendorDetail.institution_user.user?.forename,
              vendorDetail.institution_user.user?.surname,
            ]
              .filter(Boolean)
              .join(' ')
          : undefined),
      vendorEmail: vendorDetail?.institution_user?.email,
      vendorPhone: vendorDetail?.institution_user?.phone,
      isCreating,
      isUpdating,
      isCancelling,
      domains,
      isRequiredFilled,
      vendors: vendors ?? [],
      order: order ?? null,
      addFiles: (files: File[]) => addFilesMutate(files),
      deleteFile: (arg) => deleteFileMutate(arg),
      downloadFile: (file) => downloadFileMutate(file),
      isAddingFiles,
      isDeletingFile,
      pendingFiles,
      setPendingFiles,
      pendingComment,
      setPendingComment,
      addComment,
      isPostingComment,
      handleSubmit,
      handleStartEdit,
      handleCancelEdit,
      handleSaveEdit,
      handleVoidConfirm,
      handleDeclineCancel,
      isDecliningCancel,
      closeSidePanel: handleClose,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      language,
      slot,
      date,
      startTime,
      duration,
      isPastSlot,
      isViewMode,
      isTPM,
      referenceNumber,
      serviceType,
      location,
      selectedDate,
      startTimeInput,
      clientInstitutionId,
      domainIds,
      vendorId,
      durationMinutes,
      isEditing,
      isConfirmingCancel,
      cancelReason,
      isCancelled,
      isCancelPending,
      cancelCountdown,
      isMetaOpen,
      isRequiredFilled,
      isCreating,
      isUpdating,
      isCancelling,
      isDecliningCancel,
      domains,
      vendors,
      order,
      isAddingFiles,
      isDeletingFile,
      pendingFiles,
      pendingComment,
      isPostingComment,
      sidePanelSelection?.vendorName,
      vendorDetail,
      handleClose,
      projectId,
    ]
  )

  const isTPMViewMode = isTPM && isViewMode
  const isTPMPastView = isTPM && isViewMode && isPastSlot
  const showFooter =
    !isTranslatorView &&
    !isClientPastView &&
    !isTPMPastView &&
    !isTPMViewMode &&
    !(isClient && isViewMode)

  return {
    contextValue,
    display: {
      isOpen,
      isViewMode,
      isTranslatorView,
      isClientPastView,
      isTPMPastView,
      isTPMViewMode,
      showFooter,
      canEdit,
      isPastSlot,
      isEditing,
      isCancelPending,
      isConfirmingCancel,
      isCancelled,
      cancelCountdown,
      isCreating,
      isUpdating,
      isCancelling,
      projectId,
    },
  }
}
