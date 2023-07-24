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
import { SubmitHandler, useForm, useWatch } from 'react-hook-form'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { useFetchTags } from 'hooks/requests/useTags'
import { useBulkCreate } from 'hooks/requests/useTags'
import { flatMap, groupBy, map, uniqBy } from 'lodash'
import { ReactComponent as EditIcon } from 'assets/icons/edit.svg'
import { TagsType } from 'types/tags'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import Loader from 'components/atoms/Loader/Loader'
import { v4 as uuidv4 } from 'uuid'

import classes from './classes.module.scss'

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
      name: `tagInput.${uuidv4()}`,
      placeholder: t('tag.tag_input'),
      type: 'text',
      // rules: {
      //   required: true,
      // },
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
      // rules: {
      //   required: true,
      // },
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
        name: `tagInput.${uuidv4()}`,
        placeholder: t('tag.tag_input'),
        type: 'text',
        // rules: {
        //   required: true,
        // },
        className: classes.tagInputField,
      },
    ])
  }

  const onTagsSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      console.log('values', values)

      const { tagCategorySelection, tagInput } = values

      const transformedObject = flatMap(tagInput, (tagInputValue) => {
        return map(tagCategorySelection, (tagCategoryValue) => {
          return {
            type: tagCategoryValue,
            name: tagInputValue,
          }
        })
      })

      console.log('transformedObject', transformedObject)

      const transformedObject2 = [
        {
          type: 'Tellimus',
          name: 'Tag1',
        },
      ]

      const payload: TagsType = {
        tags: transformedObject2,
      }

      try {
        await createTags(payload)

        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.user_activated'),
        })
      } catch (errorData) {}
    },
    [createTags, t]
  )

  const formValue = useWatch({ control })
  console.log('formValue', formValue)

  const groupedCategoryData = groupBy(tags, 'type')
  const uniqueCategoryTypes = Object.keys(groupedCategoryData)

  if (isFetchingTags) {
    return <Loader loading />
  }

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
            loading={isCreatingTags}
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
