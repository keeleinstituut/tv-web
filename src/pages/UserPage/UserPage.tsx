import Loader from 'components/atoms/Loader/Loader'
import UserForm from 'components/organisms/forms/UserForm/UserForm'
import { useFetchUser } from 'hooks/requests/useUsers'
import { FC } from 'react'
import { useParams } from 'react-router-dom'

// TODO: WIP - implement this page

const UserPage: FC = () => {
  const { userId } = useParams()
  const { isLoading, isError, user } = useFetchUser({
    userId,
  })

  if (isLoading) {
    return <Loader loading />
  }
  if (isError || !user) {
    // TODO: might add actual error pages or might just not show RoleForm
    return <div />
  }

  const userNameString = `${user.user.forename} ${user.user.surname}`

  return (
    <>
      <h1>{userNameString}</h1>
      <UserForm {...user} />
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  )
}

export default UserPage
