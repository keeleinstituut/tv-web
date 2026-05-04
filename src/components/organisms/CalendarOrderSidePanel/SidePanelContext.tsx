import { createContext, useContext } from 'react'
import {
  BookedSlot,
  CalendarLanguage,
  CalendarOrderDetail,
  ServiceType,
} from 'types/calendar'
export interface TagOption {
  id: string
  name: string
}
import { SlotMatchingVendor } from 'types/calendar'

export interface SidePanelContextValue {
  // Derived from sidePanelSelection
  language: CalendarLanguage | undefined
  slot: BookedSlot | undefined
  date: string
  startTime: string
  duration: string
  isPastSlot: boolean
  isViewMode: boolean
  canEdit: boolean

  // Role flags
  isTPM: boolean

  // Form state
  referenceNumber: string
  setReferenceNumber: (v: string) => void
  serviceType: ServiceType
  setServiceType: (v: ServiceType) => void
  location: string
  setLocation: (v: string) => void
  selectedDate: string
  setSelectedDate: (v: string) => void
  startTimeInput: string
  setStartTimeInput: (v: string) => void
  clientInstitutionId: string
  setClientInstitutionId: (v: string) => void
  domainIds: string[]
  setDomainIds: (v: string[]) => void
  projectTagIds: string[]
  setProjectTagIds: (v: string[]) => void
  vendorId: string
  setVendorId: (v: string) => void
  durationMinutes: number
  setDurationMinutes: (v: number | ((prev: number) => number)) => void

  // UI state
  isEditing: boolean
  isConfirmingCancel: boolean
  setIsConfirmingCancel: (v: boolean) => void
  cancelReason: string
  setCancelReason: (v: string) => void
  isCancelled: boolean
  isCancelPending: boolean
  cancelCountdown: number
  vendorName: string | undefined
  vendorEmail: string | undefined
  vendorPhone: string | undefined

  // Validation
  isRequiredFilled: boolean

  // Async flags
  isCreating: boolean
  isUpdating: boolean
  isCancelling: boolean

  // Remote data
  domains: TagOption[] | undefined
  projectTags: TagOption[] | undefined
  vendors: SlotMatchingVendor[]
  order: CalendarOrderDetail | null

  // File actions
  addFiles: (files: File[]) => void
  deleteFile: (arg: {
    id: string
    collection?: 'help' | 'source' | 'final'
  }) => void
  downloadFile: (file: {
    id: string
    file_name: string
    collection?: 'help' | 'source' | 'final'
  }) => void
  isAddingFiles: boolean
  isDeletingFile: boolean
  pendingFiles: File[]
  setPendingFiles: (files: File[]) => void
  pendingComment: string
  setPendingComment: (v: string) => void
  addComment: (comment: string) => void
  isPostingComment: boolean

  // Actions
  handleSubmit: () => void
  handleStartEdit: () => void
  handleCancelEdit: () => void
  handleSaveEdit: () => void
  handleVoidConfirm: () => void
  handleDeclineCancel: () => void
  isDecliningCancel: boolean
  closeSidePanel: () => void
}

export const SidePanelContext = createContext<SidePanelContextValue | null>(
  null
)

export function useSidePanel(): SidePanelContextValue {
  const ctx = useContext(SidePanelContext)
  if (!ctx)
    throw new Error('useSidePanel must be used inside CalendarOrderSidePanel')
  return ctx
}
