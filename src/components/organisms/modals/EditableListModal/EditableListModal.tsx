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
  isEqual,
  join,
  map,
  reduce,
  size,
  split,
  toNumber,
} from 'lodash'
import { FieldPath, SubmitHandler, useForm } from 'react-hook-form'
import { ReactComponent as Add } from 'assets/icons/add.svg'
import { TagTypes } from 'types/tags'
import useAuth from 'hooks/useAuth'
import classes from './classes.module.scss'
import { Privileges } from 'types/privileges'
import { ValidationError } from 'api/errorHandler'

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
  isLoading?: boolean
  handleOnSubmit?: (values: EditDataType[]) => void
  inputValidator?: (value?: string | undefined) => string | true
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
  isLoading,
  inputValidator,
}) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()

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

  const { control, handleSubmit, reset, setError } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    values: defaultValues,
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
      className: classes.editTagInput,
      ...(includes(userPrivileges, Privileges.DeleteTag)
        ? { handleDelete: () => handleOnDelete(name, id) }
        : {}),
    })
  )

  const [inputFields, setInputFields] =
    useState<FieldProps<FormValues>[]>(editableFields)

  const [prevDeletedValues, setPrevDeletedValues] = useState<EditDataType[]>([])

  const addInputField = () =>
    setInputFields([
      ...inputFields,
      {
        inputType: InputTypes.Text,
        ariaLabel: t('tag.tag_name'),
        name: `new_${size(inputFields)}` || '',
        type: 'text',
        rules: {
          validate: inputValidator,
        },
        className: classes.editTagInput,
        ...(includes(userPrivileges, Privileges.DeleteTag)
          ? { handleDelete: () => handleOnDelete(`new_${size(inputFields)}`) }
          : {}),
      },
    ])

  const handleOnDelete = (name?: string, id?: string) => {
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
      const payload: EditDataType[] = map(values, (value, key) => {
        switch (true) {
          case includes(key, 'new_'): {
            return { name: value, id: key, state: DataStateTypes.NEW }
          }
          case !isEqual(values[key], defaultValues[key]): {
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
        const typedErrorData = errorData as ValidationError
        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            const typedKey = key as FieldPath<FormValues>
            const tKey = split(typedKey, '.')[1]
            const errorString = join(errorsArray, ',')
            if (tKey) {
              const inputName = payload[toNumber(tKey)].id || `new_${tKey}`
              setError(inputName, { type: 'backend', message: errorString })
            }
          })
        }
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
          loading: isLoading,
          type: 'submit',
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
        hidden={!includes(userPrivileges, Privileges.AddTag)}
        form="editableList"
      />
    </ModalBase>
  )
}

export default EditableListModal
