import { FC, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import classes from './classes.module.scss'

export interface EditVendorPriceListModalProps {
  title?: string
  modalContent?: ReactElement | string
  isModalOpen?: boolean
  closeModal: () => void
  helperText?: string
  submitForm?: () => void
  resetForm?: () => void
  isLoading?: boolean
}

const EditVendorPriceListModal: FC<EditVendorPriceListModalProps> = ({
  title,
  modalContent,
  isModalOpen,
  closeModal,
  helperText,
  resetForm,
  submitForm,
  isLoading,
}) => {
  const { t } = useTranslation()

  const handleQuit = () => {
    if (resetForm) {
      resetForm()
    }
    closeModal()
  }

  const handleProceed = () => {
    if (submitForm) {
      submitForm()
    }
  }

  return (
    <ModalBase
      title={title}
      helperText={helperText}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      className={classes.modalContent}
      buttonsPosition={ButtonPositionTypes.SpaceBetween}
      size={ModalSizeTypes.Big}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          iconPositioning: IconPositioningTypes.Left,
          children: t('button.quit'),
          onClick: handleQuit,
        },
        {
          appearance: AppearanceTypes.Primary,
          onClick: handleProceed,
          children: t('button.save'),
          loading: isLoading,
        },
      ]}
    >
      <div className={classes.contentStyle}>{modalContent}</div>
    </ModalBase>
  )
}

export default EditVendorPriceListModal
