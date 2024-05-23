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

const UserDetails: FC = () => {
  const { t } = useTranslation()
  const { userInfo } = useAuth()
  const userId = userInfo?.tolkevarav?.institutionUserId || ''
  const { isLoading, user } = useFetchUser({
    id: userId,
  })
  const { userVacations } = useInstitutionUserVacationsFetch({ id: userId })

  if (isLoading) return <Loader loading={isLoading} />

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
