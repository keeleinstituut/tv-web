import { InstitutionSelectModalProps } from './InstitutionSelectModal/InstitutionSelectModal'
import { UserAndRoleManagementModalProps } from './UserAndRoleManagementModal/UserAndRoleManagementModal'
import { TooltipModalProps } from './TooltipModal/TooltipModal'
import {
  lazy,
  useState,
  useCallback,
  createRef,
  useImperativeHandle,
  Suspense,
  useEffect,
} from 'react'
import { EditableListModalProps } from './EditableListModal/EditableListModal'
import { AuditLogSettingsModalProps } from './AuditLogSettingsModal/AuditLogSettingsModal'
import { ConfirmationModalBaseProps } from './ConfirmationModalBase/ConfirmationModalBase'
import { DateTimeRangeFormModalProps } from './DateTimeRangeFormModal/DateTimeRangeFormModal'
import { DateRangeFormModalProps } from './DateRangeFormModal/DateRangeFormModal'
import { VendorsEditModalProps } from './VendorsEditModal/VendorsEditModal'
import { SelectVendorModalProps } from './SelectVendorModal/SelectVendorModal'
import { AddVolumeModalProps } from './AddVolumeModal/AddVolumeModal'
import { VolumeChangeModalProps } from './VolumeChangeModal/VolumeChangeModal'
import { ConfirmDeleteVolumeModalProps } from './ConfirmDeleteVolumeModal/ConfirmDeleteVolumeModal'
import { ConfirmCancelProjectModalProps } from './ConfirmCancelProjectModal/ConfirmCancelProjectModal'
import { ConfirmRejectProjectModalProps } from './ConfirmRejectProjectModal/ConfirmRejectProjectModal'
import { ConfirmDeleteSourceFileModalProps } from './ConfirmDeleteSourceFileModal/ConfirmDeleteSourceFileModal'
import { ConfirmAssignmentCompletionModalProps } from './ConfirmAssignmentCompletionModal/ConfirmAssignmentCompletionModal'
import { ReassignProjectModalProps } from './ReassignProjectModal/ReassignProjectModal'
import { ConfirmCompleteTaskModalProps } from './ConfirmCompleteTaskModal/ConfirmCompleteTaskModal'
import { ConfirmSendToPreviousTaskModalProps } from './ConfirmSendToPreviousTaskModal/ConfirmSendToPreviousTaskModal'
import { EditVendorPricesModalProps } from './EditVendorPricesModal/EditVendorPricesModal'
import { EditInstitutionPartnerPricesModalProps } from './EditInstitutionPartnerPricesModal/EditInstitutionPartnerPricesModal'
import { ConfirmAssignmentFinishedModalProps } from './ConfirmAssignmentFinishedModal/ConfirmAssignmentFinishedModal'
import { ConfirmSendToPreviousAssignmentModalProps } from './ConfirmSendToPreviousAssignmentModal/ConfirmSendToPreviousAssignmentModal'
import { TranslationMemoryBulkExportModalProps } from './TranslationMemoryBulkExportModal/TranslationMemoryBulkExportModal'
import { EmoSchedulesModalProps } from './EmoSchedulesModal/EmoSchedulesModal'
import { VendorAbsencesModalProps } from './VendorAbsencesModal/VendorAbsencesModal'
import { AddOutsourceRequestModalProps } from './AddOutsourceRequestModal/AddOutsourceRequestModal'
import { ConfirmDeclineOfferModalProps } from './ConfirmDeclineOfferModal/ConfirmDeclineOfferModal'
import { SelectOutsourceOfferModalProps } from './SelectOutsourceOfferModal/SelectOutsourceOfferModal'
import { ConfirmCancelRequestModalProps } from './ConfirmCancelRequestModal/ConfirmCancelRequestModal'
import { ViewVendorResponseModalProps } from './ViewVendorResponseModal/ViewVendorResponseModal'
import { InstitutionPartnersEditModalProps } from './InstitutionPartnersEditModal/InstitutionPartnersEditModal'
import { AddCatJobFilesModalProps } from './AddCatJobFilesModal/AddCatJobFilesModal'
import { AnalysisDetailsModalProps } from './AnalysisDetailsModal/AnalysisDetailsModal'

