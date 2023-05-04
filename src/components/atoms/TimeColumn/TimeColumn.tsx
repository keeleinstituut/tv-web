import { useState, useEffect } from 'react'
import Icon from 'components/atoms/Icon/Icon'
import { ReactComponent as TimeArrow } from 'assets/icons/time_arrow.svg'

import classes from './styles.module.scss'

type TimeColumnProps = {
  start: number
  end: number
  setValue: (value: string) => void
  value: string
  exclude?: Array<number>
  notShowExclude?: boolean
}

const TimeColumn = ({
  start,
  end,
  setValue,
  value,
  exclude,
  notShowExclude,
}: TimeColumnProps) => {
  const [selectorMove, setSlecetorMove] = useState<number>(+value ? +value : 0)

  const timeArray: (string | number)[] = []
  for (let time = start; time <= end; time++) {
    if (notShowExclude) !exclude?.includes(time) && timeArray.push(time)
    else timeArray.push(time)
  }

  useEffect(() => {
    let prev = selectorMove
    if (exclude?.includes(prev)) {
      while (exclude?.includes(prev)) {
        prev = prev + 1
        setSlecetorMove(prev)
      }
    }
  }, [])

  useEffect(() => {
    setValue(
      selectorMove.toString().length === 1
        ? `0${selectorMove}`
        : selectorMove.toString()
    )
  }, [selectorMove])

  const controlBottom = () => {
    let prev = selectorMove
    if (prev !== end) {
      if (exclude?.includes(prev + 1)) {
        while (exclude?.includes(prev + 1)) {
          if (prev + 2 > end) {
            return setSlecetorMove(start)
          }
          prev = prev + 1
          setSlecetorMove(prev + 1)
        }
      } else {
        return setSlecetorMove(prev + 1)
      }
    } else {
      return setSlecetorMove(start)
    }
  }

  const controlTop = () => {
    let prev = selectorMove
    if (prev !== start) {
      if (exclude?.includes(prev - 1)) {
        while (exclude?.includes(prev - 1)) {
          if (prev - 2 < start) {
            return setSlecetorMove(end)
          }
          prev = prev - 1
          setSlecetorMove(prev - 1)
        }
      } else {
        return setSlecetorMove(prev - 1)
      }
    } else {
      let endnumber = end
      if (exclude?.includes(end)) {
        while (exclude?.includes(endnumber - 1)) {
          endnumber = endnumber - 1
          setSlecetorMove(endnumber - 1)
        }
      } else {
        return setSlecetorMove(end)
      }
    }
  }

  const controlTopTest = () => {
    let prev = selectorMove
    if (prev !== start) {
      if (exclude?.includes(prev - 1)) {
        while (exclude?.includes(prev - 1)) {
          if (prev - 2 < start) {
            return setSlecetorMove(end)
          }
          prev = prev - 1
          setSlecetorMove(prev - 1)
        }
      } else {
        return setSlecetorMove(prev - 1)
      }
    } else {
      let endnumber = end
      if (exclude?.includes(end)) {
        while (exclude?.includes(endnumber - 1)) {
          endnumber = endnumber - 1
          setSlecetorMove(endnumber - 1)
        }
      } else {
        return setSlecetorMove(end)
      }
    }
  }

  return (
    <div className={classes.control}>
      <div className={classes.timeContainer}>
        <div className={classes.selector} />
        <div className={classes.controlTimeTop} onClick={controlTopTest}>
          <Icon icon={TimeArrow} ariaLabel={'top time arrow'} />
        </div>
        <div
          className={classes.timeWrapper}
          style={{
            transform: `translateY(-${
              selectorMove && timeArray.indexOf(selectorMove) * 40
            }px)`,
          }}
        >
          {timeArray.map((time) => (
            <div
              key={time}
              className={` ${
                +time === selectorMove ? classes.selected : classes.numbers
              } ${exclude && exclude.includes(+time) ? classes.disabled : ''}`}
            >
              {time.toString().length === 1 ? `0${time}` : time}
            </div>
          ))}
        </div>
        <div className={classes.controlTimeBottom} onClick={controlBottom}>
          <Icon icon={TimeArrow} ariaLabel={'bottom time arrow'} />
        </div>
      </div>
    </div>
  )
}

export default TimeColumn
