import { FC } from 'react'
import { join, isArray } from 'lodash'
import classes from './classes.module.scss'

export interface DisplayValueProps {
  value?: string | number | boolean | readonly string[]
  label?: string | JSX.Element
}

const DisplayValue: FC<DisplayValueProps> = ({ value, label }) => {
  return (
    <>
      <span hidden={!label} className={classes.label}>
        {label}
      </span>
      <span className={classes.cellValue}>
        {isArray(value) ? join(value, ', ') : value}
      </span>
    </>
  )
}

export default DisplayValue
