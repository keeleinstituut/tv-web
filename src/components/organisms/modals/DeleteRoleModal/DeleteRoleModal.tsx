import { FC, useCallback } from 'react'
import { AppearanceTypes, SizeTypes } from 'components/molecules/Button/Button'
import ModalBase, {
  ButtonPositionTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'

export interface DeleteRoleModalProps {
  title?: string
  cancelButtonContent?: string
  proceedButtonContent?: string
  modalContent?: string
  isModalOpen?: boolean
  closeModal: () => void
  handleProceed?: () => void
}

const DeleteRoleModal: FC<DeleteRoleModalProps> = ({
  title,
  cancelButtonContent,
  proceedButtonContent,
  modalContent,
  isModalOpen,
  closeModal,
  handleProceed,
}) => {
  const handleClose = useCallback(() => {
    closeModal()
  }, [closeModal])

  return (
    <ModalBase
      title={title}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      buttonsPosition={ButtonPositionTypes.Right}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          children: cancelButtonContent,
          size: SizeTypes.M,
          onClick: handleClose,
        },
        {
          appearance: AppearanceTypes.Primary,
          onClick: () => {
            if (handleProceed) {
              handleProceed()
            }
            handleClose()
          },
          children: proceedButtonContent,
        },
      ]}
    >
      <div>{modalContent}</div>
    </ModalBase>
  )
}

export default DeleteRoleModal
