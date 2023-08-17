import { forwardRef } from 'react'
import classNames from 'classnames'
import { Field, Label, Control } from '@radix-ui/react-form'
import classes from './classes.module.scss'
import { omit } from 'lodash'
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
    ...rest
  } = props
  const { t } = useTranslation()

  const handleOnClick = () => {
    if (handleDelete) {
      handleDelete()
    }
  }
  // Might need event handler wrappers here
  if (hidden) return null

  const inputProps = {
    ...(placeholder ? { placeholder } : {}),
    className: classes.inputField,
    ref,
    value: value || '',
    'aria-label': ariaLabel,
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
      <div
        className={classNames(classes.inputContainer, {
          [classes.addDeleteButton]: !!handleDelete,
        })}
      >
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
        <Button
          appearance={AppearanceTypes.Text}
          iconPositioning={IconPositioningTypes.Right}
          icon={Delete}
          children={t('button.delete')}
          className={classes.button}
          onClick={handleOnClick}
          hidden={!handleDelete}
        />
        <InputError {...omit(error, 'ref')} errorZIndex={errorZIndex} />
      </div>
    </Field>
  )
})

export default TextInput
