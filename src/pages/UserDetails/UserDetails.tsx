import UserForm from 'components/organisms/forms/UserForm/UserForm'
import dayjs from 'dayjs'
import { FC } from 'react'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
// import WorkingTimes from 'components/molecules/WorkingTimes/WorkingTimes'
import { useAuth } from 'components/contexts/AuthContext'
import { useFetchUser } from 'hooks/requests/useUsers'
import Loader from 'components/atoms/Loader/Loader'

const UserDetails: FC = () => {
  const { t } = useTranslation()
  const { userInfo } = useAuth()
  const userId = userInfo?.tolkevarav?.institutionUserId || ''
  const { isLoading, user } = useFetchUser({
    id: userId,
  })

  if (isLoading) return <Loader loading={isLoading} />

  return (
    <>
      <div className={classes.titleRow}>
        <h1 className={classes.title}>{t('user.account')}</h1>

        {/* TODO: edit personal working times and vacation days will come later with new endpoints */}
        {/* <WorkingTimes
          name={user?.institution.name || ''}
          id={user?.institution.id || ''}
          data={user?.institution}
        /> */}
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
