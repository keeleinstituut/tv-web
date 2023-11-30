import { FC, ReactElement } from 'react'
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
import classNames from 'classnames'

import classes from './classes.module.scss'

export interface TooltipModalProps {
  title?: string
  textButtonContent?: string
  modalContent?: ReactElement | string
  href?: string
  isModalOpen?: boolean
  closeModal: () => void
  className?: string
}

const TooltipModal: FC<TooltipModalProps> = ({
  title,
  textButtonContent,
  modalContent,
  href,
  isModalOpen,
  closeModal,
  className,
}) => {
  const { t } = useTranslation()

  return (
    <ModalBase
      title={title}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      className={classNames(classes.modalContent, className)}
      buttonsPosition={ButtonPositionTypes.SpaceBetween}
      buttons={[
        {
          appearance: AppearanceTypes.Text,
          children: textButtonContent,
          size: SizeTypes.M,
          href: href,
          iconPositioning: IconPositioningTypes.Left,
          onClick: closeModal,
        },
        {
          appearance: AppearanceTypes.Secondary,
          onClick: closeModal,
          children: t('button.close'),
          autoFocus: true,
        },
      ]}
    >
      <div className={classes.contentStyle}>{modalContent}</div>
    </ModalBase>
  )
}

export default TooltipModal
