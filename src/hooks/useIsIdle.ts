import { useEffect, useState } from 'react'

// Listens for events in the document and sets a timeout.
// Returns true when these events wont be triggered during
// the timeout.
const useIsIdle = (ms: number) => {
  const [isIdle, setIsIdle] = useState(false)

  useEffect(() => {
    if (!ms) {
      return
    }

    const whenIdle = () => {
      setIsIdle(true)
    }

    let timer: NodeJS.Timeout

    function resetTimer() {
      setIsIdle(false)

      clearTimeout(timer)
      timer = setTimeout(whenIdle, ms) // time is in milliseconds
    }

    window.addEventListener('load', resetTimer, true)
    window.addEventListener('mousemove', resetTimer, true)
    window.addEventListener('mousedown', resetTimer, true)
    window.addEventListener('touchstart', resetTimer, true)
    window.addEventListener('touchmove', resetTimer, true)
    window.addEventListener('click', resetTimer, true)
    window.addEventListener('keydown', resetTimer, true)
    window.addEventListener('scroll', resetTimer, true)
  }, [ms])

  return isIdle
}

export default useIsIdle
