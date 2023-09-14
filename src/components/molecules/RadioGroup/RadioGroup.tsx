import { ChangeEventHandler, RefObject, forwardRef } from 'react'
import { FieldError } from 'react-hook-form'
import classNames from 'classnames'
import { map, omit } from 'lodash'
import RadioInput from 'components/molecules//RadioInput/RadioInput'

import classes from './classes.module.scss'
import { DropDownOptions } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import InputError from 'components/atoms/InputError/InputError'

export interface RadioGroupProps {
  onChange: ChangeEventHandler<HTMLInputElement>
  value?: string
  error?: FieldError
  name: string
  hidden?: boolean
  className?: string
  options: DropDownOptions[]
  errorZIndex?: number
}

const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
  function RadioGroup(props, ref) {
    const {
      onChange,
      value,
      name,
      error,
      hidden,
      className,
      options,
      errorZIndex,
    } = props

    if (hidden) return null

    return (
      <fieldset className={classNames(classes.column, className)}>
        {map(options, ({ value: optionValue, label }) => (
          <RadioInput
            value={value}
            optionValue={optionValue}
            key={optionValue}
            ariaLabel={label}
            label={label}
            name={name}
            className={classes.radioRow}
            onChange={onChange}
          />
        ))}
        <InputError
          {...omit(error, 'ref')}
          errorZIndex={errorZIndex}
          wrapperRef={ref as RefObject<HTMLElement>}
        />
      </fieldset>
    )
  }
)

export default RadioGroup
