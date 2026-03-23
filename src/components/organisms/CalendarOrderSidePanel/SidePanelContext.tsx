import { createContext, useContext } from 'react'
import { BookedSlot, CalendarLanguage, ServiceType } from 'types/calendar'
import { ClassifierValue } from 'types/classifierValues'
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

  // Role flags
  isTPM: boolean
  isTPMPendingView: boolean

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
  domainId: string
  setDomainId: (v: string) => void
  vendorId: string
  setVendorId: (v: string) => void
  durationMinutes: number
  setDurationMinutes: (v: number | ((prev: number) => number)) => void
  durationNote: string
  setDurationNote: (v: string) => void

  // UI state
  isEditing: boolean
  isConfirmingCancel: boolean
  setIsConfirmingCancel: (v: boolean) => void
  isMetaOpen: boolean
  setIsMetaOpen: (v: boolean) => void
  isChangingDuration: boolean

  // Async flags
  isCreating: boolean
  isUpdating: boolean
  isCancelling: boolean
  isConfirming: boolean
  isRejecting: boolean

  // Remote data
  domains: ClassifierValue[] | undefined
  vendors: SlotMatchingVendor[]

  // Actions
  handleSubmit: () => void
  handleStartEdit: () => void
  handleCancelEdit: () => void
  handleSaveEdit: () => void
  handleVoidConfirm: () => void
  handleConfirmOrder: () => void
  handleRejectOrder: () => void
  handleStartChangeDuration: () => void
  handleCancelChangeDuration: () => void
  handleSaveDuration: () => void
  closeSidePanel: () => void
}

export const SidePanelContext = createContext<SidePanelContextValue | null>(null)

export function useSidePanel(): SidePanelContextValue {
  const ctx = useContext(SidePanelContext)
  if (!ctx) throw new Error('useSidePanel must be used inside CalendarOrderSidePanel')
  return ctx
}
