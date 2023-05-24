import Button from 'components/molecules/Button/Button'
import { useFetchUsers } from 'hooks/requests/useUsers'
import { FC } from 'react'

// TODO: WIP - implement this page

const UsersManagement: FC = () => {
  const { users } = useFetchUsers()
  return (
    <>
      <Button href={`/settings/users/${users?.[0]?.id}`}>
        kasutaja vaatesse
      </Button>
      <h1>UsersManagement</h1>
      <pre>{JSON.stringify(users, null, 2)}</pre>
    </>
  )
}

export default UsersManagement
