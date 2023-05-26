import { ReactNode, forwardRef } from 'react'
import { Field, Label } from '@radix-ui/react-form'
import classNames from 'classnames'
import { FieldError } from 'react-hook-form'
import InputError from 'components/atoms/InputError/InputError'

import classes from './styles.module.scss'

export type InputWrapperProps = {
  name: string
  className?: string
  error?: FieldError
  label?: JSX.Element | string
  children?: ReactNode
  onClick?: () => void
  wrapperSizeClass?: string
}

const InputWrapper = forwardRef<HTMLInputElement, InputWrapperProps>(
  function InputWrapper(
    { label, name, error, className, children, onClick, wrapperSizeClass },
    ref
  ) {
    return (
      <Field name={name} className={classNames(classes.container, className)}>
        <Label
          htmlFor={name}
          className={classNames(classes.label, !label && classes.hiddenLabel)}
          onClick={onClick}
        >
          {label}
        </Label>
        <div
          className={classNames(
            classes.wrapper,
            error && classes.errorMessage,
            wrapperSizeClass
          )}
          ref={ref}
          onClick={onClick}
        >
          {children}
          <InputError {...error} />
        </div>
      </Field>
    )
  }
)

export default InputWrapper
