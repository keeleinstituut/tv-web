import { FC, useMemo } from 'react'
import { join, isArray, reduce, map, filter, includes, find } from 'lodash'
import classes from './classes.module.scss'
import { DropDownOptions } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'

export interface DisplayValueProps {
  label?: string | JSX.Element
  options?: DropDownOptions[]
  className?: string
  emptyDisplayText?: string
  hidden?: boolean
  value?:
    | string
    | number
    | boolean
    | readonly string[]
    | { [key: string]: string }
}

const getDisplayedValueFromOptions = (
  options: DropDownOptions[],
  value: DisplayValueProps['value']
) => {
  if (isArray(value)) {
    const selectedOptions = filter(options, (option) =>
      includes(value, option.value)
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
      return value?.date
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
    <div className={className}>
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
