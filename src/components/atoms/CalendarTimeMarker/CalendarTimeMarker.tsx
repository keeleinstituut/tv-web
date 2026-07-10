import { CSSProperties, FC } from 'react'
import classes from './classes.module.scss'

interface Props {
  style: CSSProperties
  dotTop?: number
}

const CalendarTimeMarker: FC<Props> = ({ style, dotTop = 0 }) => (
  <div className={classes.marker} style={style}>
    <div className={classes.dot} style={{ top: dotTop }} />
  </div>
)

export default CalendarTimeMarker
