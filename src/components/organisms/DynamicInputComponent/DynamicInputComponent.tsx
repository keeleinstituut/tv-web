import { useCallback, forwardRef, Suspense } from 'react'
import { ControllerProps, FieldValues } from 'react-hook-form'
import { omit } from 'lodash'
import { SimpleUnionOmit, assertNever } from 'types/helpers'
import TextInput, {
  TextInputProps,
} from 'components/molecules/TextInput/TextInput'
import CheckBoxInput, {
  CheckBoxInputProps,
} from 'components/molecules/CheckBoxInput/CheckBoxInput'
import DatePickerInput, {
  DatePickerInputProps,
} from 'components/molecules/DatePickerInput/DatePickerInput'

// Extend all props of an input with the corresponding inputType

export enum InputTypes {
  Text = 'text',
  Checkbox = 'checkbox',
  Date = 'date',
}

type TextInputPropsWithType = TextInputProps & {
  inputType: InputTypes.Text
}

type CheckBoxInputPropsWithType = CheckBoxInputProps & {
  inputType: InputTypes.Checkbox
}

type DatePickerPropsWithType = DatePickerInputProps & {
  inputType: InputTypes.Date
}

export type InputPropsByType =
  | TextInputPropsWithType
  | CheckBoxInputPropsWithType
  | DatePickerPropsWithType

export type InputPropsWithoutControllerProps = SimpleUnionOmit<
  InputPropsByType,
  'value' | 'onChange' | 'name' | 'ref'
>

// eslint-disable-next-line react/display-name
const InputComponent = forwardRef<HTMLInputElement, InputPropsByType>(
  (props, ref) => {
    const { inputType } = props

    switch (inputType) {
      case InputTypes.Text:
        return <TextInput {...omit(props, 'inputType')} ref={ref} />
      case InputTypes.Checkbox:
        return <CheckBoxInput {...omit(props, 'inputType')} ref={ref} />
      case InputTypes.Date:
        return <DatePickerInput {...omit(props, 'inputType')} ref={ref} />
      default:
        return assertNever(inputType)
    }
  }
)

function DynamicInputComponent<Type extends FieldValues>(
  props: InputPropsWithoutControllerProps
) {
  const FieldComponent: ControllerProps<Type>['render'] = useCallback(
    ({ field, fieldState: { error } }) => {
      return (
        <Suspense fallback={<div />}>
          <InputComponent {...props} {...field} error={error} />
        </Suspense>
      )
    },
    [props]
  )
  return FieldComponent
}

export default DynamicInputComponent
