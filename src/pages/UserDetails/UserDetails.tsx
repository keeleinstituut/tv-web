import UserForm from 'components/organisms/forms/UserForm/UserForm'
import dayjs from 'dayjs'
import { FC } from 'react'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import { useAuth } from 'components/contexts/AuthContext'
import { useFetchUser } from 'hooks/requests/useUsers'
import Loader from 'components/atoms/Loader/Loader'
import VacationTimes from 'components/molecules/VacationTimes/VacationTimes'
import { useInstitutionUserVacationsFetch } from 'hooks/requests/useInstitutions'
import WorkingTimes from 'components/molecules/WorkingTimes/WorkingTimes'

const UserDetails: FC = () => {
  const { t } = useTranslation()
  const { userInfo } = useAuth()
  const userId = userInfo?.tolkevarav?.institutionUserId || ''
  const { isLoading, user } = useFetchUser({
    id: userId,
  })
  const { userVacations } = useInstitutionUserVacationsFetch({ id: userId })

  const userName = {
    surname: user?.user.surname,
    forename: user?.user.forename,
  }

  const userWorkingTimes =
    {
      id: user?.id || '',
      name: `${user?.user.forename} ${user?.user.surname}` || '',
      monday_worktime_start:
        user?.monday_worktime_start || user?.institution.monday_worktime_start,
      monday_worktime_end:
        user?.monday_worktime_end || user?.institution.monday_worktime_start,
      tuesday_worktime_start:
        user?.tuesday_worktime_start ||
        user?.institution.tuesday_worktime_start,
      tuesday_worktime_end:
        user?.tuesday_worktime_end || user?.institution.tuesday_worktime_end,
      wednesday_worktime_start:
        user?.wednesday_worktime_start ||
        user?.institution.wednesday_worktime_start,
      wednesday_worktime_end:
        user?.wednesday_worktime_end ||
        user?.institution.wednesday_worktime_end,
      thursday_worktime_start:
        user?.thursday_worktime_start ||
        user?.institution.thursday_worktime_start,
      thursday_worktime_end:
        user?.thursday_worktime_end || user?.institution.thursday_worktime_end,
      friday_worktime_start:
        user?.friday_worktime_start || user?.institution.friday_worktime_start,
      friday_worktime_end:
        user?.friday_worktime_end || user?.institution.friday_worktime_end,
      saturday_worktime_start:
        user?.saturday_worktime_start ||
        user?.institution.saturday_worktime_start,
      saturday_worktime_end:
        user?.saturday_worktime_end || user?.institution.saturday_worktime_end,
      sunday_worktime_start:
        user?.sunday_worktime_start || user?.institution.sunday_worktime_start,
      sunday_worktime_end:
        user?.sunday_worktime_end || user?.institution.sunday_worktime_end,
    } || {}

  if (isLoading) return <Loader loading={isLoading} />
  console.warn('Userdetails')
  return (
    <>
      <div className={classes.titleRow}>
        <h1 className={classes.title}>{t('user.account')}</h1>

        <VacationTimes
          data={[
            ...(userVacations?.institution_vacations || []),
            ...(userVacations?.institution_user_vacations || []),
          ]}
          userId={userId}
          isDetailPageTimes
        />
        <WorkingTimes
          id={user?.id || ''}
          data={userWorkingTimes}
          userName={userName}
          isDetailPageTimes
        />
      </div>
      <UserForm {...user} id={userId} isUserAccount />
      <p className={classes.dateText}>
        {t('user.created_at', {
          time: dayjs(user?.created_at).format('DD.MM.YYYY HH:mm') || '',
        })}
      </p>
      <p className={classes.dateText}>
        {t('user.updated_at', {
          time: dayjs(user?.updated_at).format('DD.MM.YYYY HH:mm') || '',
        })}
      </p>
    </>
  )
}

export default UserDetails
