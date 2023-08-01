import { FC } from 'react'
import { join, isArray } from 'lodash'
import classes from './classes.module.scss'

export interface DisplayValueProps {
  value?: string | number | boolean | readonly string[]
}

const DisplayValue: FC<DisplayValueProps> = ({ value }) => {
  return (
    <span className={classes.cellValue}>
      {isArray(value) ? join(value, ', ') : value}
    </span>
  )
}

export default DisplayValue
