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
import { includes, map } from 'lodash'
import { SubmitHandler, useForm } from 'react-hook-form'
import { ReactComponent as Add } from 'assets/icons/add.svg'
import { TagsUpdateType } from 'types/tags'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useBulkUpdate } from 'hooks/requests/useTags'
import {
  EditTagType,
  FormValues,
} from 'components/organisms/TagCategories/TagCategories'
import useAuth from 'hooks/useAuth'

import classes from './classes.module.scss'
import { Privileges } from 'types/privileges'
import { showValidationErrorMessage } from 'api/errorHandler'
import useValidators from 'hooks/useValidators'

export interface TagEditModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  categoryData?: EditTagType[]
  category?: string
}

const TagEditModal: FC<TagEditModalProps> = ({
  isModalOpen,
  closeModal,
  categoryData,
  category,
}) => {
  const { t } = useTranslation()
  const { updateTags, isLoading: isUpdatingTags } = useBulkUpdate()
  const { userPrivileges } = useAuth()
  const { tagInputValidator } = useValidators()

  const defaultValues = useMemo(
    () => ({
      tags: map(categoryData, ({ id, name }) => ({ id, name })),
    }),
    [categoryData]
  )

  const { control, handleSubmit, reset } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    defaultValues: defaultValues,
  })

  const editTagFields: FieldProps<FormValues>[] = useMemo(() => {
    return map(categoryData, (tag, index) => ({
      inputType: InputTypes.Text,
      ariaLabel: tag.name || '',
      label: tag.name || '',
      name: `tags.${index}.name`,
      rules: {
        validate: tagInputValidator,
      },
      className: classes.editTagInput,
    }))
  }, [categoryData, tagInputValidator])

  const [tagInputFields, setTagInputFields] =
    useState<FieldProps<FormValues>[]>(editTagFields)

  useEffect(() => {
    setTagInputFields(tagInputFields)
  }, [category, tagInputFields])

  const addInputField = () => {
    setTagInputFields([
      ...tagInputFields,
      {
        inputType: InputTypes.Text,
        ariaLabel: t('tag.tag_name'),
        name: `tags.${tagInputFields.length}.name`,
        type: 'text',
        rules: {
          validate: tagInputValidator,
        },
        className: classes.editTagInput,
      },
    ])
  }

  const onTagsEditSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const tagsUpdatePayload: TagsUpdateType = {
        type: category,
        ...values,
      }

      try {
        await updateTags(tagsUpdatePayload)

        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.tag_updated'),
        })
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [category, updateTags, t]
  )

  const resetForm = useCallback(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  useEffect(() => {
    resetForm()
  }, [defaultValues, resetForm])

  return (
    <ModalBase
      title={t('modal.edit_category_tag')}
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
          onClick: () => {
            handleSubmit(onTagsEditSubmit)()
            resetForm()
            closeModal()
          },
          children: t('button.save'),
          loading: isUpdatingTags,
        },
      ]}
    >
      <DynamicForm fields={tagInputFields} control={control} />
      <Button
        appearance={AppearanceTypes.Text}
        iconPositioning={IconPositioningTypes.Left}
        icon={Add}
        children={t('tag.add_new_row')}
        onClick={addInputField}
        hidden={!includes(userPrivileges, Privileges.AddTag)}
      />
    </ModalBase>
  )
}

export default TagEditModal
