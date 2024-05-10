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
  flatMapDeep,
  omit,
  mapValues,
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
import {
  useInstitutionUpdate,
  useInstitutionVacationsUpdate,
} from 'hooks/requests/useInstitutions'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import { EditDataType } from 'components/organisms/modals/DateRangeFormModal/DateRangeFormModal'
import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'

dayjs.extend(timezone)
interface VacationTimesPropType {
  data?: InstitutionType
  name: string
  id: string
}
type PayloadType = {
  [key in string]: string
}

const VacationTimes: FC<VacationTimesPropType> = ({ data, id, name }) => {
  const { updateInstitution } = useInstitutionUpdate({ id })
  const { updateInstitutionVacations } = useInstitutionVacationsUpdate()
  const { userPrivileges } = useAuth()

  const { t } = useTranslation()

  const formattedWorkTime = compact(
    map(DayTypes, (day) => {
      const startTime = data?.[`${day}_worktime_start`]
      const endTime = data?.[`${day}_worktime_end`]
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

  const dateRange = join(
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

  const handleOnSubmit = async (values: any) => {
    const payload: any = {
      values,
    }

    console.log('values', values)

    const vacationTimes = mapValues(values, (date, key) => {
      const startDateParts = date.start.split('/')
      const endDateParts = date.end.split('/')

      // Format start date
      const formattedStartDate = `${startDateParts[2]}-${startDateParts[1]}-${startDateParts[0]}`

      // Format end date
      const formattedEndDate = `${endDateParts[2]}-${endDateParts[1]}-${endDateParts[0]}`

      return {
        id: key,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
      }
    })

    const formattedVacationTimes = map(vacationTimes, (value) => value)

    return formattedVacationTimes
  }

  const handleEditList = () => {
    showModal(ModalTypes.DateRangeForm, {
      data: editableData,
      title: t('modal.set_vacation_times_title'),
      handleOnSubmit: handleOnSubmit,
    })
  }

  return (
    <div className={classes.dateContainer}>
      <span className={classes.bold}>{t('institution.vacation_times')}</span>
      <span className={classes.blue}> {dateRange}</span>
      <Button
        ariaLabel={t('institution.vacation_times')}
        appearance={AppearanceTypes.Text}
        size={SizeTypes.S}
        className={classes.editButton}
        icon={EditIcon}
        onClick={handleEditList}
        hidden={!includes(userPrivileges, Privileges.EditInstitutionWorktime)}
      />
    </div>
  )
}

export default VacationTimes
