import { InstitutionSelectModalProps } from './InstitutionSelectModal/InstitutionSelectModal'
import { DeleteRoleModalProps } from './DeleteRoleModal/DeleteRoleModal'
import { TooltipModalProps } from './TooltipModal/TooltipModal'
import {
  lazy,
  useState,
  useCallback,
  createRef,
  useImperativeHandle,
  Suspense,
} from 'react'
import { DeactivateUserModalProps } from './DeactivateUserModal/DeactivateUserModal'

const InstitutionSelectModal = lazy(
  () => import('./InstitutionSelectModal/InstitutionSelectModal')
)
const DeleteRoleModal = lazy(() => import('./DeleteRoleModal/DeleteRoleModal'))
const DeactivateUserModal = lazy(
  () => import('./DeactivateUserModal/DeactivateUserModal')
)
const TooltipModal = lazy(() => import('./TooltipModal/TooltipModal'))

export enum ModalTypes {
  InstitutionSelect = 'institutionSelect',
  DeleteRole = 'deleteRole',
  DeactivateUser = 'deactivateUser',
  Tooltip = 'tooltip',
}

// Add other modal props types here as well
type ModalPropTypes =
  | Omit<InstitutionSelectModalProps, 'closeModal'>
  | Omit<DeleteRoleModalProps, 'closeModal'>
  | Omit<DeactivateUserModalProps, 'closeModal'>
  | Omit<TooltipModalProps, 'closeModal'>

const MODALS = {
  institutionSelect: InstitutionSelectModal,
  deleteRole: DeleteRoleModal,
  deactivateUser: DeactivateUserModal,
  tooltip: TooltipModal,
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
