import { useCallback, forwardRef, Suspense } from 'react'
import { ControllerProps } from 'react-hook-form'
import { omit } from 'lodash'
import { SimpleUnionOmit } from 'types/helpers'
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

    const inputsByType = {
      [InputTypes.Text]: <TextInput {...omit(props, 'inputType')} ref={ref} />,
      [InputTypes.Checkbox]: (
        <CheckBoxInput {...omit(props, 'inputType')} ref={ref} />
      ),
      [InputTypes.Date]: (
        <DatePickerInput
          {...omit(props, 'inputType')}
          ref={ref}
          value={props.value ? props.value.toString() : undefined}
        />
      ),
    }

    return inputsByType[inputType]
  }
)

const DynamicInputComponent = (
  props: InputPropsWithoutControllerProps
): ControllerProps['render'] => {
  const FieldComponent: ControllerProps['render'] = useCallback(
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
