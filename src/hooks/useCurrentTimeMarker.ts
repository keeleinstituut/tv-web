import { DependencyList, useEffect, useState } from 'react'

/** Computes an initial value and re-computes every 60 seconds and on dep changes. */
export function useCurrentTimeMarker<T>(
  compute: () => T,
  deps: DependencyList
): T {
  const [value, setValue] = useState<T>(compute)
  useEffect(() => {
    setValue(compute())
    const id = setInterval(() => setValue(compute()), 60_000)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return value
}
