import {
  FC,
  ReactNode,
  PropsWithChildren,
  ReactElement,
  createContext,
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

import classes from './classes.module.scss'
import { closeModal } from '../modals/ModalRoot'
interface ModalContextType {
  modalContentId?: string
  modalVerticalContentId?: string
}

export const ModalContext = createContext<ModalContextType>({
  modalContentId: undefined,
  modalVerticalContentId: undefined,
})

export enum ModalSizeTypes {
  Narrow = 'narrow',
  Medium = 'medium',
  Big = 'big',
  Small = 'small',
  ExtraLarge = 'extraLarge',
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
  onClick?: () => void
}

export interface ModalProps extends ModalFooterProps {
  title?: string
  trigger?: ReactNode
  customDialogContent?: string
  topButton?: boolean
  size?: ModalSizeTypes
  titleFont?: TitleFontTypes
  open: boolean
  setOpen?: (isOpen: boolean) => void
  handleClose?: () => void
  progressBar?: ReactElement
  className?: string
  buttonComponent?: ReactElement
  helperText?: string | ReactElement
  innerWrapperClassName?: string
  headComponent?: ReactElement
}

export interface ModalFooterProps {
  buttonsPosition?: ButtonPositionTypes
  buttons?: ModalButtonProps[]
  buttonComponent?: ReactElement
}

const ModalFooter: FC<PropsWithChildren<ModalFooterProps>> = ({
  buttonsPosition = 'right',
  buttons,
  buttonComponent,
}) => {
  return (
    <>
      <div
        className={classNames(classes.footerButtons, classes[buttonsPosition])}
      >
        {buttons &&
          map(buttons, (button, index) => (
            <Button key={index} {...button}>
              {button?.children}
            </Button>
          ))}
      </div>
      {buttonComponent ?? null}
    </>
  )
}

const ModalBase: FC<PropsWithChildren<ModalProps>> = ({
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
  className,
  helperText,
  buttonComponent,
  innerWrapperClassName,
  headComponent,
}) => {
  const { t } = useTranslation()

  return (
    <ModalContext.Provider
      value={{
        modalContentId: 'modalContentId',
        modalVerticalContentId: 'modalVerticalContentId',
      }}
    >
      <Dialog.Root open={open} onOpenChange={setOpen}>
        {trigger}
        <Dialog.Portal>
          <Dialog.Overlay className={classes.dialogOverlay} />
          <Dialog.Content
            onEscapeKeyDown={closeModal}
            id="modalContentId"
            className={classNames(
              classes.dialogContent,
              classes[size],
              progressBar && classes.progressBarContainer,
              className
            )}
          >
            <Button
              hidden={!topButton}
              icon={Close}
              appearance={AppearanceTypes.Secondary}
              onClick={handleClose}
              className={classes.topButton}
              autoFocus={open && topButton}
            >
              {t('button.cancel')}
            </Button>
            <div hidden={!progressBar} className={classes.progressBarContent}>
              {progressBar}
            </div>
            <h1 className={classNames(classes.modalTitle, classes[titleFont])}>
              {title}
            </h1>
            {headComponent}
            <Dialog.Overlay
              className={classes.scrollableContent}
              id="modalVerticalContentId"
            >
              <p hidden={!helperText} className={classes.helperText}>
                {helperText}
              </p>
              <div
                className={classNames(
                  classes.dialogDescription,
                  innerWrapperClassName
                )}
              >
                {children}
              </div>
            </Dialog.Overlay>
            <ModalFooter
              buttonsPosition={buttonsPosition}
              buttons={buttons}
              buttonComponent={buttonComponent}
            />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ModalContext.Provider>
  )
}

export default ModalBase
