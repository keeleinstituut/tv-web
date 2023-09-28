import UserForm from 'components/organisms/forms/UserForm/UserForm'
import dayjs from 'dayjs'
import { FC } from 'react'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import { UserStatus } from 'types/users'
import WorkingTimes from 'components/molecules/WorkingTimes/WorkingTimes'

// TODO: WIP - implement this page

const UserDetails: FC = () => {
  const { t } = useTranslation()
  //const {user} =

  const user = {
    id: '993a1769-c14a-4752-b4cb-8fddff7ce76c',
    email: 'scottie21@yahoo.com',
    phone: '+37234679076',
    status: UserStatus.Active,
    created_at: '2023-05-22T09:29:59.000000Z',
    updated_at: '2023-05-22T09:29:59.000000Z',
    user: {
      id: '993a1769-b439-48e2-bbe2-050a04b562d4',
      personal_identification_code: '33211214957',
      forename: 'Noah',
      surname: 'Vandervort',
      updated_at: '2023-05-22T09:29:59.000000Z',
      created_at: '2023-05-22T09:29:59.000000Z',
    },
    institution: {
      id: '993a1769-aff2-491c-a079-6571f467f45f',
      name: 'Hansen, Jakubowski and Gerhold',
      short_name: null,
      phone: null,
      email: 'ucassin@nader.com',
      logo_url: 'http://donnelly.com/eum-eos-atque-sapiente-rerum.html',
      created_at: '2023-05-22T09:29:59.000000Z',
      updated_at: '2023-05-22T09:29:59.000000Z',
    },
    department: null,
    roles: [
      {
        id: '993a1769-c413-4fe0-9fcc-8aa883ad3276',
        name: 'Rigger',
        institution_id: '993a1769-c330-4f15-a1be-ddb0eb522cd7',
        created_at: '2023-05-22T09:29:59.000000Z',
        updated_at: '2023-05-22T09:29:59.000000Z',
        privileges: [],
      },
      {
        id: '993a1769-c679-40e3-a45a-a19fab0c13e2',
        name: 'Heavy Equipment Mechanic',
        institution_id: '993a1769-c5a9-4a33-b062-e4835d78a8ac',
        created_at: '2023-05-22T09:29:59.000000Z',
        updated_at: '2023-05-22T09:29:59.000000Z',
        privileges: [],
      },
    ],
  }

  return (
    <>
      <div className={classes.titleRow}>
        <h1 className={classes.title}>{t('user.account')}</h1>

        <WorkingTimes
          name={user.institution.name}
          id={user.institution.id}
          data={user.institution}
        />
      </div>
      <UserForm {...user} isUserAccount />
      <p className={classes.dateText}>
        {t('user.created_at', {
          time: dayjs(user.created_at).format('DD.MM.YYYY HH:mm') || '',
        })}
      </p>
      <p className={classes.dateText}>
        {t('user.updated_at', {
          time: dayjs(user.updated_at).format('DD.MM.YYYY HH:mm') || '',
        })}
      </p>
    </>
  )
}

export default UserDetails
