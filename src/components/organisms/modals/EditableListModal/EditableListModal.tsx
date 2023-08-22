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
import { useTranslation } from 'react-i18next'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import {
  filter,
  includes,
  isArray,
  isEmpty,
  isEqual,
  join,
  map,
  omitBy,
  reduce,
  size,
  split,
  toNumber,
  uniqueId,
} from 'lodash'
import { FieldPath, SubmitHandler, useForm } from 'react-hook-form'
import { ReactComponent as Add } from 'assets/icons/add.svg'
import { TagTypes } from 'types/tags'
import classes from './classes.module.scss'
import { ValidationError } from 'api/errorHandler'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'

export enum DataStateTypes {
  UPDATED = 'UPDATED',
  NEW = 'NEW',
  DELETED = 'DELETED',
  OLD = 'OLD',
}

export type EditDataType = {
  type?: TagTypes
  name?: string
  id?: string
  state?: DataStateTypes
}

export interface EditableListModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  editableData?: EditDataType[]
  title?: string
  type?: TagTypes
  handleOnSubmit?: (values: EditDataType[]) => void
  inputValidator?: (value?: string | undefined) => string | true
  hasAddingPrivileges?: boolean
  hasDeletingPrivileges?: boolean
}

type FormValues = {
  [key in string]?: string
}

const EditableListModal: FC<EditableListModalProps> = ({
  isModalOpen,
  closeModal,
  editableData,
  title,
  type,
  handleOnSubmit,
  inputValidator,
  hasAddingPrivileges,
  hasDeletingPrivileges,
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
            [value.id]: value.name,
          }
        },
        {}
      ),

    [editableData]
  )

  const {
    control,
    handleSubmit,
    reset,
    setError,
    resetField,
    setValue,
    formState: { isSubmitting, isValid },
  } = useForm<FormValues>({
    values: defaultValues,
    resetOptions: {
      keepDirtyValues: true, // keep dirty fields unchanged, but update defaultValues
      keepErrors: true,
    },
  })

  const editableFields: FieldProps<FormValues>[] = map(
    editableData,
    ({ name, id }) => ({
      inputType: InputTypes.Text,
      ariaLabel: name || '',
      label: name || '',
      name: id || '',
      rules: {
        validate: inputValidator,
      },
      id: id,
      className: classes.editTagInput,
      ...(hasDeletingPrivileges
        ? { handleDelete: () => handleOnDelete(name, id) }
        : {}),
    })
  )

  const [inputFields, setInputFields] =
    useState<FieldProps<FormValues>[]>(editableFields)

  const [prevDeletedValues, setPrevDeletedValues] = useState<EditDataType[]>([])

  const addInputField = () => {
    const newId = uniqueId()

    setInputFields([
      ...inputFields,
      {
        id: newId,
        inputType: InputTypes.Text,
        ariaLabel: t('tag.tag_name'),
        name: `new_${size(inputFields)}_${newId}`,
        type: 'text',
        rules: {
          validate: inputValidator,
        },
        className: classes.editTagInput,
        ...(hasDeletingPrivileges
          ? {
              handleDelete: () =>
                handleOnDelete(`new_${size(inputFields)}_${newId}`),
            }
          : {}),
      },
    ])
  }
  const handleOnDelete = (name?: string, id?: string) => {
    resetField(id || name || '')
    setPrevDeletedValues((prevDeletedValues) => [
      ...prevDeletedValues,
      { name, id },
    ])
  }

  useEffect(() => {
    const deleteFields = filter(inputFields, (field) => {
      const values = map(prevDeletedValues, ({ name }) => name)
      const name = !field?.label ? field?.name : field?.label
      return !includes(values, name)
    })
    setInputFields(deleteFields)
  }, [prevDeletedValues])

  useEffect(() => {
    setInputFields(editableFields)
  }, [editableData])

  const resetForm = useCallback(() => {
    reset()
    setPrevDeletedValues([])
    setInputFields(editableFields)
  }, [editableFields, inputFields, reset])

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const omittedValues = omitBy(values, (value) => !value)
      const payload: EditDataType[] = map(omittedValues, (value, key) => {
        switch (true) {
          case includes(value, t('label.updated')): {
            return {}
          }
          case includes(key, 'new_'): {
            return { name: value, id: key, state: DataStateTypes.NEW }
          }
          case !isEqual(omittedValues[key], defaultValues[key]): {
            return { name: value, id: key, state: DataStateTypes.UPDATED }
          }
          case includes(map(prevDeletedValues, 'id'), key): {
            return { name: value, id: key, state: DataStateTypes.DELETED }
          }
          default: {
            return { name: value, id: key, state: DataStateTypes.OLD }
          }
        }
      })

      try {
        if (handleOnSubmit) {
          await handleOnSubmit(payload)
        }
        resetForm()
        closeModal()
      } catch (errorData) {
        const errorArray = isArray(errorData) ? errorData : [errorData]
        map(errorArray, (error) => {
          const typedErrorData = error as ValidationError
          if (typedErrorData.errors) {
            map(typedErrorData.errors, (errorsArray, key) => {
              const typedKey = key as FieldPath<FormValues>
              const tKey = split(typedKey, '.')[1]
              const errorString = join(errorsArray, ',')
              if (tKey) {
                const inputName = payload[toNumber(tKey)].id || `new_${tKey}`
                setError(
                  inputName,
                  { type: 'backend', message: errorString },
                  { shouldFocus: true }
                )
              }
            })
          }
          if (!isEmpty(error.values)) {
            const updatedNames = join(
              map(error.values, ({ value }) => {
                return value.data.name
              }),
              ', '
            )

            showNotification({
              type: NotificationTypes.Warning,
              title: t('notification.announcement'),
              content: t('success.department_changed', { name: updatedNames }),
            })
            map(error.values, ({ value, key }) => {
              const { data } = value
              const inputName = payload[toNumber(key)].id || `new_${key}`
              setValue(inputName, `${data.name}   ${t('label.updated')}`)
            })
          }
        })
      }
    },
    [
      defaultValues,
      prevDeletedValues,
      type,
      handleOnSubmit,
      resetForm,
      closeModal,
    ]
  )

  return (
    <ModalBase
      title={title}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      buttonsPosition={ButtonPositionTypes.Right}
      size={ModalSizeTypes.Narrow}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          children: t('button.cancel'),
          size: SizeTypes.M,
          onClick: () => {
            resetForm()
            closeModal()
          },
        },
        {
          appearance: AppearanceTypes.Primary,
          form: 'editableList',
          children: t('button.save'),
          loading: isSubmitting,
          type: 'submit',
          disabled: !isValid,
        },
      ]}
    >
      <DynamicForm
        formId="editableList"
        fields={inputFields}
        control={control}
        onSubmit={handleSubmit(onSubmit)}
      />
      <Button
        appearance={AppearanceTypes.Text}
        iconPositioning={IconPositioningTypes.Left}
        icon={Add}
        children={t('tag.add_new_row')}
        onClick={addInputField}
        hidden={!hasAddingPrivileges}
        form="editableList"
      />
    </ModalBase>
  )
}

export default EditableListModal
