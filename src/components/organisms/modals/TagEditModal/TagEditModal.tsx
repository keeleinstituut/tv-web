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
  compact,
  filter,
  includes,
  isEmpty,
  isEqual,
  map,
  reduce,
  size,
} from 'lodash'
import { SubmitHandler, useForm } from 'react-hook-form'
import { ReactComponent as Add } from 'assets/icons/add.svg'
import { TagTypes } from 'types/tags'
import useAuth from 'hooks/useAuth'
import classes from './classes.module.scss'
import { Privileges } from 'types/privileges'
import { showValidationErrorMessage } from 'api/errorHandler'
import useValidators from 'hooks/useValidators'

export interface TagEditModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  editableData?: EditTagType[]
  title?: string
  type?: TagTypes
  isLoading?: boolean
  // handelOnSubmitData: () => void
  handleCreateData?: (values: PayloadType[]) => void
  handleUpdateData?: (values: PayloadType[]) => void
  handleDeleteData?: (values: PayloadType[]) => void
}
export type EditTagType = {
  id?: string
  name?: string
}

type EditableDataType = object & {
  [key in string]?: string
}

type FormValues = EditableDataType
export interface PayloadType {
  type?: TagTypes
  name?: string
  id?: string
}

const TagEditModal: FC<TagEditModalProps> = ({
  isModalOpen,
  closeModal,
  editableData,
  title,
  type,
  handleCreateData,
  handleUpdateData,
  handleDeleteData,
  isLoading,
}) => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { tagInputValidator } = useValidators()

  const defaultValues: EditableDataType = useMemo(
    () =>
      reduce(
        editableData,
        (result, value, key) => {
          if (!value.id) {
            return result
          }
          return {
            ...(key > 0 && result),
            [value.id]: value.name,
          }
        },
        {}
      ),

    [editableData]
  )

  const { control, handleSubmit, reset } = useForm<FormValues>({
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
        validate: tagInputValidator,
      },
      className: classes.editTagInput,
      handleDelete: () => handelOnDelete(name, id),
    })
  )

  const [inputFields, setInputFields] =
    useState<FieldProps<FormValues>[]>(editableFields)

  const [deletedValues, setDeletedValues] = useState<EditTagType[]>([])

  const addInputField = () =>
    setInputFields([
      ...inputFields,
      {
        inputType: InputTypes.Text,
        ariaLabel: t('tag.tag_name'),
        name: `new_${size(inputFields)}` || '',
        type: 'text',
        rules: {
          validate: tagInputValidator,
        },
        className: classes.editTagInput,
        handleDelete: () => handelOnDelete(`new_${size(inputFields)}`),
      },
    ])

  const handelOnDelete = (name?: string, id?: string) => {
    setDeletedValues((deletedValues) => [...deletedValues, { name, id }])
  }

  useEffect(() => {
    const deleteFiled = filter(inputFields, (field) => {
      const values = map(deletedValues, ({ name }) => name)
      const name = !field?.label ? field?.name : field?.label
      return !includes(values, name)
    })
    setInputFields(deleteFiled)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deletedValues])

  const resetForm = useCallback(() => {
    reset(defaultValues)
    setInputFields(editableFields)
    setDeletedValues([])
  }, [defaultValues, editableFields, reset])

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const updateValues: PayloadType[] = compact(
        map(values, (value, key) => {
          if (
            !isEqual(values[key], defaultValues[key]) &&
            !includes(key, 'new_')
          ) {
            return {
              ...(type ? { type } : {}),
              id: key,
              name: value,
            }
          }
        })
      )

      console.log('update', updateValues)

      const createNewValues: PayloadType[] = compact(
        map(values, (value, key?: string) => {
          if (includes(key, 'new_')) {
            return {
              ...(type ? { type } : {}),
              name: value,
            }
          }
        })
      )

      console.log('new', createNewValues)

      const deleteValues: PayloadType[] = compact(
        map(values, (value, key?: string) => {
          if (includes(key, 'delete_')) {
            return {
              ...(type ? { type } : {}),
              name: value,
              id: key,
            }
          }
        })
      )
      console.log('delete', deleteValues)

      try {
        // handelOnSubmitData({ deleteValues, createNewValues, updateValues })
        // if (handleCreateData && !isEmpty(createNewValues)) {
        //   handleCreateData(createNewValues)
        // }
        // if (handleUpdateData && !isEmpty(updateValues)) {
        //   handleUpdateData(updateValues)
        // }
        // if (handleDeleteData && !isEmpty(deleteValues)) {
        //   handleDeleteData(deleteValues)
        // }
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      } finally {
        resetForm()
        closeModal()
      }
    },
    [
      defaultValues,
      type,
      handleCreateData,
      handleUpdateData,
      handleDeleteData,
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

export default TagEditModal
