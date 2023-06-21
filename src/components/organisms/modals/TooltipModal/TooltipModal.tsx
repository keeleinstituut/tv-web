import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AppearanceTypes,
  IconPositioningTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import ModalBase, {
  ButtonPositionTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import classes from './styles.module.scss'

export type TooltipModalProps = {
  title?: string
  textButtonContent?: string
  modalContent?: string
  href?: string
  handleModalClose?: () => void
  isModalOpen?: boolean
}

const TooltipModal: FC<TooltipModalProps> = ({
  title,
  textButtonContent,
  handleModalClose,
  modalContent,
  href,
  isModalOpen,
}) => {
  const { t } = useTranslation()

  return (
    <ModalBase
      title={title}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      className={classes.modalContent}
      buttonsPosition={ButtonPositionTypes.SpaceBetween}
      buttons={[
        {
          appearance: AppearanceTypes.Text,
          children: textButtonContent,
          size: SizeTypes.M,
          href: href,
          iconPositioning: IconPositioningTypes.Left,
        },
        {
          appearance: AppearanceTypes.Secondary,
          onClick: handleModalClose,
          children: t('button.close'),
        },
      ]}
    >
      <div>{modalContent}</div>
    </ModalBase>
  )
}

export default TooltipModal
