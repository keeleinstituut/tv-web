import { createContext, useContext, RefObject } from 'react'
import { Dayjs } from 'dayjs'
import { CalendarOrderDetail } from 'types/calendar'
import { CalendarLanguage } from 'types/calendar'
export interface TagOption {
  id: string
  name: string
}
import { SlotMatchingVendor } from 'hooks/requests/useCalendar'

export interface OrderDetailContextValue {
  // Remote data
  order: CalendarOrderDetail | null
  isLoading: boolean
  languages: CalendarLanguage[]
  domains: TagOption[]
  vendors: SlotMatchingVendor[]

  // Mode / role
  isCreateMode: boolean
  isTPM: boolean
  isTranslator: boolean
  isClient: boolean

  // Derived
  isPast: boolean
  canModify: boolean
  startDt: Dayjs | null
  endDt: Dayjs | null
  durationLabel: string
  statusLabel: string
  startIso: string | null
  endIso: string | null
  formatMins: (mins: number) => string
  fmt: (iso?: string) => string

  // Form state
  selectedDate: string
  setSelectedDate: (v: string) => void
  startTimeInput: string
  setStartTimeInput: (v: string) => void
  durationMinutes: number
  setDurationMinutes: (v: number | ((prev: number) => number)) => void
  durationEndTime: string
  setDurationEndTime: (v: string) => void
  serviceType: 'REMOTE' | 'ON_SITE'
  setServiceType: (v: 'REMOTE' | 'ON_SITE') => void
  address: string
  setAddress: (v: string) => void
  clientInstitutionId: string
  setClientInstitutionId: (v: string) => void
  referenceNumber: string
  setReferenceNumber: (v: string) => void
  languageId: string
  setLanguageId: (v: string) => void
  domainIds: string[]
  setDomainIds: (v: string[]) => void
  vendorId: string
  setVendorId: (v: string) => void

  // Files
  localFiles: File[]
  setLocalFiles: (v: File[] | ((prev: File[]) => File[])) => void
  fileInputRef: RefObject<HTMLInputElement | null>

  // UI state
  isEditing: boolean
  setIsEditing: (v: boolean) => void
  isChangingDuration: boolean
  setIsChangingDuration: (v: boolean) => void
  isConfirmingCancel: boolean
  setIsConfirmingCancel: (v: boolean) => void
  cancelReason: string
  setCancelReason: (v: string) => void
  isAddingComment: boolean
  setIsAddingComment: (v: boolean) => void
  commentText: string
  setCommentText: (v: string) => void
  editingCommentIdx: number | null
  setEditingCommentIdx: (v: number | null) => void
  editingCommentText: string
  setEditingCommentText: (v: string) => void
  metaOpen: boolean
  setMetaOpen: (v: boolean | ((prev: boolean) => boolean)) => void

  // Pending comment (buffered for create/edit; posted directly in view mode)
  pendingComment: string
  setPendingComment: (v: string) => void
  addComment: (comment: string) => void
  isPostingComment: boolean

  isDirty: boolean
  // Async flags
  isCreating: boolean
  isUpdating: boolean
  isCancelling: boolean
  isCancelled: boolean
  isCancelPending: boolean
  cancelCountdown: number

  // Handlers
  handleCreate: (comment?: string) => void
  handleSave: () => void
  handleSaveDuration: () => void
  handleCancelOrder: () => void
  handleUndoCancel: () => void
  resetFields: () => void
}

export const OrderDetailContext = createContext<OrderDetailContextValue | null>(
  null
)

export function useOrderDetail(): OrderDetailContextValue {
  const ctx = useContext(OrderDetailContext)
  if (!ctx)
    throw new Error('useOrderDetail must be used inside CalendarOrderDetail')
  return ctx
}
