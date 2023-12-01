import { usePrevious } from 'ahooks'
import { useCallback, useEffect, useRef, useState } from 'react'

const useWaitForLoading = () => {
  const [isLoading, setLoading] = useState(false)
  const wasLoading = usePrevious(isLoading)
  const resolveRef = useRef<(value: boolean | PromiseLike<boolean>) => void>()

  const startLoading = useCallback(() => {
    setLoading(true)
  }, [])

  const finishLoading = useCallback(() => {
    setLoading(false)
  }, [])

  const waitForLoadingToFinish = useCallback(() => {
    if (!isLoading && wasLoading && !resolveRef.current) {
      return Promise.resolve(true)
    }

    return new Promise((resolve) => {
      resolveRef.current = resolve
    })
  }, [isLoading, wasLoading])

  useEffect(() => {
    if (!isLoading && wasLoading && resolveRef.current) {
      resolveRef?.current(true)
    }
  }, [isLoading, wasLoading])

  return { isLoading, startLoading, finishLoading, waitForLoadingToFinish }
}

export default useWaitForLoading
