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
import { filter, flatMap, isEmpty, map } from 'lodash'
import { SubmitHandler, useForm } from 'react-hook-form'
import { ReactComponent as Add } from 'assets/icons/add.svg'
import { TagsType, TagsUpdateType } from 'types/tags'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { useBulkCreate, useBulkUpdate } from 'hooks/requests/useTags'
import {
  EditTagType,
  FormValues,
} from 'components/organisms/TagCategories/TagCategories'

import classes from './classes.module.scss'

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
  const { createTags } = useBulkCreate()
  const { updateTags, isLoading: isUpdatingTags } = useBulkUpdate()

  const defaultValues = useMemo(
    () => ({
      tags: map(categoryData, ({ id, name }) => ({ id, name })),
    }),
    [categoryData]
  )

  const { control, handleSubmit } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
    defaultValues: defaultValues,
  })

  // const editTagFields: FieldProps<FormValues>[] = map(
  //   categoryData,
  //   (tag, index) => {
  //     return {
  //       inputType: InputTypes.Text,
  //       ariaLabel: tag.name || '',
  //       label: tag.name || '',
  //       name: `tags.${index}.name`,
  //       className: classes.editTagInput,
  //     }
  //   }
  // )

  const editTagFields: FieldProps<FormValues>[] = useMemo(() => {
    return map(categoryData, (tag, index) => ({
      inputType: InputTypes.Text,
      ariaLabel: tag.name || '',
      label: tag.name || '',
      name: `tags.${index}.name`,
      className: classes.editTagInput,
    }))
  }, [categoryData, category])

  console.log('categoryData', categoryData)
  console.log('category', category)
  console.log('editTagFields', editTagFields)

  const [tagInputFields, setTagInputFields] =
    useState<FieldProps<FormValues>[]>(editTagFields)

  console.log('tagInputFields', tagInputFields)

  useEffect(() => {
    setTagInputFields(editTagFields)
    console.log('bu!!!!!!!!')
  }, [category, editTagFields])

  const addInputField = () => {
    setTagInputFields([
      ...tagInputFields,
      {
        inputType: InputTypes.Text,
        ariaLabel: t('tag.tag_name'),
        name: `tags.${tagInputFields.length}.name`,
        type: 'text',
        className: classes.editTagInput,
      },
    ])
  }

  const onTagsEditSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const { tags } = values

      const filteredData = filter(tags, (item) => !item.hasOwnProperty('id'))

      const transformedObject = flatMap(filteredData, (tagInputValue) => {
        return {
          type: category,
          name: tagInputValue.name,
        }
      })

      const tagInputPayload: TagsType = {
        tags: transformedObject,
      }

      const tagsUpdatePayload: TagsUpdateType = {
        type: category,
        ...values,
      }

      if (!isEmpty(transformedObject)) {
        try {
          await createTags(tagInputPayload)

          showNotification({
            type: NotificationTypes.Success,
            title: t('notification.announcement'),
            content: 'Taginput created!',
          })
        } catch (errorData) {}
      }

      try {
        await updateTags(tagsUpdatePayload)

        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.tag_updated'),
        })
      } catch (errorData) {}
    },
    [category, createTags, updateTags, t]
  )

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
          onClick: closeModal,
        },
        {
          appearance: AppearanceTypes.Primary,
          onClick: () => {
            handleSubmit(onTagsEditSubmit)()
            closeModal()
          },
          children: t('button.save'),
          loading: isUpdatingTags,
        },
      ]}
    >
      {/* <div>
        {map(categoryData, (test) => {
          return <p>{test.name}</p>
        })}
      </div> */}
      <DynamicForm fields={tagInputFields} control={control} />
      <Button
        appearance={AppearanceTypes.Text}
        iconPositioning={IconPositioningTypes.Left}
        icon={Add}
        children={t('tag.add_new_row')}
        onClick={addInputField}
        // hidden={!includes(userPrivileges, Privileges.AddTag)}
      />
    </ModalBase>
  )
}

export default TagEditModal
