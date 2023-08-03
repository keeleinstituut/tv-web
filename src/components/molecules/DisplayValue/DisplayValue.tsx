import { FC, useMemo } from 'react'
import { join, isArray, reduce } from 'lodash'
import classes from './classes.module.scss'

export interface DisplayValueProps {
  value?:
    | string
    | number
    | boolean
    | readonly string[]
    | { [key: string]: string }
  label?: string | JSX.Element
}

const DisplayValue: FC<DisplayValueProps> = ({ value, label }) => {
  const displayedValue = useMemo(() => {
    if (isArray(value)) return join(value, ', ')
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value
    }
    if (typeof value === 'boolean')
      return reduce(
        value,
        (result, valueString) => {
          if (!valueString) return result
          return `${result} ${valueString}`
        },
        ''
      )
  }, [value])
  return (
    <>
      <span hidden={!label} className={classes.label}>
        {label}
      </span>
      <span className={classes.cellValue}>{displayedValue}</span>
    </>
  )
}

export default DisplayValue
