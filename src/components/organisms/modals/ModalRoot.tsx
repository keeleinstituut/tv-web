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
import { CatSplitModalProps } from './CatSplitModal/CatSplitModal'
import { CatMergeModalProps } from './CatMergeModal/CatMergeModal'
import { EditableListModalProps } from './EditableListModal/EditableListModal'
import { ConfirmSendToCatModalProps } from './ConfirmSendToCatModal/ConfirmSendToCatModal'
import { CatAnalysisModalProps } from './CatAnalysisModal/CatAnalysisModal'
import { ConfirmationModalBaseProps } from './ConfirmationModalBase/ConfirmationModalBase'
import { DateTimeRangeFormModalProps } from './DateTimeRangeFormModal/DateTimeRangeFormModal'
import { VendorsEditModalProps } from './VendorsEditModal/VendorsEditModal'
import { SelectVendorModalProps } from './SelectVendorModal/SelectVendorModal'
import { AddVolumeModalProps } from './AddVolumeModal/AddVolumeModal'
import { VolumeChangeModalProps } from './VolumeChangeModal/VolumeChangeModal'
import { ConfirmDeleteVolumeModalProps } from './ConfirmDeleteVolumeModal/ConfirmDeleteVolumeModal'
import { ConfirmCancelProjectModalProps } from './ConfirmCancelProjectModal/ConfirmCancelProjectModal'
import { ConfirmRejectProjectModalProps } from './ConfirmRejectProjectModal/ConfirmRejectProjectModal'
import { ConfirmDeleteSourceFileModalProps } from './ConfirmDeleteSourceFileModal/ConfirmDeleteSourceFileModal'
import { ConfirmTmWritableModalProps } from './ConfirmTmWritableModal/ConfirmTmWritableModal'
import { ConfirmAssignmentCompletionModalProps } from './ConfirmAssignmentCompletionModal/ConfirmAssignmentCompletionModal'
import { ReassignProjectModalProps } from './ReassignProjectModal/ReassignProjectModal'
import { ConfirmCompleteTaskModalProps } from './ConfirmCompleteTaskModal/ConfirmCompleteTaskModal'
import { ConfirmSendToPreviousTaskModalProps } from './ConfirmSendToPreviousTaskModal/ConfirmSendToPreviousTaskModal'
import { EditVendorPricesModalProps } from './EditVendorPricesModal/EditVendorPricesModal'
import { ConfirmAssignmentFinishedModalProps } from './ConfirmAssignmentFinishedModal/ConfirmAssignmentFinishedModal'

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

const ConfirmSendToCatModal = lazy(
  () => import('./ConfirmSendToCatModal/ConfirmSendToCatModal')
)
const CatSplitModal = lazy(() => import('./CatSplitModal/CatSplitModal'))
const CatMergeModal = lazy(() => import('./CatMergeModal/CatMergeModal'))