const InstitutionSelectModal = lazy(
  () => import('./InstitutionSelectModal/InstitutionSelectModal')
)
const TooltipModal = lazy(() => import('./TooltipModal/TooltipModal'))
const UserAndRoleManagementModal = lazy(
  () => import('./UserAndRoleManagementModal/UserAndRoleManagementModal')
)
const EditableListModal = lazy(
  () => import('./EditableListModal/EditableListModal')
)
const AuditLogSettingsModal = lazy(
  () => import('./AuditLogSettingsModal/AuditLogSettingsModal')
)

const ConfirmationModal = lazy(
  () => import('./ConfirmationModal/ConfirmationModal')
)
const DateTimeRangeFormModal = lazy(
  () => import('./DateTimeRangeFormModal/DateTimeRangeFormModal')
)
const DateRangeFormModal = lazy(
  () => import('./DateRangeFormModal/DateRangeFormModal')
)

const VendorsEditModal = lazy(
  () => import('./VendorsEditModal/VendorsEditModal')
)
const SelectVendorModal = lazy(
  () => import('./SelectVendorModal/SelectVendorModal')
)
const AddVolumeModal = lazy(() => import('./AddVolumeModal/AddVolumeModal'))
const VolumeChangeModal = lazy(
  () => import('./VolumeChangeModal/VolumeChangeModal')
)
const ConfirmDeleteVolumeModal = lazy(
  () => import('./ConfirmDeleteVolumeModal/ConfirmDeleteVolumeModal')
)

const AddTranslationMemoriesModal = lazy(
  () => import('./AddTranslationMemoriesModal/AddTranslationMemoriesModal')
)

const AddCatJobFilesModal = lazy(
  () => import('./AddCatJobFilesModal/AddCatJobFilesModal')
)

const AnalysisDetailsModal = lazy(
  () => import('./AnalysisDetailsModal/AnalysisDetailsModal')
)

const ConfirmCancelProjectModal = lazy(
  () => import('./ConfirmCancelProjectModal/ConfirmCancelProjectModal')
)

const ConfirmRejectProjectModal = lazy(
  () => import('./ConfirmRejectProjectModal/ConfirmRejectProjectModal')
)

const ConfirmDeleteSourceFileModal = lazy(
  () => import('./ConfirmDeleteSourceFileModal/ConfirmDeleteSourceFileModal')
)

const ConfirmAssignmentCompletionModal = lazy(
  () =>
    import('./ConfirmAssignmentCompletionModal/ConfirmAssignmentCompletionModal')
)

const ReassignProjectModal = lazy(
  () => import('./ReassignProjectModal/ReassignProjectModal')
)

const ConfirmCompleteTaskModal = lazy(
  () => import('./ConfirmCompleteTaskModal/ConfirmCompleteTaskModal')
)

const ConfirmSendToPreviousTaskModal = lazy(
  () =>
    import('./ConfirmSendToPreviousTaskModal/ConfirmSendToPreviousTaskModal')
)

const EditVendorPricesModal = lazy(
  () => import('./EditVendorPricesModal/EditVendorPricesModal')
)

const ConfirmAssignmentFinishedModal = lazy(
  () =>
    import('./ConfirmAssignmentFinishedModal/ConfirmAssignmentFinishedModal')
)

const ConfirmSendToPreviousAssignmentModal = lazy(
  () =>
    import('./ConfirmSendToPreviousAssignmentModal/ConfirmSendToPreviousAssignmentModal')
)

const TranslationMemoryBulkExportModal = lazy(
  () =>
    import('./TranslationMemoryBulkExportModal/TranslationMemoryBulkExportModal')
)

const EmoSchedulesModal = lazy(
  () => import('./EmoSchedulesModal/EmoSchedulesModal')
)

