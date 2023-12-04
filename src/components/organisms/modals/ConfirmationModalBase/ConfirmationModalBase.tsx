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
  helperText?: string | ReactElement
  className?: string
  size?: ModalSizeTypes
  proceedButtonDisabled?: boolean
  proceedButtonLoading?: boolean
  cancelButtonDisabled?: boolean
  proceedButtonHidden?: boolean
}

const ConfirmationModalBase: FC<ConfirmationModalBaseProps> = ({
  title,
  cancelButtonContent,
  cancelButtonDisabled,
  proceedButtonContent,
  proceedButtonDisabled,
  proceedButtonLoading,
  proceedButtonHidden,
  modalContent,
  isModalOpen,
  closeModal,
  handleProceed,
  className,
  helperText,
  handleCancel,
  size,
  ...rest
}) => {
  const { t } = useTranslation()
  return (
    <ModalBase
      {...rest}
      title={title}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      buttonsPosition={ButtonPositionTypes.Right}
      helperText={helperText}
      className={className}
      size={size}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          children: cancelButtonContent || t('button.no'),
          disabled: cancelButtonDisabled,
          size: SizeTypes.M,
          autoFocus: true,
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
          disabled: proceedButtonDisabled,
          loading: proceedButtonLoading,
          onClick: () => {
            if (handleProceed) {
              handleProceed()
            } else {
              closeModal()
            }
          },
          children: proceedButtonContent || t('button.yes'),
          hidden: proceedButtonHidden,
        },
      ]}
    >
      {modalContent}
    </ModalBase>
  )
}

export default ConfirmationModalBase