const ConfirmationModal = lazy(
  () => import('./ConfirmationModal/ConfirmationModal')
)
const CatAnalysisModal = lazy(
  () => import('./CatAnalysisModal/CatAnalysisModal')
)
const DateTimeRangeFormModal = lazy(
  () => import('./DateTimeRangeFormModal/DateTimeRangeFormModal')
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

const ConfirmCancelProjectModal = lazy(
  () => import('./ConfirmCancelProjectModal/ConfirmCancelProjectModal')
)

const ConfirmRejectProjectModal = lazy(
  () => import('./ConfirmRejectProjectModal/ConfirmRejectProjectModal')
)

const ConfirmDeleteSourceFileModal = lazy(
  () => import('./ConfirmDeleteSourceFileModal/ConfirmDeleteSourceFileModal')
)

const ConfirmTmWritableModal = lazy(
  () => import('./ConfirmTmWritableModal/ConfirmTmWritableModal')
)

const ConfirmAssignmentCompletionModal = lazy(
  () =>
    import(
      './ConfirmAssignmentCompletionModal/ConfirmAssignmentCompletionModal'
    )
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

export enum ModalTypes {
  InstitutionSelect = 'institutionSelect',
  UserAndRoleManagement = 'userAndRoleManagement',
  Tooltip = 'tooltip',
  CatSplit = 'catSplit',
  CatMerge = 'catMerge',
  EditableListModal = 'editableListModal',
  ConfirmationModal = 'confirmationModal',
  ConfirmSendToCat = 'confirmSendToCat',
  CatAnalysis = 'catAnalysis',
  DateTimeRangeForm = 'dateTimeRangeForm',
  VendorsEdit = 'vendorsEdit',
  SelectVendor = 'selectVendor',
  AddVolume = 'addVolume',
  VolumeChange = 'volumeChange',
  ConfirmDeleteVolume = 'confirmDeleteVolume',
  AddTranslationMemories = 'addTranslationMemories',
  ConfirmCancelProject = 'confirmCancelProject',
  ConfirmRejectProject = 'confirmRejectProject',
  ConfirmDeleteSourceFile = 'confirmDeleteSourceFile',
  ConfirmTmWritable = 'confirmTmWritable',
  ConfirmAssignmentCompletion = 'confirmAssignmentCompletion',
  ReassignProject = 'reassignProject',
  ConfirmCompleteTask = 'confirmCompleteTask',
  ConfirmSendToPreviousTask = 'confirmSendToPreviousTask',
  EditVendorPrices = 'editVendorPrices',
  ConfirmAssignmentFinished = 'confirmAssignmentFinished',
}

// Add other modal props types here as well
type ModalPropTypes =
  | Omit<InstitutionSelectModalProps, 'closeModal'>
  | Omit<UserAndRoleManagementModalProps, 'closeModal'>
  | Omit<TooltipModalProps, 'closeModal'>
  | Omit<CatSplitModalProps, 'closeModal'>
  | Omit<CatMergeModalProps, 'closeModal'>
  | Omit<EditableListModalProps, 'closeModal'>
  | Omit<ConfirmationModalBaseProps, 'closeModal'>
  | Omit<ConfirmSendToCatModalProps, 'closeModal'>
  | Omit<CatAnalysisModalProps, 'closeModal'>
  | Omit<DateTimeRangeFormModalProps, 'closeModal'>
  | Omit<VendorsEditModalProps, 'closeModal'>
  | Omit<SelectVendorModalProps, 'closeModal'>
  | Omit<AddVolumeModalProps, 'closeModal'>
  | Omit<VolumeChangeModalProps, 'closeModal'>
  | Omit<ConfirmDeleteVolumeModalProps, 'closeModal'>
  | Omit<ConfirmCancelProjectModalProps, 'closeModal'>
  | Omit<ConfirmRejectProjectModalProps, 'closeModal'>
  | Omit<ConfirmDeleteSourceFileModalProps, 'closeModal'>
  | Omit<ConfirmTmWritableModalProps, 'closeModal'>
  | Omit<ConfirmAssignmentCompletionModalProps, 'closeModal'>
  | Omit<ReassignProjectModalProps, 'closeModal'>
  | Omit<ConfirmCompleteTaskModalProps, 'closeModal'>
  | Omit<ConfirmSendToPreviousTaskModalProps, 'closeModal'>
  | Omit<EditVendorPricesModalProps, 'closeModal'>
  | Omit<ConfirmAssignmentFinishedModalProps, 'closeModal'>

const MODALS = {
  [ModalTypes.InstitutionSelect]: InstitutionSelectModal,
  [ModalTypes.UserAndRoleManagement]: UserAndRoleManagementModal,
  [ModalTypes.Tooltip]: TooltipModal,
  [ModalTypes.CatSplit]: CatSplitModal,
  [ModalTypes.CatMerge]: CatMergeModal,
  [ModalTypes.EditableListModal]: EditableListModal,
  [ModalTypes.ConfirmationModal]: ConfirmationModal,
  [ModalTypes.ConfirmSendToCat]: ConfirmSendToCatModal,
  [ModalTypes.CatAnalysis]: CatAnalysisModal,
  [ModalTypes.DateTimeRangeForm]: DateTimeRangeFormModal,
  [ModalTypes.VendorsEdit]: VendorsEditModal,
  [ModalTypes.SelectVendor]: SelectVendorModal,
  [ModalTypes.AddVolume]: AddVolumeModal,
  [ModalTypes.VolumeChange]: VolumeChangeModal,
  [ModalTypes.ConfirmDeleteVolume]: ConfirmDeleteVolumeModal,
  [ModalTypes.AddTranslationMemories]: AddTranslationMemoriesModal,
  [ModalTypes.ConfirmCancelProject]: ConfirmCancelProjectModal,
  [ModalTypes.ConfirmRejectProject]: ConfirmRejectProjectModal,
  [ModalTypes.ConfirmDeleteSourceFile]: ConfirmDeleteSourceFileModal,
  [ModalTypes.ConfirmTmWritable]: ConfirmTmWritableModal,
  [ModalTypes.ConfirmAssignmentCompletion]: ConfirmAssignmentCompletionModal,
  [ModalTypes.ReassignProject]: ReassignProjectModal,
  [ModalTypes.ConfirmCompleteTask]: ConfirmCompleteTaskModal,
  [ModalTypes.ConfirmSendToPreviousTask]: ConfirmSendToPreviousTaskModal,
  [ModalTypes.EditVendorPrices]: EditVendorPricesModal,
  [ModalTypes.ConfirmAssignmentFinished]: ConfirmAssignmentFinishedModal,
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
        {...currentModalProps}
      />
    </Suspense>
  )
}

export default ModalRoot

export const showModal = (modalKey: ModalTypes, modalProps: object) =>
  modalRef?.current?.showModal(modalKey, modalProps)

export const closeModal = () => modalRef?.current?.closeModal()
