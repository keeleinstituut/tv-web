import { useState, useEffect } from 'react'
import TimeColumn from 'components/atoms/TimeColumn/TimeColumn'

import classes from './styles.module.scss'

type TimePickerInputProps = {
  value?: string
  onChange: (value: string) => any
  defaultValue?: string
  minuteExclude?: Array<number>
  hourExclude?: Array<number>
  notShowExclude?: boolean
}

const TimePickerInput = ({
  onChange,
  defaultValue,
  //   minuteExclude,
  //   hourExclude,
  notShowExclude,
}: TimePickerInputProps) => {
  const [hour, setHour] = useState(
    defaultValue ? defaultValue.split(':')[0] : '00'
  )
  const [minute, setMinute] = useState(
    defaultValue ? defaultValue.split(':')[1] : '00'
  )

  const [second, setSecond] = useState(
    defaultValue ? defaultValue.split(':')[2] : '00'
  )

  useEffect(() => {
    onChange && onChange(`${hour}:${minute}`)
  }, [hour, minute])

  return (
    <div className={classes.container}>
      <TimeColumn
        notShowExclude={notShowExclude}
        start={0}
        end={23}
        value={hour}
        setValue={setHour}
        // exclude={hourExclude}
      />
      <TimeColumn
        notShowExclude={notShowExclude}
        start={0}
        end={59}
        value={minute}
        setValue={setMinute}
        // exclude={minuteExclude}
      />
      <TimeColumn
        notShowExclude={notShowExclude}
        start={0}
        end={59}
        value={second}
        setValue={setSecond}
        // exclude={minuteExclude}
      />
    </div>
  )
}

export default TimePickerInput
