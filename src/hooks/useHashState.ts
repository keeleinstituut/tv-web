import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { trim } from 'lodash'

const useHashState = () => {
  const [currentHash, setHashState] = useState('')
  const [isMounted, setIsMounted] = useState(false)
  const navigate = useNavigate()
  useEffect(() => {
    if (window.location.hash && !isMounted) {
      const newHashState = trim(window.location.hash, '#')
      setHashState(newHashState)
      setIsMounted(true)
    } else if (!isMounted) {
      setIsMounted(true)
    }
  }, [])

  const setHash = useCallback(
    (hash: string) => {
      if (isMounted) {
        setHashState(hash)
        navigate({
          hash,
        })
      }
    },
    [isMounted, navigate]
  )

  return { setHash, currentHash }
}

export default useHashState
