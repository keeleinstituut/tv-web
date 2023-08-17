import { FC } from 'react'

interface DetailsRowProps {
  hidden?: boolean
  value?: string
  label?: string
  labelClass?: string
  valueClass?: string
}

const DetailsRow: FC<DetailsRowProps> = ({
  hidden,
  value,
  label,
  labelClass,
  valueClass,
}) => {
  if (hidden) return null
  return (
    <>
      <span className={labelClass}>{label}</span>
      <span className={valueClass}>{value}</span>
    </>
  )
}

export default DetailsRow
