/* eslint-disable react-hooks/exhaustive-deps */
import { FC } from 'react'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import { ReactComponent as EditIcon } from 'assets/icons/edit.svg'
import { map, includes, join, compact } from 'lodash'
import classes from './classes.module.scss'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import {
  InstitutionUserVacationsPostType,
  InstitutionVacationsPostType,
  InstitutionVacationType,
} from 'types/institutions'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import {
  useInstitutionUserVacationsUpdate,
  useInstitutionVacationsUpdate,
} from 'hooks/requests/useInstitutions'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'
import { EditDataType } from 'components/organisms/modals/DateRangeFormModal/DateRangeFormModal'

dayjs.extend(timezone)
interface VacationTimesPropType {
  data?: InstitutionVacationType[]
  userId?: string
  isUserVacationTimes?: boolean
  isDetailPageTimes?: boolean
}

const VacationTimes: FC<VacationTimesPropType> = ({
  data,
  userId,
  isUserVacationTimes,
  isDetailPageTimes,
}) => {
  const { updateInstitutionVacations } = useInstitutionVacationsUpdate()
  const { updateInstitutionUserVacations } = useInstitutionUserVacationsUpdate({
    id: userId,
  })
  const { userPrivileges } = useAuth()

  const { t } = useTranslation()

  const editableData = map(data, (vacation) => {
    return {
      id: vacation.id,
      institution_id: vacation?.institution_id,
      institution_user_id: vacation?.institution_user_id,
      start: dayjs(vacation.start_date).format('DD/MM/YYYY').toString(),
      end: dayjs(vacation.end_date).format('DD/MM/YYYY').toString(),
    }
  })

  const vacationDatesList = join(
    map(editableData, ({ start, end }) => {
      const startDate = dayjs(start, 'DD/MM/YYYY')
      const endDate = dayjs(end, 'DD/MM/YYYY')
      const isSameYearAndMonth =
        startDate.isSame(endDate, 'month') && startDate.isSame(endDate, 'year')

      const formattedStartDate = isSameYearAndMonth
        ? startDate.format('DD')
        : startDate.format('DD.MM.YYYY')

      const formattedEndDate = endDate.format('DD.MM.YYYY')

      if (start === end) {
        return `${formattedEndDate}`
      }
      return `${formattedStartDate}-${formattedEndDate}`
    }),
    ', '
  )

  const handleOnSubmit = async (
    values: EditDataType[],
    vacationExclusions: string[]
  ) => {
    const formattedVacationTimes = map(values, (date) => {
      const startDate = dayjs(date.start, 'DD/MM/YYYY').format('YYYY-MM-DD')
      const endDate = dayjs(date.end, 'DD/MM/YYYY').format('YYYY-MM-DD')
      const institutionVacationIdObject = date.id ? { id: date.id } : {}
      const userVacationIdObject =
        date.id && !date.institution_id ? { id: date.id } : {}
      return {
        ...(userId ? userVacationIdObject : institutionVacationIdObject),
        start_date: startDate,
        end_date: endDate,
      }
    })

    if (isUserVacationTimes || isDetailPageTimes) {
      const editedInstitutionVacations = compact(
        map(values, ({ institution_id, id }) => {
          if (institution_id) return id
        })
      )
      const payload: InstitutionUserVacationsPostType = {
        institution_user_id: userId || '',
        vacations: formattedVacationTimes,
        institution_vacation_exclusions: [
          ...vacationExclusions,
          ...editedInstitutionVacations,
        ],
      }
      await updateInstitutionUserVacations(payload)
    } else {
      const payload: InstitutionVacationsPostType = {
        vacations: formattedVacationTimes,
      }
      await updateInstitutionVacations(payload)
    }

    const successMessage =
      isUserVacationTimes || isDetailPageTimes
        ? t('success.user_vacation_times_updated')
        : t('success.institution_updated')

    showNotification({
      type: NotificationTypes.Success,
      title: t('notification.announcement'),
      content: successMessage,
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
        hidden={
          (!includes(userPrivileges, Privileges.EditUserVacation) &&
            isUserVacationTimes &&
            !isDetailPageTimes) ||
          (!includes(userPrivileges, Privileges.EditInstitutionWorktime) &&
            !isUserVacationTimes &&
            !isDetailPageTimes)
        }
      />
    </div>
  )
}

export default VacationTimes
