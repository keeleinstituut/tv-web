import { FC } from 'react'
import classNames from 'classnames'
import classes from './styles.module.scss'
import { ReactComponent as CloseIcon } from 'assets/icons/close.svg'
import { ReactComponent as WarningIcon } from 'assets/icons/warning.svg'
import { ReactComponent as SuccessIcon } from 'assets/icons/success.svg'
import { ReactComponent as ErrorIcon } from 'assets/icons/error_outline.svg'
import { ReactComponent as InfoIcon } from 'assets/icons/info.svg'

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
  content?: JSX.Element | string
  hideIcon?: boolean
  closeNotification: () => void
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

const Notification: FC<NotificationProps> = ({
  type,
  title,
  content,
  hideIcon,
  closeNotification,
}) => {
  return (
    <div className={classNames(classes.notificationContainer, classes[type])}>
      <NotificationIcon type={type} hidden={hideIcon} />
      <h5>{title}</h5>
      <Button
        className={classes.closeButton}
        appearance={AppearanceTypes.Text}
        icon={CloseIcon}
        onClick={closeNotification}
      />
      <p>{content}</p>
    </div>
  )
}

export default Notification
