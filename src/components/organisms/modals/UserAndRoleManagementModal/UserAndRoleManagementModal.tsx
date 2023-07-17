import { FC, ReactElement } from 'react'
import { AppearanceTypes, SizeTypes } from 'components/molecules/Button/Button'
import ModalBase, {
  ButtonPositionTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { useTranslation } from 'react-i18next'

export interface UserAndRoleManagementModalProps {
  title?: string
  cancelButtonContent?: string
  proceedButtonContent?: string
  modalContent?: string | ReactElement
  isModalOpen?: boolean
  closeModal: () => void
  handleProceed?: () => void
  className?: string
  deactivationForm?: JSX.Element
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
  deactivationForm,
}) => {
  const { t } = useTranslation()
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
          children: cancelButtonContent || t('button.no'),
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
          children: proceedButtonContent || t('button.yes'),
        },
      ]}
    >
      <div>{modalContent}</div>
      {deactivationForm}
    </ModalBase>
  )
}

export default UserAndRoleManagementModal
