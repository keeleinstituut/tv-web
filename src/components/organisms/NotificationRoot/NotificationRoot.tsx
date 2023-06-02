import { omit, isEmpty, map, filter, uniqBy, find } from 'lodash'
import Notification, {
  NotificationProps,
} from 'components/molecules/Notification/Notification'
import { v4 as uuidv4 } from 'uuid'
import { useState, useCallback, createRef, useImperativeHandle } from 'react'
import classes from './styles.module.scss'

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
  const [notifications, setNotifications] = useState<
    Array<NotificationInState | { id: string }>
  >([{ id: permanentNotificationId }])

  const closeNotification = useCallback((notificationId: string) => {
    setNotifications((prevNotifications) =>
      filter(prevNotifications, ({ id }) => id !== notificationId)
    )
  }, [])

  const closeAllNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  const showNotification = useCallback(
    (notificationProps: NotificationPropsWithoutClose, timeout?: number) => {
      const tempId = uuidv4()
      const emptyNotification = find(
        notifications,
        (notification) => !('type' in notification)
      ) || { id: permanentNotificationId }

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
