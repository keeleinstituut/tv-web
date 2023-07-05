import { omit, isEmpty, map, filter, uniqBy, find } from 'lodash'
import Notification, {
  NotificationProps,
} from 'components/molecules/Notification/Notification'
import { v4 as uuidv4 } from 'uuid'
import { useState, useCallback, createRef, useImperativeHandle } from 'react'
import classes from './classes.module.scss'

interface RefType {
  showNotification: (
    notificationProps: NotificationPropsWithoutClose,
    timeout?: number
  ) => void
  closeAllNotifications: () => void
}

const permanentNotificationId = uuidv4()

export type NotificationPropsWithoutClose = Omit<
  NotificationProps,
  'closeNotification'
>

interface NotificationInState extends NotificationPropsWithoutClose {
  id: string
}

export const notificationRef = createRef<RefType>()

const NotificationRoot = () => {
  // We keep 1 empty notification in state
  // This will be used to render the animation wrapper around the actual notification
  const [notifications, setNotifications] = useState<
    Array<NotificationInState | { id: string }>
  >([{ id: permanentNotificationId }])

  const closeNotification = useCallback((notificationId: string) => {
    setNotifications((prevNotifications) =>
      filter(prevNotifications, ({ id }) => id !== notificationId)
    )
  }, [])

  const closeAllNotifications = useCallback(() => {
    setNotifications([{ id: permanentNotificationId }])
  }, [])

  const showNotification = useCallback(
    (notificationProps: NotificationPropsWithoutClose, timeout?: number) => {
      // create a unique id for the following notification
      const tempId = uuidv4()
      // find the first empty notification
      const emptyNotification = find(
        notifications,
        (notification) => !('type' in notification)
      ) || { id: permanentNotificationId }

      // Fill the data of the first empty notification
      // and add a new empty notification on top for the next notification
      setNotifications([
        { id: tempId },
        ...uniqBy(
          [
            { id: emptyNotification.id, ...notificationProps },
            ...notifications,
          ],
          'id'
        ),
      ])

      setTimeout(closeNotification, timeout || 5000, emptyNotification.id)
    },
    [closeNotification, notifications]
  )

  useImperativeHandle(
    notificationRef,
    () => ({
      showNotification,
      closeAllNotifications,
    }),
    [closeAllNotifications, showNotification]
  )

  if (isEmpty(notifications)) return null
  return (
    <div className={classes.notificationsContainer}>
      {map(notifications, (notificationProps) => (
        <div
          key={notificationProps?.id}
          className={classes.transitionContainer}
        >
          {'type' in notificationProps ? (
            <Notification
              {...omit(notificationProps, 'id')}
              closeNotification={() => closeNotification(notificationProps.id)}
            />
          ) : null}
        </div>
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