const VendorAbsencesModal = lazy(
  () => import('./VendorAbsencesModal/VendorAbsencesModal')
)

const AddOutsourceRequestModal = lazy(
  () => import('./AddOutsourceRequestModal/AddOutsourceRequestModal')
)

const ConfirmDeclineOfferModal = lazy(
  () => import('./ConfirmDeclineOfferModal/ConfirmDeclineOfferModal')
)

const SelectOutsourceOfferModal = lazy(
  () => import('./SelectOutsourceOfferModal/SelectOutsourceOfferModal')
)

const ConfirmCancelRequestModal = lazy(
  () => import('./ConfirmCancelRequestModal/ConfirmCancelRequestModal')
)

const ViewVendorResponseModal = lazy(
  () => import('./ViewVendorResponseModal/ViewVendorResponseModal')
)

const InstitutionPartnersEditModal = lazy(
  () => import('./InstitutionPartnersEditModal/InstitutionPartnersEditModal')
)

const EditInstitutionPartnerPricesModal = lazy(
  () =>
    import(
      './EditInstitutionPartnerPricesModal/EditInstitutionPartnerPricesModal'
    )
)

export enum ModalTypes {
  InstitutionSelect = 'institutionSelect',
  UserAndRoleManagement = 'userAndRoleManagement',
  Tooltip = 'tooltip',
  EditableListModal = 'editableListModal',
  AuditLogSettingsModal = 'auditLogSettingsModal',
  ConfirmationModal = 'confirmationModal',
  DateTimeRangeForm = 'dateTimeRangeForm',
  DateRangeForm = 'dateRangeForm',
  VendorsEdit = 'vendorsEdit',
  SelectVendor = 'selectVendor',
  AddVolume = 'addVolume',
  VolumeChange = 'volumeChange',
  ConfirmDeleteVolume = 'confirmDeleteVolume',
  AddTranslationMemories = 'addTranslationMemories',
  AddCatJobFiles = 'addCatJobFiles',
  CatAnalysisDetails = 'catAnalysisDetails',
  ConfirmCancelProject = 'confirmCancelProject',
  ConfirmRejectProject = 'confirmRejectProject',
  ConfirmDeleteSourceFile = 'confirmDeleteSourceFile',
  ConfirmAssignmentCompletion = 'confirmAssignmentCompletion',
  ReassignProject = 'reassignProject',
  ConfirmCompleteTask = 'confirmCompleteTask',
  ConfirmSendToPreviousTask = 'confirmSendToPreviousTask',
  EditVendorPrices = 'editVendorPrices',
  ConfirmAssignmentFinished = 'confirmAssignmentFinished',
  ConfirmSendToPreviousAssignment = 'confirmSendToPreviousAssignment',
  TranslationMemoryBulkExportModal = 'translationMemoryBulkExportModal',
  EmoSchedules = 'emoSchedules',
  VendorAbsences = 'vendorAbsences',
  AddOutsourceRequest = 'addOutsourceRequest',
  ConfirmDeclineRequest = 'confirmDeclineRequest',
  SelectOutsourceOffer = 'selectOutsourceOffer',
  ConfirmCancelRequest = 'confirmCancelRequest',
  ViewVendorResponse = 'viewVendorResponse',
  InstitutionPartnersEdit = 'institutionPartnersEdit',
  EditInstitutionPartnerPrices = 'editInstitutionPartnerPrices',
}

