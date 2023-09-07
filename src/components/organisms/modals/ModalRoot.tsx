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
} from 'react'
import { FormProgressProps } from './FormProgressModal/FormProgressModal'
import { CatSplitModalProps } from './CatSplitModal/CatSplitModal'
import { CatMergeModalProps } from './CatMergeModal/CatMergeModal'
import { EditableListModalProps } from './EditableListModal/EditableListModal'
import { ConfirmSendToCatModalProps } from './ConfirmSendToCatModal/ConfirmSendToCatModal'
import { CatAnalysisModalProps } from './CatAnalysisModal/CatAnalysisModal'
import { VendorsEditModalProps } from './VendorEditModal/VendorEditModal'

const InstitutionSelectModal = lazy(
  () => import('./InstitutionSelectModal/InstitutionSelectModal')
)
const TooltipModal = lazy(() => import('./TooltipModal/TooltipModal'))
const UserAndRoleManagementModal = lazy(
  () => import('./UserAndRoleManagementModal/UserAndRoleManagementModal')
)
const FormProgressModal = lazy(
  () => import('./FormProgressModal/FormProgressModal')
)
const EditableListModal = lazy(
  () => import('./EditableListModal/EditableListModal')
)

const ConfirmSendToCatModal = lazy(
  () => import('./ConfirmSendToCatModal/ConfirmSendToCatModal')
)

const CatSplitModal = lazy(() => import('./CatSplitModal/CatSplitModal'))

const CatMergeModal = lazy(() => import('./CatMergeModal/CatMergeModal'))

const CatAnalysisModal = lazy(
  () => import('./CatAnalysisModal/CatAnalysisModal')
)
const VendorsEditModal = lazy(() => import('./VendorEditModal/VendorEditModal'))

export enum ModalTypes {
  InstitutionSelect = 'institutionSelect',
  UserAndRoleManagement = 'userAndRoleManagement',
  Tooltip = 'tooltip',
  FormProgress = 'formProgress',
  CatSplit = 'catSplit',
  CatMerge = 'catMerge',
  EditableListModal = 'editableListModal',
  ConfirmSendToCat = 'confirmSendToCat',
  CatAnalysis = 'catAnalysis',
  VendorsEdit = 'vendorsEdit',
}

// Add other modal props types here as well
type ModalPropTypes =
  | Omit<InstitutionSelectModalProps, 'closeModal'>
  | Omit<UserAndRoleManagementModalProps, 'closeModal'>
  | Omit<TooltipModalProps, 'closeModal'>
  | Omit<FormProgressProps, 'closeModal'>
  | Omit<CatSplitModalProps, 'closeModal'>
  | Omit<CatMergeModalProps, 'closeModal'>
  | Omit<EditableListModalProps, 'closeModal'>
  | Omit<ConfirmSendToCatModalProps, 'closeModal'>
  | Omit<CatAnalysisModalProps, 'closeModal'>
  | Omit<VendorsEditModalProps, 'closeModal'>

const MODALS = {
  institutionSelect: InstitutionSelectModal,
  userAndRoleManagement: UserAndRoleManagementModal,
  tooltip: TooltipModal,
  formProgress: FormProgressModal,
  catSplit: CatSplitModal,
  catMerge: CatMergeModal,
  editableListModal: EditableListModal,
  confirmSendToCat: ConfirmSendToCatModal,
  catAnalysis: CatAnalysisModal,
  vendorsEdit: VendorsEditModal,
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

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  useImperativeHandle(
    modalRef,
    () => ({
      showModal,
      closeModal,
      isModalOpen,
    }),
    [closeModal, showModal, isModalOpen]
  )

  if (!currentModalKey) return null
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
