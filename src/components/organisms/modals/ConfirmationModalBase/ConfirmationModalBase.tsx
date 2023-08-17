import { FC, ReactElement } from 'react'
import { AppearanceTypes, SizeTypes } from 'components/molecules/Button/Button'
import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { useTranslation } from 'react-i18next'

export interface ConfirmationModalBaseProps {
  title?: string
  cancelButtonContent?: string
  proceedButtonContent?: string
  modalContent?: string | ReactElement
  isModalOpen?: boolean
  closeModal: () => void
  handleProceed?: () => void
  handleCancel?: () => void
  className?: string
  size?: ModalSizeTypes
}

const ConfirmationModalBase: FC<ConfirmationModalBaseProps> = ({
  title,
  cancelButtonContent,
  proceedButtonContent,
  modalContent,
  isModalOpen,
  closeModal,
  handleProceed,
  className,
  handleCancel,
  size,
}) => {
  const { t } = useTranslation()
  return (
    <ModalBase
      title={title}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      buttonsPosition={ButtonPositionTypes.Right}
      className={className}
      size={size}
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
            }
            closeModal()
          },
          children: proceedButtonContent || t('button.yes'),
        },
      ]}
    >
      {modalContent}
    </ModalBase>
  )
}

export default ConfirmationModalBase
