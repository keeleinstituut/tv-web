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
  handleCancel?: () => void
  className?: string
  dynamicForm?: JSX.Element
}

const UserAndRoleManagementModal: FC<UserAndRoleManagementModalProps> = ({
  title,
  cancelButtonContent,
  proceedButtonContent,
  modalContent,
  isModalOpen,
  closeModal,
  handleProceed,
  handleCancel,
  className,
  dynamicForm,
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
          onClick: () => {
            if (handleCancel) {
              handleCancel()
            } else {
              closeModal()
            }
          },
        },
        {
          appearance: AppearanceTypes.Primary,
          onClick: () => {
            if (handleProceed) {
              handleProceed()
            } else {
              closeModal()
            }
          },
          children: proceedButtonContent || t('button.yes'),
        },
      ]}
    >
      <div>{modalContent}</div>
      {dynamicForm}
    </ModalBase>
  )
}

export default UserAndRoleManagementModal
