import { FocusEvent, RefObject, forwardRef, useCallback, useRef } from 'react'
import classNames from 'classnames'
import { Field, Label, Control } from '@radix-ui/react-form'
import classes from './classes.module.scss'
import { omit, size, toString } from 'lodash'
import { useTranslation } from 'react-i18next'
import InputError from 'components/atoms/InputError/InputError'
import { InputHTMLAttributes } from 'react'
import { FieldError } from 'react-hook-form'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'label'> {
  name: string
  className?: string
  error?: FieldError
  label?: JSX.Element | string
  ariaLabel: string
  errorZIndex?: number
  handleDelete?: () => void
  isSearch?: boolean
  hidden?: boolean
  loading?: boolean
  isTextarea?: boolean
  inputContainerClassName?: string
  labelClassName?: string
  hasInputValueSize?: boolean
  handleOnBlur?: (value: string) => void
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
    handleDelete,
    inputContainerClassName,
    labelClassName,
    hasInputValueSize = false,
    handleOnBlur,
    onBlur,
    ...rest
  } = props
  const { t } = useTranslation()
  const wrapperRef = useRef(null)

  const handleOnClick = () => {
    if (handleDelete) {
      handleDelete()
    }
  }

  const inputProps = {
    ...(placeholder ? { placeholder } : {}),
    className: classes.inputField,
    ref,
    value: value ?? '',
    'aria-label': ariaLabel,
    disabled,
    ...rest,
    size: hasInputValueSize ? size(toString(value)) : undefined,
  }
  const handleOnBlurAction = useCallback(
    (e: unknown) => {
      if (!!handleOnBlur) {
        handleOnBlur(toString(value) || '')
      }
      if (!!onBlur) {
        const event = e as unknown as FocusEvent<HTMLInputElement, Element>
        onBlur(event)
      }
    },
    [handleOnBlur, onBlur, value]
  )
  // Might need event handler wrappers here
  if (hidden) return null

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
      <Label
        className={classNames(
          !label && classes.hidden,
          labelClassName ? labelClassName : classes.label
        )}
      >
        {label}
      </Label>
      <div
        className={classNames(classes.inputContainer, inputContainerClassName, {
          [classes.addDeleteButton]: !!handleDelete,
        })}
        ref={wrapperRef}
      >
        <Control asChild>
          {isTextarea ? (
            <textarea
              {...(inputProps as unknown as InputHTMLAttributes<HTMLTextAreaElement>)}
              rows={4}
              onBlur={(e) => handleOnBlurAction(e)}
            />
          ) : (
            <input
              {...(inputProps as unknown as InputHTMLAttributes<HTMLInputElement>)}
              onBlur={(e) => handleOnBlurAction(e)}
            />
          )}
        </Control>
        <Button
          appearance={AppearanceTypes.Text}
          iconPositioning={IconPositioningTypes.Right}
          icon={Delete}
          children={t('button.delete')}
          className={classes.button}
          onClick={handleOnClick}
          hidden={!handleDelete}
        />
        <InputError
          {...omit(error, 'ref')}
          errorZIndex={errorZIndex}
          wrapperRef={wrapperRef as RefObject<HTMLElement>}
        />
      </div>
    </Field>
  )
})

export default TextInput
