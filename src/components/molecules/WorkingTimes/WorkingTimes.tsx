/* eslint-disable react-hooks/exhaustive-deps */
import { FC } from 'react'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import { ReactComponent as EditIcon } from 'assets/icons/edit.svg'
import {
  groupBy,
  map,
  compact,
  uniqueId,
  forEach,
  includes,
  join,
  upperCase,
  replace,
} from 'lodash'
import classes from './classes.module.scss'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import {
  DayTypes,
  InstitutionPostType,
  InstitutionType,
} from 'types/institutions'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import { useUpdateInstitution } from 'hooks/requests/useInstitutions'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import { EditDataType } from 'components/organisms/modals/DateTimeRangeFormModal/DateTimeRangeFormModal'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'

dayjs.extend(timezone)
interface WorkingTimesPropType {
  data?: InstitutionType
}
type PayloadType = {
  [key in string]: string
}

const WorkingTimes: FC<WorkingTimesPropType> = (props) => {
  const { updateInstitution } = useUpdateInstitution({
    institutionId: props?.data?.id,
  })
  const { userPrivileges } = useAuth()

  const { t } = useTranslation()
  console.log('props', props)
  const data = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'string',
    phone: 'string',
    email: 'user@example.com',
    short_name: 'string',
    logo_url: 'string',
    updated_at: '2023-08-29T08:51:59.577Z',
    created_at: '2023-08-29T08:51:59.577Z',
    worktime_timezone: 'Europe/Tallinn',
    monday_worktime_start: '08:00:00',
    monday_worktime_end: '16:00:00',
    tuesday_worktime_start: '08:00:00',
    tuesday_worktime_end: '16:00:00',
    wednesday_worktime_start: '08:00:00',
    wednesday_worktime_end: '16:00:00',
    thursday_worktime_start: '08:00:00',
    thursday_worktime_end: '17:00:00',
    friday_worktime_start: '09:00:00',
    friday_worktime_end: '16:00:00',
    saturday_worktime_start: undefined,
    saturday_worktime_end: undefined,
    sunday_worktime_start: undefined,
    sunday_worktime_end: undefined,
  }

  const formattedWorkTime = compact(
    map(DayTypes, (day) => {
      const startTime = data[`${day}_worktime_start`]
      const endTime = data[`${day}_worktime_end`]
      if (startTime || endTime) {
        return {
          day,
          time_range: { start: startTime, end: endTime },
        }
      }
    })
  )

  const groupedData = groupBy(formattedWorkTime, ({ time_range }) =>
    JSON.stringify(time_range)
  )

  const editableData = map(groupedData, (item, key) => {
    const days = map(item, 'day')
    const newId = uniqueId()
    return {
      id: newId,
      days,
      time_range: JSON.parse(key),
    }
  })
  //console.log('grouped', editableData)

  const dayTimeRange = join(
    map(editableData, ({ days, time_range }, key) => {
      const startTime = replace(time_range.start, /:\d{2}$/, '')
      const endTime = replace(time_range.end, /:\d{2}$/, '')
      const letters = join(
        map(days, (day) => upperCase(t(`institution.days.${day}`).charAt(0))),
        ','
      )
      return `${letters} ${startTime}-${endTime}`
    }),
    ', '
  )

  // console.log(dayTimeRange)

  const handleOnSubmit = async (values: EditDataType[]) => {
    // console.log('working submit, values', values)
    const timezone = dayjs.tz.guess()
    const workTime: PayloadType = {}

    forEach(values, ({ days, time_range }) => {
      forEach(days, (day) => {
        workTime[`${day}_worktime_start`] = time_range?.start || ''
        workTime[`${day}_worktime_end`] = time_range?.end || ''
      })
    })

    const payload: InstitutionPostType = {
      ...workTime,
      worktime_timezone: timezone,
      name: props?.data?.name || '',
    }
    // console.log('payload', payload)
    try {
      await updateInstitution(payload)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.institution_updated'),
      })
    } catch (error) {
      console.log(error)
    }
  }

  const handleEditList = () => {
    showModal(ModalTypes.DateTimeRangeFormModal, {
      data: editableData,
      title: t('modal.set_working_times_title'),
      handleOnSubmit: handleOnSubmit,
    })
  }

  return (
    <div className={classes.dateTimeContainer}>
      <span className={classes.bold}>
        {t('institution.working_times')}
        {':'}
      </span>
      <span className={classes.blue}> {dayTimeRange}</span>
      <Button
        appearance={AppearanceTypes.Text}
        size={SizeTypes.S}
        className={classes.editButton}
        icon={EditIcon}
        onClick={handleEditList}
        // hidden={!includes(userPrivileges, Privileges.EditUserWorktime)}
      />
    </div>
  )
}

export default WorkingTimes
