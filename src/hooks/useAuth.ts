import { AuthContext } from 'hooks/useKeycloak'
import { useContext } from 'react'

// Convenience wrapper so we wouldn't have to import both useContext and AuthContext everywhere
const useAuth = () => useContext(AuthContext)

export default useAuth
