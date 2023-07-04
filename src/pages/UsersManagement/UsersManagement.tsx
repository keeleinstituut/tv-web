import Button from 'components/molecules/Button/Button'
import { useFetchUsers } from 'hooks/requests/useUsers'
import { FC } from 'react'

// TODO: WIP - implement this page

const UsersManagement: FC = () => {
  const { users } = useFetchUsers()
  return (
    <>
      <h1>UsersManagement</h1>
      <Button href={`/settings/users/${users?.[0]?.id}`}>
        kasutaja vaatesse
      </Button>
      <Button href="/settings/users/add">Lisa kasutajad</Button>
    </>
  )
}

export default UsersManagement
