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
  handleDelete?: (
    value: string | number | readonly string[] | undefined
  ) => void
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
      handleDelete,
      ...rest
    } = props
    const { t } = useTranslation()
    // Might need event handler wrappers here
    // Essentially this is just ariaLabel || label, but typescript seems to fail here
    const handleOnClick = () => {
      if (handleDelete) {
        handleDelete(value)
      }
    }
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
        <div
          className={classNames(classes.inputContainer, {
            [classes.addDeleteButton]: true,
          })}
        >
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
  }
)

export default TextInput
