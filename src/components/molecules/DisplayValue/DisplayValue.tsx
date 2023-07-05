import { FC } from 'react'
import classes from './styles.module.scss'

export interface DisplayValueProps {
  value?: string | number | boolean | readonly string[]
}

// TODO: needs changes to handle other types of values

const DisplayValue: FC<DisplayValueProps> = ({ value }) => {
  return <span className={classes.cellValue}>{value}</span>
}

export default DisplayValue
