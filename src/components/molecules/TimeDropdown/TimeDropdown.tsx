import { forwardRef, FC, RefObject, useMemo } from 'react'
import TimeColumn from 'components/molecules/TimeColumn/TimeColumn'
import { useClickAway, useInViewport } from 'ahooks'

import classes from './classes.module.scss'
import { SharedTimeProps } from '../TimePickerInput/TimePickerInput'
import useModalContext from 'hooks/useModalContext'
import { createPortal } from 'react-dom'
import useElementPosition from 'hooks/useElementPosition'
import useTableContext from 'hooks/useTableContext'

export type TimeDropdownProps = SharedTimeProps & {
  isTimeColumnOpen?: boolean
  wrapperRef?: RefObject<HTMLDivElement>
  clickAwayInputRef?: RefObject<HTMLDivElement>
  setIsOpen?: (value: boolean) => void
}

const formatTimeString = (time: number) =>
  time?.toString().length === 1 ? `0${time}` : time?.toString()

const TimeDropdownComponent = forwardRef<HTMLDivElement, TimeDropdownProps>(
  function TimePickerInput(props, ref) {
    const {
      isTimeColumnOpen,
      onChange,
      disabled,
      value,
      showSeconds,
      setIsOpen,
      wrapperRef,
      errorZIndex,
    } = props

    const { tableRef } = useTableContext()
    const { modalContentId } = useModalContext()
    const typedRef = ref as RefObject<HTMLDivElement>
    const [inViewport, ratio] = useInViewport(typedRef, {
      root: tableRef as RefObject<HTMLDivElement> | undefined,
    })
    const {
      left = 0,
      top = 0,
      right = 0,
    } = useElementPosition({
      ref: wrapperRef,
      forceRecalculate: isTimeColumnOpen,
    }) || {}

    useClickAway(() => {
      if (setIsOpen) {
        setIsOpen(false)
      }
    }, [typedRef, wrapperRef])

    const splittedTimeValue = value?.split(':')

    const hourValue = Number(splittedTimeValue?.[0]) || 0
    const minuteValue = Number(splittedTimeValue?.[1]) || 0
    const secondValue = Number(splittedTimeValue?.[2]) || 0

    // TODO: possibly also move this to "useElementPosition"
    const useLeftPosition = useMemo(
      () =>
        (ratio || ratio === 0) && ratio < 1 && inViewport && !modalContentId,
      // isDragAndDropOpen changes, when this component is displayed
      // We don't want to update this state during any other time
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [inViewport]
    )

    const handleSetHour = (newHour: number) => {
      const timeWithSeconds = `${formatTimeString(newHour)}:${formatTimeString(
        minuteValue
      )}:${formatTimeString(secondValue)}`
      const formattedTime = `${formatTimeString(newHour)}:${formatTimeString(
        minuteValue
      )}`
      onChange(showSeconds ? timeWithSeconds : formattedTime)
    }

    const handleSetMinute = (newMinute: number) => {
      const timeWithSeconds = `${formatTimeString(
        hourValue
      )}:${formatTimeString(newMinute)}:${formatTimeString(secondValue)}`
      const formattedTime = `${formatTimeString(hourValue)}:${formatTimeString(
        newMinute
      )}`
      onChange(showSeconds ? timeWithSeconds : formattedTime)
    }

    const handleSetSecond = (newSecond: number) => {
      const timeWithSeconds = `${formatTimeString(
        hourValue
      )}:${formatTimeString(minuteValue)}:${formatTimeString(newSecond)}`
      onChange(timeWithSeconds)
    }

    return (
      <div
        className={
          !isTimeColumnOpen || disabled
            ? classes.hiddenContainer
            : classes.timeColumnContainer
        }
        ref={ref}
        style={{
          zIndex: 51 + (errorZIndex || 0),
          ...(wrapperRef
            ? {
                left: useLeftPosition ? 'unset' : left - 2,
                right: useLeftPosition ? right - left : 'unset',
                top: top + 40,
              }
            : {}),
        }}
      >
        <TimeColumn
          start={0}
          end={24}
          value={hourValue}
          setValue={handleSetHour}
          isTimeColumnOpen={isTimeColumnOpen}
          isHourValue
          autoFocus={isTimeColumnOpen}
        />
        <TimeColumn
          start={0}
          end={60}
          value={minuteValue}
          setValue={handleSetMinute}
          isTimeColumnOpen={isTimeColumnOpen}
        />
        {showSeconds && (
          <TimeColumn
            start={0}
            end={60}
            value={secondValue}
            setValue={handleSetSecond}
            isTimeColumnOpen={isTimeColumnOpen}
          />
        )}
      </div>
    )
  }
)

const TimeDropdown: FC<TimeDropdownProps> = ({
  wrapperRef,
  clickAwayInputRef,
  ...rest
}) => {
  const { modalContentId } = useModalContext()
  const shouldUsePortal = !!modalContentId
  if (shouldUsePortal) {
    return createPortal(
      <TimeDropdownComponent
        {...rest}
        wrapperRef={wrapperRef}
        ref={clickAwayInputRef}
      />,
      document.getElementById(modalContentId || 'root') || document.body
    )
  }
  return <TimeDropdownComponent {...rest} />
}

export default TimeDropdown
