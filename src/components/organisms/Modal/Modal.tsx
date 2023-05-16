import { FC, ReactNode, PropsWithChildren } from 'react'
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
  onClick: () => void
  titleFont?: TitleFontTypes
}

export interface ModalFooterProps {
  buttonsPosition: ButtonPositionTypes
  breakButtonLabel?: string
  proceedButtonLabel?: string
  onClick: () => void
}

const ModalFooter: FC<ModalFooterProps> = ({
  buttonsPosition = 'right',
  breakButtonLabel,
  proceedButtonLabel,
  onClick,
}) => {
  return (
    <div className={classes[buttonsPosition]}>
      <Dialog.Close asChild>
        <Button appearance={AppearanceTypes.Secondary}>
          {breakButtonLabel}
        </Button>
      </Dialog.Close>
      <Dialog.Close asChild>
        <Button className={classes.modalButton} onClick={onClick}>
          {proceedButtonLabel}
        </Button>
      </Dialog.Close>
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
  onClick,
}) => {
  const { t } = useTranslation()

  return (
    <Dialog.Root>
      {trigger}
      <Dialog.Portal>
        <Dialog.Overlay className={classes.dialogOverlay} />
        <Dialog.Content
          className={classNames(classes.dialogContent, classes[size])}
        >
          {topButton && (
            <Dialog.Close asChild className={classes.topButton}>
              <Button icon={Close} appearance={AppearanceTypes.Secondary}>
                {t('button.cancel')}
              </Button>
            </Dialog.Close>
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
            onClick={onClick}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal
