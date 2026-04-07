import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { join, map } from 'lodash'
import dayjs from 'dayjs'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import EditIcon from 'assets/icons/edit.svg?react'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import {
  useFetchEmergencySchedules,
  useCreateEmergencySchedule,
  useDeleteEmergencySchedule,
} from 'hooks/requests/useCalendar'
import { EmergencySchedule } from 'types/vendors'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import classes from './classes.module.scss'

interface EmoSchedulesTimesProps {
  vendorId: string
}

const EmoSchedulesTimes: FC<EmoSchedulesTimesProps> = ({ vendorId }) => {
  const { t } = useTranslation()
  const { schedules } = useFetchEmergencySchedules(vendorId)
  const { mutateAsync: createSchedule } = useCreateEmergencySchedule()
  const { mutateAsync: deleteSchedule } = useDeleteEmergencySchedule()

  const displayText = join(
    map(schedules, (s) => {
      const start = dayjs(s.start_date).format('DD.MM.YYYY')
      const end = dayjs(s.end_date).format('DD.MM.YYYY')
      return start === end ? start : `${start}-${end}`
    }),
    ', '
  )

  const handleEdit = () => {
    showModal(ModalTypes.EmoSchedules, {
      vendorId,
      schedules,
      onSave: async (
        toCreate: Omit<EmergencySchedule, 'id'>[],
        toDelete: string[]
      ) => {
        await Promise.all(
          toDelete.map((scheduleId) => deleteSchedule({ vendorId, scheduleId }))
        )
        await Promise.all(
          toCreate.map((s) =>
            createSchedule({
              vendorId,
              start_date: s.start_date,
              end_date: s.end_date,
            })
          )
        )
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.emo_schedules_updated'),
        })
      },
    })
  }

  return (
    <div className={classes.dateContainer}>
      <span className={classes.bold}>{t('institution.emo_working_hours')}</span>
      <span className={classes.blue}>{displayText}</span>
      <Button
        ariaLabel={t('institution.emo_working_hours')}
        appearance={AppearanceTypes.Text}
        size={SizeTypes.S}
        className={classes.editButton}
        icon={EditIcon}
        onClick={handleEdit}
      />
    </div>
  )
}

export default EmoSchedulesTimes
