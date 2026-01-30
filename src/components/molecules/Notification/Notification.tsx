import { FC, PropsWithChildren, ReactNode } from 'react'
import classNames from 'classnames'
import classes from './classes.module.scss'
import CloseIcon from 'assets/icons/close.svg?react'
import WarningIcon from 'assets/icons/warning.svg?react'
import SuccessIcon from 'assets/icons/success.svg?react'
import ErrorIcon from 'assets/icons/error_outline.svg?react'
import InfoIcon from 'assets/icons/info.svg?react'

import Button, { AppearanceTypes } from 'components/molecules/Button/Button'

export enum NotificationTypes {
  Error = 'error',
  Warning = 'warning',
  Success = 'success',
  Info = 'info',
}

interface IconComponentProps {
  type: NotificationTypes
  hidden?: boolean
}

export interface NotificationProps {
  type: NotificationTypes
  title?: string
  content?: ReactNode
  hideIcon?: boolean
  closeNotification?: () => void
  className?: string
  hidden?: boolean
}

const NotificationIcon: FC<IconComponentProps> = ({ type, hidden }) => {
  if (hidden) return null
  switch (type) {
    case NotificationTypes.Error: {
      return <ErrorIcon />
    }
    case NotificationTypes.Warning: {
      return <WarningIcon />
    }
    case NotificationTypes.Success: {
      return <SuccessIcon />
    }
    case NotificationTypes.Info: {
      return <InfoIcon />
    }
    default:
      return null
  }
}

const Notification: FC<PropsWithChildren<NotificationProps>> = ({
  type,
  title,
  content,
  hideIcon,
  closeNotification,
  className,
  hidden,
  children,
}) => {
  if (hidden) return null
  return (
    <div
      className={classNames(
        classes.notificationContainer,
        classes[type],
        className
      )}
    >
      <NotificationIcon type={type} hidden={hideIcon} />
      <h5 className={classNames(!title && classes.hidden)}>{title}</h5>
      <Button
        className={classes.closeButton}
        appearance={AppearanceTypes.Text}
        icon={CloseIcon}
        onClick={closeNotification}
        hidden={!closeNotification}
      />
      <p>{content}</p>
      {children}
    </div>
  )
}

export default Notification
