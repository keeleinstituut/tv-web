import { forwardRef } from 'react'
import classNames from 'classnames'
import { Field, Label, Control } from '@radix-ui/react-form'
import classes from './classes.module.scss'
import { omit } from 'lodash'

import InputError from 'components/atoms/InputError/InputError'
import { InputHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'label'> {
  name: string
  className?: string
  error?: FieldError
  label?: JSX.Element | string
  ariaLabel: string
  errorZIndex?: number
  button?: JSX.Element
}

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(props, ref) {
    const {
      label,
      ariaLabel,
      error,
      name,
      className,
      value,
      placeholder,
      disabled,
      errorZIndex,
      button,
      ...rest
    } = props
    // Might need event handler wrappers here
    // Essentially this is just ariaLabel || label, but typescript seems to fail here
    return (
      <Field
        name={name}
        className={classNames(
          classes.container,
          disabled && classes.disabled,
          error && classes.error,
          className
        )}
      >
        <Label className={classNames(classes.label, !label && classes.hidden)}>
          {label}
        </Label>
        <div className={classes.inputContainer}>
          <Control asChild>
            <input
              {...(placeholder ? { placeholder } : {})}
              className={classes.inputField}
              ref={ref}
              value={value || ''}
              aria-label={ariaLabel}
              disabled={disabled}
              {...rest}
            />
          </Control>
          {button ? button : null}
          <InputError {...omit(error, 'ref')} errorZIndex={errorZIndex} />
        </div>
      </Field>
    )
  }
)

export default TextInput
