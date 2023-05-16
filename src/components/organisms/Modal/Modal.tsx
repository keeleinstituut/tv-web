import {
  FC,
  ReactNode,
  PropsWithChildren,
  Dispatch,
  SetStateAction,
} from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import classNames from 'classnames'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { ReactComponent as Close } from 'assets/icons/close.svg'
import { useTranslation } from 'react-i18next'

import classes from './styles.module.scss'

export enum ModalSizeTypes {
  Narrow = 'narrow',
  Medium = 'medium',
  Big = 'big',
}

export enum ButtonPositionTypes {
  SpaceBetween = 'spaceBetween',
  Right = 'right',
  None = 'none',
}

export enum TitleFontTypes {
  Gray = 'gray',
  Black = 'black',
}

export interface ModalProps {
  title?: string
  trigger?: ReactNode
  customDialogContent?: string
  topButton?: boolean
  size?: ModalSizeTypes
  buttonsPosition: ButtonPositionTypes
  breakButtonLabel?: string
  proceedButtonLabel?: string
  handleClose: () => void
  handleProceed: () => void
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  titleFont?: TitleFontTypes
}

export interface ModalFooterProps {
  buttonsPosition: ButtonPositionTypes
  breakButtonLabel?: string
  proceedButtonLabel?: string
  handleClose: () => void
  handleProceed: () => void
}

const ModalFooter: FC<ModalFooterProps> = ({
  buttonsPosition = 'right',
  breakButtonLabel,
  proceedButtonLabel,
  handleClose,
  handleProceed,
}) => {
  return (
    <div className={classes[buttonsPosition]}>
      <Button appearance={AppearanceTypes.Secondary} onClick={handleClose}>
        {breakButtonLabel}
      </Button>
      <Button className={classes.modalButton} onClick={handleProceed}>
        {proceedButtonLabel}
      </Button>
    </div>
  )
}

const Modal: FC<PropsWithChildren<ModalProps>> = ({
  title,
  trigger,
  children,
  topButton,
  titleFont = 'gray',
  size = 'medium',
  buttonsPosition,
  breakButtonLabel,
  proceedButtonLabel,
  open,
  setOpen,
  handleClose,
  handleProceed,
}) => {
  const { t } = useTranslation()

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {trigger}
      <Dialog.Portal>
        <Dialog.Overlay className={classes.dialogOverlay} />
        <Dialog.Content
          className={classNames(classes.dialogContent, classes[size])}
        >
          {topButton && (
            <Button
              icon={Close}
              appearance={AppearanceTypes.Secondary}
              onClick={handleClose}
              className={classes.topButton}
            >
              {t('button.cancel')}
            </Button>
          )}
          <Dialog.Title
            className={classNames(classes.dialogTitle, classes[titleFont])}
          >
            {title}
          </Dialog.Title>
          <Dialog.Overlay className={classes.scrollableContent}>
            <div className={classes.dialogDescription}>{children}</div>
          </Dialog.Overlay>
          <ModalFooter
            buttonsPosition={buttonsPosition}
            breakButtonLabel={breakButtonLabel}
            proceedButtonLabel={proceedButtonLabel}
            handleClose={handleClose}
            handleProceed={handleProceed}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal
