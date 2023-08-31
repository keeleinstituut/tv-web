import { TableContext } from 'components/organisms/DataTable/DataTable'
import { useContext } from 'react'

// Convenience wrapper so we wouldn't have to import both useContext and AuthContext everywhere
const useTableContext = () => useContext(TableContext)

export default useTableContext
