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
  isSearch?: boolean
  hidden?: boolean
  loading?: boolean
  isTextarea?: boolean
}

const TextInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  TextInputProps
>(function TextInput(props, ref) {
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
    isSearch,
    hidden,
    isTextarea,
    loading,
    ...rest
  } = props
  // Might need event handler wrappers here
  if (hidden) return null

  const inputProps = {
    ...(placeholder ? { placeholder } : {}),
    className: classes.inputField,
    ref,
    value: value || '',
    ariaLabel,
    disabled,
    ...rest,
  }
  return (
    <Field
      name={name}
      className={classNames(
        classes.container,
        isTextarea && classes.textareaContainer,
        isSearch && classes.searchInputContainer,
        isSearch && loading && classes.loading,
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
          {isTextarea ? (
            <textarea
              {...(inputProps as unknown as InputHTMLAttributes<HTMLTextAreaElement>)}
              rows={4}
            />
          ) : (
            <input
              {...(inputProps as unknown as InputHTMLAttributes<HTMLInputElement>)}
            />
          )}
        </Control>
        <InputError {...omit(error, 'ref')} errorZIndex={errorZIndex} />
      </div>
    </Field>
  )
})

export default TextInput
