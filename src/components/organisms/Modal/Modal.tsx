import {
  FC,
  ReactNode,
  PropsWithChildren,
  Dispatch,
  SetStateAction,
} from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import classNames from 'classnames'
import Button, {
  AppearanceTypes,
  ButtonProps,
} from 'components/molecules/Button/Button'
import { ReactComponent as Close } from 'assets/icons/close.svg'
import { useTranslation } from 'react-i18next'
import { map } from 'lodash'

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

export interface ModalButtonProps extends ButtonProps {
  onClick: () => void
}

export interface ModalProps extends ModalFooterProps {
  title?: string
  trigger?: ReactNode
  customDialogContent?: string
  topButton?: boolean
  size?: ModalSizeTypes
  titleFont?: TitleFontTypes
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  handleClose: () => void
  progressBar?: boolean
}

export interface ModalFooterProps {
  buttonsPosition: ButtonPositionTypes
  buttons: ModalButtonProps[]
}

const ModalFooter: FC<PropsWithChildren<ModalFooterProps>> = ({
  buttonsPosition = 'right',
  buttons,
}) => {
  return (
    <div className={classes[buttonsPosition]}>
      {map(buttons, (button, index) => {
        return (
          <Button
            key={index}
            appearance={button?.appearance}
            disabled={button?.disabled}
            size={button?.size}
            iconPositioning={button?.iconPositioning}
            icon={button?.icon}
            ariaLabel={button?.ariaLabel}
            hidden={button?.hidden}
            onClick={button?.onClick}
            href={button?.href}
            className={classNames(
              buttonsPosition !== 'spaceBetween' && classes.modalButton,
              button?.className
            )}
          >
            {button?.children}
          </Button>
        )
      })}
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
  open,
  setOpen,
  handleClose,
  buttons,
  progressBar,
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
          <Button
            hidden={!topButton}
            icon={Close}
            appearance={AppearanceTypes.Secondary}
            onClick={handleClose}
            className={classes.topButton}
          >
            {t('button.cancel')}
          </Button>
          <Dialog.Title
            className={classNames(
              classes.dialogTitle,
              classes[titleFont],
              progressBar && classes.progressBar
            )}
          >
            {title}
          </Dialog.Title>
          <Dialog.Overlay className={classes.scrollableContent}>
            <div className={classes.dialogDescription}>{children}</div>
          </Dialog.Overlay>
          <ModalFooter buttonsPosition={buttonsPosition} buttons={buttons} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal
