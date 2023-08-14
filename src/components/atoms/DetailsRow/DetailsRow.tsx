import { FC } from 'react'

interface DetailsRowProps {
  hidden?: boolean
  value?: string
  label?: string
  labelClass?: string
}

const DetailsRow: FC<DetailsRowProps> = ({
  hidden,
  value,
  label,
  labelClass,
}) => {
  if (hidden) return null
  return (
    <>
      <span className={labelClass}>{label}</span>
      <span>{value}</span>
    </>
  )
}

export default DetailsRow
