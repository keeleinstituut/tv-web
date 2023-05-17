import { useEffect, useState } from 'react'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as ButtonArrow } from 'assets/icons/button_arrow.svg'
import Icon from 'components/atoms/Icon/Icon'
import { map, range } from 'lodash'

import classes from './styles.module.scss'

export type TimeColumnProps = {
  start: number
  end: number
  setValue: (value: string) => void
  value: string
}

const TimeColumn = ({ start, end, setValue, value }: TimeColumnProps) => {
  const [selectedTime, setSelectedTime] = useState<number>(+value ? +value : 0)

  const timeArray = range(start, end)

  useEffect(() => {
    setValue(
      selectedTime.toString().length === 1
        ? `0${selectedTime}`
        : selectedTime.toString()
    )
  }, [selectedTime, setValue])

  const controlBottom = () => {
    if (selectedTime !== end - 1) {
      setSelectedTime(selectedTime + 1)
    }
    if (selectedTime === end - 1) {
      setSelectedTime(start)
    }
  }

  const controlTop = () => {
    if (selectedTime !== start) {
      setSelectedTime(selectedTime - 1)
    } else {
      setSelectedTime(end - 1)
    }
  }

  return (
    <div className={classes.control}>
      <div className={classes.selector} />
      <BaseButton onClick={controlTop} className={classes.controlTimeTop}>
        <Icon icon={ButtonArrow} />
      </BaseButton>
      <div className={classes.timeWrapper}>
        {map(timeArray, (time) => {
          return (
            <div
              key={time}
              className={
                +time === selectedTime ? classes.selected : classes.numbers
              }
            >
              {time.toString().length === 1 ? `0${time}` : time}
            </div>
          )
        })}
      </div>
      <BaseButton onClick={controlBottom} className={classes.controlTimeBottom}>
        <Icon icon={ButtonArrow} />
      </BaseButton>
    </div>
  )
}

export default TimeColumn
