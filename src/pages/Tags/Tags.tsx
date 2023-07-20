import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import TagsCheatSheet from 'components/molecules/cheatSheets/TagManagementCheatSheet'
import Container from 'components/atoms/Container/Container'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { ReactComponent as Add } from 'assets/icons/add.svg'
import { FieldPath, SubmitHandler, useForm, useWatch } from 'react-hook-form'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { useFetchTags } from 'hooks/requests/useTags'
import { useBulkCreate } from 'hooks/requests/useTags'
import { flatMap, groupBy, join, map, uniqBy } from 'lodash'
import { ReactComponent as EditIcon } from 'assets/icons/edit.svg'

import classes from './classes.module.scss'
import { TagsDataType } from 'types/tags'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { ValidationError } from 'api/errorHandler'

interface ObjectType {
  [key: string]: string
}

type FormValues = {
  tagInput?: ObjectType
  tagCategorySelection?: string
}

const Tags: FC = () => {
  const { t } = useTranslation()
  const { control, handleSubmit } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
  })
  const { tags, isLoading: isFetchingTags } = useFetchTags()
  const { createTags, isLoading: isCreatingTags } = useBulkCreate()

  console.log('tags', tags)

  const tagCategoryOptions = map(tags, ({ type }) => {
    return {
      label: type || '',
      value: type || '',
    }
  })

  const uniqueTagCategoryOptions = uniqBy(tagCategoryOptions, 'label')

  const tagFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Text,
      ariaLabel: t('tag.tag_name'),
      label: 'Nimetus',
      name: `tagInput.${1}`,
      placeholder: t('tag.tag_input'),
      type: 'text',
      rules: {
        required: true,
      },
      className: classes.tagInputField,
    },
  ]

  const categoryFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Selections,
      name: 'tagCategorySelection',
      ariaLabel: t('tag.select_tag_category'),
      options: uniqueTagCategoryOptions,
      placeholder: t('tag.select_tag_category'),
      multiple: true,
      rules: {
        required: true,
      },
      buttons: true,
    },
  ]

  const [inputFields, setInputFields] = useState(tagFields)

  console.log('inputFields state', inputFields)

  const addInputField = () => {
    setInputFields([
      ...inputFields,
      {
        inputType: InputTypes.Text,
        ariaLabel: t('tag.tag_name'),
        label: 'Nimetus',
        name: `tagInput.${inputFields?.length + 1}`,
        placeholder: t('tag.tag_input'),
        type: 'text',
        rules: {
          required: true,
        },
        className: classes.tagInputField,
      },
    ])
  }

  const onTagsSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      console.log('values', values)

      const { tagCategorySelection, tagInput } = values

      // const type = tagCategorySelection
      // const name = tagInput

      // const { data: values } = oldData || {}

      const transformedObject = flatMap(tagInput, (tagInputValue) => {
        return map(tagCategorySelection, (tagCategoryValue) => {
          return {
            type: tagCategoryValue,
            name: tagInputValue,
          }
        })
      })

      const transformedObject2 = [
        {
          type: 'Oskused',
          name: 'Tag1',
        },
        {
          type: 'Oskused',
          name: 'Tag2',
        },
      ]

      console.log('transformedObject', transformedObject)

      const payload: TagsDataType = {
        // ...transformedObject,
        data: transformedObject2,
      }

      console.log('payload onTagsSubmit', payload)

      try {
        await createTags(payload)

        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.user_activated'),
        })
      } catch (errorData) {
        const typedErrorData = errorData as ValidationError
        if (typedErrorData.errors) {
          map(typedErrorData.errors, (errorsArray, key) => {
            const typedKey = key as FieldPath<FormValues>
            const errorString = join(errorsArray, ',')
            setError(typedKey, { type: 'backend', message: errorString })
          })
        }
      }
    },
    [createTags, t]
  )

  const formValue = useWatch({ control })
  console.log('formValue', formValue)

  const groupedCategoryData = groupBy(tags, 'type')
  const uniqueCategoryTypes = Object.keys(groupedCategoryData)

  console.log('groupedData', groupedCategoryData)
  console.log('uniqueTypes', uniqueCategoryTypes)

  return (
    <>
      <div className={classes.tagsHeader}>
        <h1>{t('tag.tag_management')}</h1>
        <Tooltip
          title={t('cheat_sheet.user_management.title')}
          modalContent={<TagsCheatSheet />}
        />
      </div>
      <Container className={classes.tagsContainer}>
        <div>
          <h4 className={classes.addingTag}>{t('tag.adding_tag')}</h4>
          <p>{t('tag.naming_tag')}</p>
        </div>

        <div className={classes.addingTagsSeparator} />

        <div className={classes.tagsSection}>
          <DynamicForm fields={inputFields} control={control} />
          <Button
            appearance={AppearanceTypes.Text}
            iconPositioning={IconPositioningTypes.Left}
            icon={Add}
            className={classes.addNewRow}
            children={t('tag.add_new_row')}
            onClick={addInputField}
          />
        </div>

        <div className={classes.categorySection}>
          <DynamicForm fields={categoryFields} control={control} />
          <Button
            children={t('button.add')}
            type="submit"
            ariaLabel={t('button.add')}
            className={classes.addButton}
            onClick={handleSubmit(onTagsSubmit)}
          />
        </div>
      </Container>

      <div className={classes.categoryContainer}>
        {map(uniqueCategoryTypes, (type) => (
          <Container key={type} className={classes.category}>
            <span className={classes.tagCategoryNameContainer}>
              <div className={classes.categoryName}>{type}</div>
              <Button
                appearance={AppearanceTypes.Text}
                icon={EditIcon}
                className={classes.editIcon}
              >
                <span className={classes.tagName}>{t('button.change')}</span>
              </Button>
            </span>

            <div className={classes.tagCategorySeparator} />
            <ul>
              {map(groupedCategoryData[type], (tag) => (
                <li className={classes.tagName} key={tag?.id}>
                  {tag?.name}
                </li>
              ))}
            </ul>
          </Container>
        ))}
      </div>
    </>
  )
}

export default Tags
function setError(typedKey: string, arg1: { type: string; message: string }) {
  throw new Error('Function not implemented.')
}
