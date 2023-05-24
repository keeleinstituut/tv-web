import { omit, isEmpty, map } from 'lodash'
import Notification, {
  NotificationProps,
} from 'components/molecules/Notification/Notification'
import { v4 as uuidv4 } from 'uuid'
import { useState, useCallback, createRef, useImperativeHandle } from 'react'
import classes from './styles.module.scss'

// Add other modal props types here as well

interface RefType {
  showNotification: (
    notificationProps: NotificationPropsWithoutClose,
    timeout?: number
  ) => void
  closeAllNotifications: () => void
}

type NotificationPropsWithoutClose = Omit<
  NotificationProps,
  'closeNotification'
>

interface NotificationsDictionary {
  [key: string]: NotificationPropsWithoutClose
}

export const notificationRef = createRef<RefType>()

const NotificationRoot = () => {
  const [notifications, setNotifications] = useState<NotificationsDictionary>(
    {}
  )

  const closeNotification = useCallback(
    (notificationId: string) => {
      setNotifications(omit(notifications, notificationId))
    },
    [notifications]
  )

  const closeAllNotifications = useCallback(() => {
    setNotifications({})
  }, [])

  const showNotification = useCallback(
    (notificationProps: NotificationPropsWithoutClose, timeout?: number) => {
      const tempId = uuidv4()
      setNotifications((prevNotifications) => ({
        ...prevNotifications,
        [tempId]: notificationProps,
      }))
      setTimeout(closeNotification, timeout || 5000, tempId)
    },
    [closeNotification]
  )

  useImperativeHandle(
    notificationRef,
    () => ({
      showNotification,
      closeAllNotifications,
    }),
    [closeAllNotifications, showNotification]
  )
  // TODO: add some transition for notification
  if (isEmpty(notifications)) return null
  return (
    <div className={classes.notificationsContainer}>
      {map(notifications, (notificationProps, key) => (
        <Notification
          {...notificationProps}
          key={key}
          closeNotification={() => closeNotification(key)}
        />
      ))}
    </div>
  )
}

export default NotificationRoot

export const showNotification = (
  notificationProps: NotificationPropsWithoutClose,
  timeout?: number
) => notificationRef?.current?.showNotification(notificationProps, timeout)

export const closeAllNotifications = () =>
  notificationRef?.current?.closeAllNotifications()
