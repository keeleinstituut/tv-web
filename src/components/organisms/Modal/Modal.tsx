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
}

export interface ModalProps {
  title?: string
  trigger?: ReactNode
  customDialogContent?: string
  topButton?: boolean
  size: ModalSizeTypes
  buttonPosition?: ButtonPositionTypes
  breakButtonLabel?: string
  proceedButtonLabel?: string
}

const Modal: FC<PropsWithChildren<ModalProps>> = ({
  title,
  trigger,
  children,
  topButton,
  size = 'medium',
  buttonPosition = 'right',
  breakButtonLabel,
  proceedButtonLabel,
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
          <Dialog.Title className={classes.dialogTitle}>
            <h1>{title}</h1>
          </Dialog.Title>
          <Dialog.Overlay className={classes.scrollableContent}>
            <Dialog.Description className={classes.dialogDescription}>
              {children}
            </Dialog.Description>
          </Dialog.Overlay>
          <div className={classes[buttonPosition]}>
            <Dialog.Close asChild>
              <Button appearance={AppearanceTypes.Secondary}>
                {breakButtonLabel}
              </Button>
            </Dialog.Close>
            <Button className={classes.modalButton}>
              {proceedButtonLabel}
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal
