import { FC, ReactElement } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import ModalBase, {
  ButtonPositionTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import classes from './classes.module.scss'

export interface EditVendorPriceListModalProps {
  title?: string
  modalContent?: ReactElement | string
  isModalOpen?: boolean
  closeModal: () => void
  helperText?: string
}

const EditVendorPriceListModal: FC<EditVendorPriceListModalProps> = ({
  title,
  modalContent,
  isModalOpen,
  closeModal,
  helperText,
}) => {
  const { t } = useTranslation()

  return (
    <ModalBase
      title={title}
      helperText={helperText}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      className={classes.modalContent}
      buttonsPosition={ButtonPositionTypes.SpaceBetween}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          iconPositioning: IconPositioningTypes.Left,
          children: t('button.quit'),
          onClick: closeModal,
        },
        {
          appearance: AppearanceTypes.Primary,
          onClick: closeModal,
          children: t('button.save'),
        },
      ]}
    >
      <div className={classes.contentStyle}>{modalContent}</div>
    </ModalBase>
  )
}

export default EditVendorPriceListModal
