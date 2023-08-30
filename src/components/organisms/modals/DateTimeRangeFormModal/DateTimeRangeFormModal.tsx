/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'

import { useTranslation } from 'react-i18next'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { filter, isEqual, map, reduce, split, uniqueId } from 'lodash'
import { Path, SubmitHandler, useForm } from 'react-hook-form'
import { ReactComponent as Add } from 'assets/icons/add.svg'
import { TagTypes } from 'types/tags'
import classes from './classes.module.scss'

export interface TimeRangeType {
  start: string
  end: string
}
export type EditDataType = {
  id?: string
  days?: string[]
  time_range?: TimeRangeType
}

dayjs.extend(timezone)

export interface DateTimeRangeFormModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  editableData?: EditDataType[]
  title?: string
  type?: TagTypes
  handleOnSubmit?: (values: EditDataType[]) => void
  inputValidator?: (value?: string | undefined) => string | true
  hasAddingPrivileges?: boolean
  hasDeletingPrivileges?: boolean
  hasEditPrivileges?: boolean
}

type FormValues = {
  [key in string]: {
    days: string[]
    time_range: TimeRangeType
  }
}

const DateTimeRangeFormModal: FC<DateTimeRangeFormModalProps> = ({
  isModalOpen,
  closeModal,
  editableData,
  title,
  type,
  handleOnSubmit,
  hasAddingPrivileges,
  hasDeletingPrivileges,
  hasEditPrivileges,
}) => {
  const { t } = useTranslation()

  const defaultValues: FormValues = useMemo(
    () =>
      reduce(
        editableData,
        (result, value) => {
          if (!value.id) {
            return result
          }
          return {
            ...result,
            [value.id]: value,
          }
        },
        {}
      ),

    [editableData]
  )

  // console.log('default', defaultValues)

  const { handleSubmit, control, watch, reset, unregister } =
    useForm<FormValues>({
      reValidateMode: 'onChange',
      defaultValues: defaultValues,
    })

  const watchFieldArray = watch()

  const editableFields: FieldProps<FormValues>[] = map(
    editableData,
    ({ id }) => {
      return {
        inputType: InputTypes.DayTimeRange,
        name: `${id}` as Path<FormValues>,
        id: id,
        handleDelete: () => setPrevDeletedValue(id),
      }
    }
  )

  const [inputFields, setInputFields] =
    useState<FieldProps<FormValues>[]>(editableFields)

  const [prevDeletedValue, setPrevDeletedValue] = useState<string>()

  const addInputField = () => {
    const newId = uniqueId()
    const newFields: FieldProps<FormValues>[] = [
      ...inputFields,
      {
        inputType: InputTypes.DayTimeRange,
        name: `${newId}` as Path<FormValues>,
        handleDelete: () => setPrevDeletedValue(newId),
      },
    ]
    setInputFields(newFields)
  }

  useEffect(() => {
    const withoutDeleteFields = filter(inputFields, (field) => {
      const fieldId = split(field.name, '.')[0]
      return !isEqual(fieldId, prevDeletedValue)
    })
    setInputFields(withoutDeleteFields)
    unregister(prevDeletedValue)
  }, [prevDeletedValue])

  console.log('updated', watchFieldArray)

  const onSubmit: SubmitHandler<FormValues> = useCallback(async (values) => {
    console.log(values)
    const timezone = dayjs.tz.guess()

    const payload = map(values, (value) => {
      console.log(value)
    })
    console.log('payload', payload)

    // worktime_timezone: 'Europe/Tallinn',
    // monday_worktime_start: '08:00:00',
    // monday_worktime_end: '16:00:00',
    // tuesday_worktime_start: '08:00:00',
    // tuesday_worktime_end: '16:00:00',
    // wednesday_worktime_start: '08:00:00',
    // wednesday_worktime_end: '16:00:00',
    // thursday_worktime_start: '08:00:00',
    // thursday_worktime_end: '17:00:00',
    // friday_worktime_start: '09:00:00',
    // friday_worktime_end: '16:00:00',
    // saturday_worktime_start: undefined,
    // saturday_worktime_end: undefined,
    // sunday_worktime_start: undefined,
    // sunday_worktime_end: undefined,
  }, [])

  return (
    <ModalBase
      title={title}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      buttonsPosition={ButtonPositionTypes.Right}
      size={ModalSizeTypes.Medium}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          children: t('button.cancel'),
          size: SizeTypes.M,
          onClick: () => {
            reset(defaultValues)
            setInputFields(editableFields)
            closeModal()
          },
        },
        {
          appearance: AppearanceTypes.Primary,
          form: 'dateTimeRange',
          children: t('button.save'),
          loading: false,
          type: 'submit',
        },
      ]}
    >
      <DynamicForm
        formId="dateTimeRange"
        fields={inputFields}
        control={control}
        className={classes.formContainer}
        onSubmit={handleSubmit(onSubmit)}
      />
      <Button
        appearance={AppearanceTypes.Text}
        iconPositioning={IconPositioningTypes.Left}
        icon={Add}
        children={t('tag.add_new_row')}
        onClick={addInputField}
        // hidden={!hasAddingPrivileges}
        form="dateTimeRange"
      />
    </ModalBase>
  )
}

export default DateTimeRangeFormModal
