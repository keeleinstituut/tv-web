import BaseButton from 'components/atoms/BaseButton/BaseButton'
import ButtonArrow from 'assets/icons/button_arrow.svg?react'
import { parseInt } from 'lodash'
import classes from './classes.module.scss'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import React from 'react'

export type TimeColumnProps = {
  start: number
  end: number
  setValue: (value: number) => void
  value: number
  isTimeColumnOpen?: boolean
  isHourValue?: boolean
}

const TimeColumn = ({
  start,
  end,
  setValue,
  value,
  isTimeColumnOpen,
}: TimeColumnProps) => {
  const { t } = useTranslation()
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
  const formattedValueToString = value < 10 ? '0' + value : value

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseInt(event.target.value)

    if (inputValue >= end) {
      setValue(end - 1)
    } else if (inputValue < start) {
      setValue(start)
    } else {
      setValue(inputValue)
    }
  }

  return (
    <div className={classes.control}>
      <BaseButton
        onClick={controlTop}
        className={classNames(
          classes.controlTimeTop,
          isTimeColumnOpen && classes.focusTimeColumnButton
        )}
        aria-label={t('button.increase')}
      >
        <ButtonArrow />
      </BaseButton>
      <input
        className={classes.selector}
        type="text"
        value={formattedValueToString}
        aria-label={'nimi'}
        onChange={handleInputChange}
        min={start}
        max={end}
      />
      <BaseButton
        onClick={controlBottom}
        className={classNames(
          classes.controlTimeBottom,
          isTimeColumnOpen && classes.focusTimeColumnButton
        )}
        aria-label={t('button.decrease')}
      >
        <ButtonArrow />
      </BaseButton>
    </div>
  )
}

export default TimeColumn
