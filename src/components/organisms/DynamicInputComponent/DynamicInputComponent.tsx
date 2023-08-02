import { useCallback, forwardRef, Suspense, Ref } from 'react'
import {
  ControllerProps,
  FieldError,
  FieldValues,
  RefCallBack,
} from 'react-hook-form'
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
import DisplayValue from 'components/molecules/DisplayValue/DisplayValue'
import TagsSelect, {
  TagsSelectProps,
} from 'components/molecules/TagsSelect/TagsSelect'

// Extend all props of an input with the corresponding inputType

export enum InputTypes {
  Text = 'text',
  Checkbox = 'checkbox',
  Date = 'date',
  Selections = 'selections',
  Time = 'time',
  TagsSelect = 'tagsSelect',
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

type TagsSelectPropsWithType = TagsSelectProps & {
  inputType: InputTypes.TagsSelect
}

export type InputPropsByType = (
  | TextInputPropsWithType
  | CheckBoxInputPropsWithType
  | DatePickerPropsWithType
  | SelectionControlsPropsWithType
  | TimePickerPropsWithType
  | TagsSelectPropsWithType
) & { onlyDisplay?: boolean; error?: FieldError; errorZIndex?: number }

export type InputPropsWithoutControllerProps = SimpleUnionOmit<
  InputPropsByType,
  'value' | 'onChange' | 'name' | 'ref'
>

// eslint-disable-next-line react/display-name
const InputComponent = forwardRef<RefCallBack, InputPropsByType>(
  (props, ref) => {
    const { inputType, onlyDisplay } = props

    if (onlyDisplay) {
      return <DisplayValue value={props.value} label={props.label} />
    }

    switch (inputType) {
      case InputTypes.Text:
        return (
          <TextInput
            {...omit(props, ['inputType', 'onlyDisplay'])}
            ref={ref as unknown as Ref<HTMLInputElement>}
          />
        )
      case InputTypes.Checkbox:
        return (
          <CheckBoxInput
            {...omit(props, ['inputType', 'onlyDisplay'])}
            ref={ref as unknown as Ref<HTMLInputElement>}
          />
        )
      case InputTypes.Date:
        return (
          <DatePickerInput
            {...omit(props, ['inputType', 'onlyDisplay'])}
            ref={ref as unknown as Ref<HTMLInputElement>}
          />
        )
      case InputTypes.Selections:
        return (
          <SelectionControlsInput
            {...omit(props, ['inputType', 'onlyDisplay'])}
            ref={ref as unknown as Ref<HTMLButtonElement>}
          />
        )
      case InputTypes.Time:
        return (
          <TimePickerInput
            {...omit(props, ['inputType', 'onlyDisplay'])}
            ref={ref as unknown as Ref<HTMLInputElement>}
          />
        )
      case InputTypes.TagsSelect:
        // TODO: might need to add ref and error later
        // right now those don't seem to be needed for our only usecase
        return (
          <TagsSelect {...omit(props, ['inputType', 'onlyDisplay', 'error'])} />
        )
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
