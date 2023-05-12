import { FC, ReactNode, PropsWithChildren } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import classNames from 'classnames'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { ReactComponent as Close } from 'assets/icons/close.svg'
import { useTranslation } from 'react-i18next'

import classes from './styles.module.scss'

export interface ModalProps {
  title?: string
  footer?: ReactNode
  trigger?: ReactNode
  customDialogContent?: string
  topButton?: boolean
}

const Modal: FC<PropsWithChildren<ModalProps>> = ({
  trigger,
  footer,
  children,
  customDialogContent,
  topButton,
}) => {
  const { t } = useTranslation()

  return (
    <Dialog.Root>
      <div>{trigger}</div>
      <Dialog.Portal>
        <Dialog.Overlay className={classes.dialogOverlay} />
        <Dialog.Content
          className={classNames(classes.dialogContent, customDialogContent)}
        >
          {topButton && (
            <Dialog.Close asChild className={classes.topButton}>
              <Button icon={Close} appearance={AppearanceTypes.Secondary}>
                {t('button.cancel')}
              </Button>
            </Dialog.Close>
          )}
          <Dialog.Description className={classes.dialogDescription}>
            {children}
          </Dialog.Description>
          <div>{footer}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export default Modal
