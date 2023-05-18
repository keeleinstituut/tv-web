import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as ButtonArrow } from 'assets/icons/button_arrow.svg'
import Icon from 'components/atoms/Icon/Icon'
import { map, range } from 'lodash'

import classes from './styles.module.scss'

export type TimeColumnProps = {
  start: number
  end: number
  setValue: (value: number) => void
  value: number
}

const TimeColumn = ({ start, end, setValue, value }: TimeColumnProps) => {
  const timeArray = range(start, end)

  const controlTop = () => {
    if (value !== end - 1) {
      setValue(value + 1)
    }
    if (value === end - 1) {
      setValue(start)
    }
  }

  const controlBottom = () => {
    if (value !== start) {
      setValue(value - 1)
    } else {
      setValue(end - 1)
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
              className={+time === value ? classes.selected : classes.numbers}
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
