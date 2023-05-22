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
}

const InputWrapper = forwardRef<HTMLInputElement, InputWrapperProps>(
  function InputWrapper({ label, name, error, className, children }, ref) {
    return (
      <Field name={name} className={classNames(classes.container, className)}>
        <Label
          className={classNames(classes.label, !label && classes.hiddenLabel)}
        >
          {label}
        </Label>
        <div
          className={classNames(classes.wrapper, error && classes.errorMessage)}
          ref={ref}
        >
          {children}
          <InputError {...error} />
        </div>
      </Field>
    )
  }
)

export default InputWrapper
