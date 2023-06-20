import { FC, useCallback } from 'react'
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
import { InstitutionSelectModalProps } from 'components/organisms/modals/InstitutionSelectModal/InstitutionSelectModal'
import classes from './styles.module.scss'

export type TooltipModalProps = Omit<
  InstitutionSelectModalProps,
  'institutions' | 'onSelect'
> & {
  title?: string
  textButtonContent?: string
  modalContent?: string
  href?: string
}

const TooltipModal: FC<TooltipModalProps> = ({
  onClose,
  isModalOpen,
  closeModal,
  title,
  textButtonContent,
  modalContent,
  href,
}) => {
  const { t } = useTranslation()
  const handleClose = useCallback(() => {
    closeModal()
    if (onClose) {
      onClose()
    }
  }, [closeModal, onClose])

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
          onClick: handleClose,
          children: t('button.close'),
        },
      ]}
    >
      <div>{modalContent}</div>
    </ModalBase>
  )
}

export default TooltipModal
