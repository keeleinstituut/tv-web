import { FC } from 'react'
import { AppearanceTypes, SizeTypes } from 'components/molecules/Button/Button'
import ModalBase, {
  ButtonPositionTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'

export interface DeactivateUserModalProps {
  title?: string
  cancelButtonContent?: string
  proceedButtonContent?: string
  modalContent?: string
  isModalOpen?: boolean
  closeModal: () => void
  handleProceed?: () => void
  className?: string
  deactivationForm?: JSX.Element
}

const DeactivateUserModal: FC<DeactivateUserModalProps> = ({
  title,
  cancelButtonContent,
  proceedButtonContent,
  isModalOpen,
  closeModal,
  handleProceed,
  className,
  deactivationForm,
}) => {
  return (
    <ModalBase
      title={title}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      buttonsPosition={ButtonPositionTypes.Right}
      className={className}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          children: cancelButtonContent,
          size: SizeTypes.M,
          onClick: closeModal,
        },
        {
          appearance: AppearanceTypes.Primary,
          onClick: () => {
            if (handleProceed) {
              handleProceed()
            }
            closeModal()
          },
          children: proceedButtonContent,
        },
      ]}
    >
      {deactivationForm}
    </ModalBase>
  )
}

export default DeactivateUserModal
