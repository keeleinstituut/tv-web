import { FC } from 'react'

export interface DisplayValueProps {
  value?: string | number | boolean | readonly string[]
}

// TODO: needs changes to handle other types of values

const DisplayValue: FC<DisplayValueProps> = ({ value }) => {
  return <span>{value}</span>
}

export default DisplayValue
