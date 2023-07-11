import { FC, ReactElement } from 'react'
import { AppearanceTypes, SizeTypes } from 'components/molecules/Button/Button'
import ModalBase, {
  ButtonPositionTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'

export interface UserAndRoleManagementModalProps {
  title?: string
  cancelButtonContent?: string
  proceedButtonContent?: string
  modalContent?: string | ReactElement
  isModalOpen?: boolean
  closeModal: () => void
  handleProceed?: () => void
  className?: string
}

const UserAndRoleManagementModal: FC<UserAndRoleManagementModalProps> = ({
  title,
  cancelButtonContent,
  proceedButtonContent,
  modalContent,
  isModalOpen,
  closeModal,
  handleProceed,
  className,
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
      <div>{modalContent}</div>
    </ModalBase>
  )
}

export default UserAndRoleManagementModal
