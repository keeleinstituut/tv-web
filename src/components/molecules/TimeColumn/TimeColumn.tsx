import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as ButtonArrow } from 'assets/icons/button_arrow.svg'

import classes from './styles.module.scss'
import classNames from 'classnames'

export type TimeColumnProps = {
  start: number
  end: number
  setValue: (value: number) => void
  value: number
  isTimeColumnOpen?: boolean
}

const TimeColumn = ({
  start,
  end,
  setValue,
  value,
  isTimeColumnOpen,
}: TimeColumnProps) => {
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

  const formattedValueToString =
    value?.toString().length === 1 ? `0${value}` : value?.toString()

  return (
    <div className={classes.control}>
      <div className={classes.selector} />
      <BaseButton
        onClick={controlTop}
        className={classNames(
          classes.controlTimeTop,
          isTimeColumnOpen && classes.focusTimeColumnButton
        )}
      >
        <ButtonArrow />
      </BaseButton>
      <div className={classes.timeWrapper}>
        <span className={value ? classes.selected : ''}>
          {formattedValueToString}
        </span>
      </div>
      <BaseButton
        onClick={controlBottom}
        className={classNames(
          classes.controlTimeBottom,
          isTimeColumnOpen && classes.focusTimeColumnButton
        )}
      >
        <ButtonArrow />
      </BaseButton>
    </div>
  )
}

export default TimeColumn
