import { Control } from 'react-hook-form'
import { DropDownOptions } from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import { useCallback } from 'react'
import { toString, includes } from 'lodash'
import useValidators from 'hooks/useValidators'
import {
  FormInput,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'

interface CellInputProps<TData> {
  typedKey: keyof TData
  rowIndex: number
  control: Control
  rowErrors: string[]
  errorZIndex: number
  options?: DropDownOptions[]
  ariaLabel: string
  type?: string
  placeholder?: string
}

function CellInput<TData extends object>(props: CellInputProps<TData>) {
  const {
    typedKey,
    rowIndex,
    control,
    rowErrors,
    errorZIndex,
    options,
    ariaLabel,
    type,
    placeholder,
  } = props

  const { emailValidator, picValidator, rolesValidator, phoneValidator } =
    useValidators()

  const getRulesByKey = useCallback(
    (key: keyof TData) => {
      switch (key) {
        case 'personal_identification_code':
          return {
            required: true,
            validate: (value: unknown) => {
              const typedValue = value as string
              return picValidator(typedValue)
            },
          }
        case 'email':
          return {
            required: true,
            validate: (value: unknown) => {
              const typedValue = value as string
              return emailValidator(typedValue)
            },
          }
        case 'role':
          return {
            required: true,
            validate: (value: unknown) => {
              const typedValue = value as string[]
              return rolesValidator(typedValue)
            },
          }
        case 'phone':
          return {
            required: true,
            validate: (value: unknown) => {
              const typedValue = value as string
              return phoneValidator(typedValue)
            },
          }
        case 'name':
          return {
            required: true,
          }
        default:
          return {}
      }
    },
    [emailValidator, phoneValidator, picValidator, rolesValidator]
  )

  return (
    <FormInput
      name={`row-${rowIndex}.${toString(typedKey)}`}
      ariaLabel={ariaLabel}
      control={control}
      onlyDisplay={!includes(rowErrors, typedKey as string)}
      errorZIndex={errorZIndex}
      {...(options
        ? {
            options: options,
            inputType: InputTypes.Selections,
            multiple: true,
            buttons: true,
            placeholder,
            tags: true,
          }
        : { inputType: InputTypes.Text })}
      {...(type ? { type } : {})}
      rules={getRulesByKey(typedKey)}
    />
  )
}

export default CellInput
