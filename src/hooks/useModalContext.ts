import { ModalContext } from 'components/organisms/ModalBase/ModalBase'
import { useContext } from 'react'

// Convenience wrapper so we wouldn't have to import both useContext and AuthContext everywhere
const useModalContext = () => useContext(ModalContext)

export default useModalContext
