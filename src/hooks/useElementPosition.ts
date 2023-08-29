import { useState, useCallback, useEffect, RefObject } from 'react'

const useElementPosition = <RefType extends HTMLElement>({
  ref,
  horizontalWrapperId,
  verticalContainerId,
  forceRecalculate,
  containingElementId,
}: {
  ref?: RefObject<RefType>
  horizontalWrapperId?: string
  verticalContainerId?: string
  forceRecalculate?: boolean
  containingElementId?: string
}) => {
  const {
    x: initialLeft,
    y: initialTop,
    right: initialRight,
  } = ref?.current?.getBoundingClientRect() || {}

  const parentElement = containingElementId
    ? document.getElementById(containingElementId)
    : null

  const {
    y: parentY = 0,
    x: parentX = 0,
    right: parentRight = 0,
  } = parentElement?.getBoundingClientRect() || {}

  const [{ left, top, right }, setPosition] = useState({
    left: (initialLeft || 0) - parentX,
    top: (initialTop || 0) - parentY,
    right: (initialRight || 0) - parentRight,
  })

  // console.warn('parentPosition', parentPosition)

  const recalculatePosition = useCallback(() => {
    const {
      x = 0,
      y = 0,
      right = 0,
    } = ref?.current?.getBoundingClientRect() || {}
    setPosition({
      left: x - parentX,
      top: y - parentY,
      right: right - parentRight,
    })
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
    const horizontalScrollContainer = horizontalWrapperId
      ? document.getElementById(horizontalWrapperId)
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
  }, [horizontalWrapperId, recalculatePosition, ref, verticalContainerId])

  return { left, top, right }
}

export default useElementPosition
