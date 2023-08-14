import { useState, useCallback, useEffect, RefObject } from 'react'

const useElementPosition = <RefType extends HTMLElement>(
  ref?: RefObject<RefType>,
  horizontalContainerId?: string,
  verticalContainerId?: string,
  forceRecalculate?: boolean
) => {
  const {
    x: initialLeft,
    y: initialTop,
    right: initialRight,
  } = ref?.current?.getBoundingClientRect() || {}

  const [{ left, top, right }, setPosition] = useState({
    left: initialLeft,
    top: initialTop,
    right: initialRight,
  })

  const recalculatePosition = useCallback(() => {
    const { x, y, right } = ref?.current?.getBoundingClientRect() || {}
    setPosition({ left: x, top: y, right })
  }, [ref])

  useEffect(() => {
    if (forceRecalculate) {
      recalculatePosition()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forceRecalculate])

  useEffect(() => {
    // Most of the pages will only be vertically scrollable
    // and the scroll will happen inside the mainScroll container
    // So for easier use there is no need to pass anything other than ref to this hook
    const verticalScrollContainer = verticalContainerId
      ? document.getElementById(verticalContainerId)
      : document.getElementById('mainScroll')
    const horizontalScrollContainer = horizontalContainerId
      ? document.getElementById(horizontalContainerId)
      : null
    if (ref) {
      recalculatePosition()
      horizontalScrollContainer?.addEventListener('scroll', recalculatePosition)
      verticalScrollContainer?.addEventListener('scroll', recalculatePosition)
      window.addEventListener('resize', recalculatePosition)
    }
    return () => {
      verticalScrollContainer?.removeEventListener(
        'scroll',
        recalculatePosition
      )
      horizontalScrollContainer?.removeEventListener(
        'scroll',
        recalculatePosition
      )
      window.removeEventListener('resize', recalculatePosition)
    }
  }, [horizontalContainerId, recalculatePosition, ref, verticalContainerId])

  return { left, top, right }
}

export default useElementPosition