// Add other modal props types here as well
type ModalPropTypes =
  | Omit<InstitutionSelectModalProps, 'closeModal'>
  | Omit<UserAndRoleManagementModalProps, 'closeModal'>
  | Omit<TooltipModalProps, 'closeModal'>
  | Omit<EditableListModalProps, 'closeModal'>
  | Omit<AuditLogSettingsModalProps, 'closeModal'>
  | Omit<ConfirmationModalBaseProps, 'closeModal'>
  | Omit<DateTimeRangeFormModalProps, 'closeModal'>
  | Omit<DateRangeFormModalProps, 'closeModal'>
  | Omit<VendorsEditModalProps, 'closeModal'>
  | Omit<SelectVendorModalProps, 'closeModal'>
  | Omit<AddVolumeModalProps, 'closeModal'>
  | Omit<VolumeChangeModalProps, 'closeModal'>
  | Omit<ConfirmDeleteVolumeModalProps, 'closeModal'>
  | Omit<AddCatJobFilesModalProps, 'closeModal'>
  | Omit<AnalysisDetailsModalProps, 'closeModal'>
  | Omit<ConfirmCancelProjectModalProps, 'closeModal'>
  | Omit<ConfirmRejectProjectModalProps, 'closeModal'>
  | Omit<ConfirmDeleteSourceFileModalProps, 'closeModal'>
  | Omit<ConfirmAssignmentCompletionModalProps, 'closeModal'>
  | Omit<ReassignProjectModalProps, 'closeModal'>
  | Omit<ConfirmCompleteTaskModalProps, 'closeModal'>
  | Omit<ConfirmSendToPreviousTaskModalProps, 'closeModal'>
  | Omit<EditVendorPricesModalProps, 'closeModal'>
  | Omit<ConfirmAssignmentFinishedModalProps, 'closeModal'>
  | Omit<ConfirmSendToPreviousAssignmentModalProps, 'closeModal'>
  | Omit<TranslationMemoryBulkExportModalProps, 'closeModal'>
  | Omit<EmoSchedulesModalProps, 'closeModal'>
  | Omit<VendorAbsencesModalProps, 'closeModal'>
  | Omit<AddOutsourceRequestModalProps, 'closeModal'>
  | Omit<ConfirmDeclineOfferModalProps, 'closeModal'>
  | Omit<SelectOutsourceOfferModalProps, 'closeModal'>
  | Omit<ConfirmCancelRequestModalProps, 'closeModal'>
  | Omit<ViewVendorResponseModalProps, 'closeModal'>
  | Omit<InstitutionPartnersEditModalProps, 'closeModal'>
  | Omit<EditInstitutionPartnerPricesModalProps, 'closeModal'>

const MODALS = {
  [ModalTypes.InstitutionSelect]: InstitutionSelectModal,
  [ModalTypes.UserAndRoleManagement]: UserAndRoleManagementModal,
  [ModalTypes.Tooltip]: TooltipModal,
  [ModalTypes.EditableListModal]: EditableListModal,
  [ModalTypes.AuditLogSettingsModal]: AuditLogSettingsModal,
  [ModalTypes.ConfirmationModal]: ConfirmationModal,
  [ModalTypes.DateTimeRangeForm]: DateTimeRangeFormModal,
  [ModalTypes.DateRangeForm]: DateRangeFormModal,
  [ModalTypes.VendorsEdit]: VendorsEditModal,
  [ModalTypes.SelectVendor]: SelectVendorModal,
  [ModalTypes.AddVolume]: AddVolumeModal,
  [ModalTypes.VolumeChange]: VolumeChangeModal,
  [ModalTypes.ConfirmDeleteVolume]: ConfirmDeleteVolumeModal,
  [ModalTypes.AddTranslationMemories]: AddTranslationMemoriesModal,
  [ModalTypes.AddCatJobFiles]: AddCatJobFilesModal,
  [ModalTypes.CatAnalysisDetails]: AnalysisDetailsModal,
  [ModalTypes.ConfirmCancelProject]: ConfirmCancelProjectModal,
  [ModalTypes.ConfirmRejectProject]: ConfirmRejectProjectModal,
  [ModalTypes.ConfirmDeleteSourceFile]: ConfirmDeleteSourceFileModal,
  [ModalTypes.ConfirmAssignmentCompletion]: ConfirmAssignmentCompletionModal,
  [ModalTypes.ReassignProject]: ReassignProjectModal,
  [ModalTypes.ConfirmCompleteTask]: ConfirmCompleteTaskModal,
  [ModalTypes.ConfirmSendToPreviousTask]: ConfirmSendToPreviousTaskModal,
  [ModalTypes.EditVendorPrices]: EditVendorPricesModal,
  [ModalTypes.ConfirmAssignmentFinished]: ConfirmAssignmentFinishedModal,
  [ModalTypes.ConfirmSendToPreviousAssignment]:
    ConfirmSendToPreviousAssignmentModal,
  [ModalTypes.TranslationMemoryBulkExportModal]:
    TranslationMemoryBulkExportModal,
  [ModalTypes.EmoSchedules]: EmoSchedulesModal,
  [ModalTypes.VendorAbsences]: VendorAbsencesModal,
  [ModalTypes.AddOutsourceRequest]: AddOutsourceRequestModal,
  [ModalTypes.ConfirmDeclineRequest]: ConfirmDeclineOfferModal,
  [ModalTypes.SelectOutsourceOffer]: SelectOutsourceOfferModal,
  [ModalTypes.ConfirmCancelRequest]: ConfirmCancelRequestModal,
  [ModalTypes.ViewVendorResponse]: ViewVendorResponseModal,
  [ModalTypes.InstitutionPartnersEdit]: InstitutionPartnersEditModal,
  [ModalTypes.EditInstitutionPartnerPrices]: EditInstitutionPartnerPricesModal,
}

