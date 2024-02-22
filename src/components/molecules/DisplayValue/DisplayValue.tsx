import { FC, useMemo } from 'react'
import { join, isArray, reduce, map, filter, includes, find } from 'lodash'
import classNames from 'classnames'
import { DropDownOptions } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import { VolumeValue } from 'types/volumes'

import classes from './classes.module.scss'

export interface DisplayValueProps {
  label?: string | JSX.Element
  options?: DropDownOptions[]
  className?: string
  name: string
  emptyDisplayText?: string
  hidden?: boolean
  value?:
    | string
    | number
    | boolean
    | readonly string[]
    | { [key: string]: string }
    | object
    | VolumeValue[]
}

const getDisplayedValueFromOptions = (
  options: DropDownOptions[],
  value: DisplayValueProps['value']
) => {
  if (isArray(value)) {
    const typedValue = value as unknown as string[]
    const selectedOptions = filter(options, (option) =>
      includes(typedValue, option.value)
    )
    return join(map(selectedOptions, 'label'), ', ')
  }
  return find(options, (option) => includes(value as string, option.value))
    ?.label
}

const DisplayValue: FC<DisplayValueProps> = ({
  value,
  label,
  options,
  className,
  hidden,
  emptyDisplayText = '',
}) => {
  const displayedValue = useMemo(() => {
    if (options) {
      return getDisplayedValueFromOptions(options, value)
    }
    if (isArray(value)) return join(value, ', ')
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value
    }
    if (value && 'date' in value) {
      return `${value?.date} ${value?.time.slice(0, -3)}`
    }
    return reduce(
      value,
      (result, valueString) => {
        if (!valueString) return result
        return `${result} ${valueString}`
      },
      ''
    )
  }, [options, value])

  if (hidden) return null
  return (
    <div className={classNames(classes.row, className)}>
      <span hidden={!label} className={classes.label}>
        {label}
      </span>
      <span className={classes.cellValue}>
        {displayedValue || emptyDisplayText}
      </span>
    </div>
  )
}

export default DisplayValue
