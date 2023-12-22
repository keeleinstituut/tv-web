import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as ButtonArrow } from 'assets/icons/button_arrow.svg'
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
  autoFocus?: boolean
}

const TimeColumn = ({
  start,
  end,
  setValue,
  value,
  isTimeColumnOpen,
  autoFocus,
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
    const inputValue = event.target.value

    if (parseInt(inputValue) < 24) {
      setValue(parseInt(inputValue))
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
        // autoFocus={isTimeColumnOpen && isHourValue}
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
        autoFocus={autoFocus}
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