interface RefType {
  showModal: (modalKey: ModalTypes, modalProps: object) => void
  closeModal: () => void
  isModalOpen: boolean
}

export const modalRef = createRef<RefType>()

const ModalRoot = () => {
  const [isModalOpen, setIsOpen] = useState(false)
  const [currentModalProps, setCurrentModalProps] = useState<ModalPropTypes>({})
  const [currentModalKey, setCurrentModalKey] = useState<ModalTypes>()
  const [focusElement, setFocusElement] = useState<HTMLElement | null>(null)

  // TODO: figure out how to improve typescript here
  // so that every modal would accepts only their own props
  const showModal = useCallback(
    (modalKey: ModalTypes, modalProps: object) => {
      setCurrentModalProps(modalProps)
      setCurrentModalKey(modalKey)
      setIsOpen(true)
    },
    [setCurrentModalProps, setIsOpen]
  )
  const removeFocusClass = useCallback(() => {
    if (!!focusElement && !!document.querySelector('.last-focus')) {
      focusElement?.classList.remove('last-focus')
      focusElement?.focus()
    }
  }, [focusElement])

  const closeModal = useCallback(() => {
    setIsOpen(false)
    setTimeout(removeFocusClass, 300)
    setTimeout(setFocusElement, 500, null)
  }, [setIsOpen, removeFocusClass])

  const handleButtonClick = useCallback(
    (event: Event) => {
      if (!document.querySelector('.last-focus') && isModalOpen) {
        const target = event?.target as HTMLElement
        target.classList.add('last-focus')
        setFocusElement(target)
      }
    },
    [isModalOpen]
  )

  useEffect(() => {
    document.addEventListener('click', function (event) {
      const target = event?.target as HTMLElement
      if (target?.nodeName === 'BUTTON') {
        handleButtonClick(event)
      }
    })
    return () => {
      document.removeEventListener('click', handleButtonClick)
    }
  }, [handleButtonClick])

  useImperativeHandle(
    modalRef,
    () => ({
      showModal,
      closeModal,
      isModalOpen,
    }),
    [closeModal, showModal, isModalOpen]
  )

  if (!currentModalKey || !isModalOpen) return null
  const SelectedModal = MODALS[currentModalKey]

  return (
    <Suspense fallback={<div />}>
      <SelectedModal
        isModalOpen={isModalOpen}
        closeModal={closeModal}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(currentModalProps as any)}
      />
    </Suspense>
  )
}

export default ModalRoot

export const showModal = (modalKey: ModalTypes, modalProps: object) =>
  modalRef?.current?.showModal(modalKey, modalProps)

export const closeModal = () => modalRef?.current?.closeModal()
