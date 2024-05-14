/* eslint-disable react-hooks/exhaustive-deps */
import { FC } from 'react'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import { ReactComponent as EditIcon } from 'assets/icons/edit.svg'
import { map, includes, join, mapValues } from 'lodash'
import classes from './classes.module.scss'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { InstitutionVacationType } from 'types/institutions'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import { useInstitutionVacationsUpdate } from 'hooks/requests/useInstitutions'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'

dayjs.extend(timezone)
interface VacationTimesPropType {
  data?: InstitutionVacationType[]
  name: string
  id: string
}

const VacationTimes: FC<VacationTimesPropType> = ({ data }) => {
  const { updateInstitutionVacations } = useInstitutionVacationsUpdate()
  const { userPrivileges } = useAuth()

  const { t } = useTranslation()

  const editableData = map(data, (vacation) => {
    return {
      id: vacation.id,
      start: dayjs(vacation.start_date).format('DD/MM/YYYY').toString(),
      end: dayjs(vacation.end_date).format('DD/MM/YYYY').toString(),
    }
  })

  const vacationDatesList = join(
    map(editableData, ({ start, end }) => {
      const startDate = dayjs(start, 'DD/MM/YYYY').format('DD')
      const endDate = dayjs(end, 'DD/MM/YYYY').format('DD.MM.YYYY')

      if (start == end) {
        return `${endDate}`
      }
      return `${startDate}-${endDate}`
    }),
    ', '
  )

  const handleOnSubmit = async (values: any) => {
    const formattedVacationTimes = mapValues(values, (date) => {
      const startDateParts = date.start.split('/')
      const endDateParts = date.end.split('/')

      // Format start date
      const formattedStartDate = `${startDateParts[2]}-${startDateParts[1]}-${startDateParts[0]}`

      // Format end date
      const formattedEndDate = `${endDateParts[2]}-${endDateParts[1]}-${endDateParts[0]}`

      return {
        ...(date.id && { id: date.id }),
        start_date: formattedStartDate,
        end_date: formattedEndDate,
      }
    })

    const payload: any = {
      vacations: formattedVacationTimes,
    }

    await updateInstitutionVacations(payload)
    showNotification({
      type: NotificationTypes.Success,
      title: t('notification.announcement'),
      content: t('success.institution_updated'),
    })
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
      <span className={classes.blue}> {vacationDatesList}</span>
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
