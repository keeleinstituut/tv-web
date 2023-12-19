import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ReactComponent as ButtonArrow } from 'assets/icons/button_arrow.svg'
import { parseInt } from 'lodash'
import classes from './classes.module.scss'
import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

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
  isHourValue,
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
  console.log('value', value)
  const formattedValueToString = value < 10 ? '0' + value : value

  //  value?.toString().length === 1 ? `0${value}` : value?.toString()

  console.log('formattedValueToString', formattedValueToString)
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('event', event)
    const inputValue = event.target.value
    console.log('inputvalue', inputValue, parseInt(inputValue) < 10)
    const hourRegex = /^([01]?[0-9]?|2[0-3]?)?$/
    const minuteRegex = /^([0-5]?[0-9]?)?$/

    const regex = isHourValue ? hourRegex : minuteRegex
    const formattedValueToString =
      parseInt(inputValue) < 10 ? '0' + inputValue : inputValue

    // inputValue?.toString().length === 1
    //   ? `0${inputValue}`
    //   : inputValue?.toString()

    // if (regex.test(formattedValueToString)) {
    if (parseInt(inputValue) < 24) {
      console.log('ste', formattedValueToString, parseInt(inputValue))
      setValue(parseInt(inputValue))
      // setValue(
      //   inputValue?.toString().length === 1
      //     ? `0${inputValue}`
      //     : inputValue?.toString()
      // )
    }
  }
  console.log('isTimeColumnOpen', isTimeColumnOpen)
  return (
    <div className={classes.control}>
      {/* <div className={classes.selector} /> */}
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
      {/* <div className={classes.timeWrapper}>
        <span className={value ? classes.selected : ''}>
          {formattedValueToString}
        </span>
      </div> */}
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
