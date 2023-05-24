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
import SelectionControlsInput, {
  SelectionControlsInputProps,
} from 'components/organisms/SelectionControlsInput/SelectionControlsInput'
import TimePickerInput, {
  TimePickerInputProps,
} from 'components/molecules/TimePickerInput/TimePickerInput'

// Extend all props of an input with the corresponding inputType

export enum InputTypes {
  Text = 'text',
  Checkbox = 'checkbox',
  Date = 'date',
  Selections = 'selections',
  Time = 'time',
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

type SelectionControlsPropsWithType = SelectionControlsInputProps & {
  inputType: InputTypes.Selections
}

type TimePickerPropsWithType = TimePickerInputProps & {
  inputType: InputTypes.Time
}

export type InputPropsByType =
  | TextInputPropsWithType
  | CheckBoxInputPropsWithType
  | DatePickerPropsWithType
  | SelectionControlsPropsWithType
  | TimePickerPropsWithType

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
      case InputTypes.Selections:
        return (
          <SelectionControlsInput {...omit(props, 'inputType')} ref={ref} />
        )
      case InputTypes.Time:
        return <TimePickerInput {...omit(props, 'inputType')} ref={ref} />
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
