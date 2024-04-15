import { useEffect, useRef } from 'react'

function useAsRef<T>(obj: T) {
  const ref = useRef<T>()

  useEffect(() => {
    ref.current = obj
  }, [obj, ref])

  return ref
}

export default useAsRef
