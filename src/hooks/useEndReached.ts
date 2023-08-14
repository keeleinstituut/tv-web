import { RefObject, useCallback, useEffect } from 'react'
import { debounce } from 'lodash'

const useEndReached = (
  target: RefObject<HTMLElement>,
  onEndReached?: () => void,
  offset?: number
) => {
  const debouncedOnEndReached = onEndReached
    ? debounce(onEndReached, 200, {
        leading: true,
        trailing: false,
      })
    : () => {
        // Do nothing
      }
  const onScroll = useCallback(() => {
    if (target.current) {
      const { scrollTop, scrollHeight, clientHeight } = target.current
      const isNearBottom =
        scrollTop + clientHeight >= scrollHeight - (offset || 0)

      if (isNearBottom && onEndReached) {
        debouncedOnEndReached()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, onEndReached, target])

  useEffect(() => {
    const listInnerElement = target.current

    if (listInnerElement) {
      listInnerElement.addEventListener('scroll', onScroll)

      // Clean-up
      return () => {
        listInnerElement.removeEventListener('scroll', onScroll)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.current, onScroll])
}

export default useEndReached
