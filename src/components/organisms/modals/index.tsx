import { mapValues } from 'lodash'
import { InstitutionSelectModalProps } from './InstitutionSelectModal/InstitutionSelectModal'
import {
  lazy,
  useState,
  useCallback,
  createRef,
  useImperativeHandle,
} from 'react'

const InstitutionSelectModal = lazy(
  () => import('./InstitutionSelectModal/InstitutionSelectModal')
)

export enum ModalTypes {
  InstitutionSelect = 'institutionSelect',
}

// Add other modal props types here as well
type ModalPropTypes = Omit<InstitutionSelectModalProps, 'closeModal'>

const MODALS = {
  institutionSelect: InstitutionSelectModal,
}

interface RefType {
  showModal: (modalKey: ModalTypes, modalProps: object) => void
  closeModal: () => void
  isModalOpen: boolean
}

export const modalKeys = mapValues(MODALS, (_, key) => key)
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
    <SelectedModal
      isModalOpen={isModalOpen}
      closeModal={closeModal}
      {...currentModalProps}
    />
  )
}

export default ModalRoot

export const showModal = (modalKey: ModalTypes, modalProps: object) =>
  modalRef?.current?.showModal(modalKey, modalProps)

export const closeModal = () => modalRef?.current?.closeModal()
