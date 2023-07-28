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
import { SubmitHandler, useForm } from 'react-hook-form'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { useFetchTags } from 'hooks/requests/useTags'
import { useBulkCreate } from 'hooks/requests/useTags'
import { filter, flatMap, groupBy, includes, map, uniqBy } from 'lodash'
import { ReactComponent as EditIcon } from 'assets/icons/edit.svg'
import { TagsType } from 'types/tags'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import Loader from 'components/atoms/Loader/Loader'
import { v4 as uuidv4 } from 'uuid'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'
import useValidators from 'hooks/useValidators'
import { showValidationErrorMessage } from 'api/errorHandler'

import classes from './classes.module.scss'

export interface ObjectType {
  [key: string]: string
}

export type FormValues = {
  tagInput?: ObjectType
  tagCategorySelection?: string
}

const Tags: FC = () => {
  const { t } = useTranslation()
  const { tagInputValidator } = useValidators()
  const { userPrivileges } = useAuth()

  const { tags, isLoading: isFetchingTags } = useFetchTags()
  const { createTags, isLoading: isCreatingTags } = useBulkCreate()

  const tagCategoryOptions = map(tags, ({ type }) => {
    return {
      label: type || '',
      value: type || '',
    }
  })

  const uniqueTagCategoryOptions = uniqBy(tagCategoryOptions, 'label')

  const updatedDataWithoutSkillsObject = filter(
    uniqueTagCategoryOptions,
    (categoryObjects) => categoryObjects.label !== 'Oskused'
  )

  const {
    control,
    handleSubmit,
    formState: { dirtyFields },
    reset,
  } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
  })

  const tagFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Text,
      ariaLabel: t('tag.tag_name'),
      label: 'Nimetus',
      name: `tagInput.${uuidv4()}`,
      placeholder: t('tag.tag_input'),
      type: 'text',
      rules: {
        required: true,
        validate: tagInputValidator,
      },
      className: classes.tagInputField,
      disabled: !includes(userPrivileges, Privileges.AddTag),
    },
  ]

  const categoryFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Selections,
      name: 'tagCategorySelection',
      ariaLabel: t('tag.select_tag_category'),
      options: updatedDataWithoutSkillsObject,
      placeholder: t('tag.select_tag_category'),
      multiple: true,
      rules: {
        required: true,
      },
      buttons: true,
      disabled: !includes(userPrivileges, Privileges.AddTag),
    },
  ]

  const [inputFields, setInputFields] = useState(tagFields)

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
        rules: {
          required: true,
          validate: tagInputValidator,
        },
        className: classes.tagInputField,
      },
    ])
  }

  const onTagsSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const { tagCategorySelection, tagInput } = values
      const transformedObject = flatMap(tagInput, (tagInputValue) =>
        map(tagCategorySelection, (tagCategoryValue) => {
          return {
            type: tagCategoryValue,
            name: tagInputValue,
          }
        })
      )
      const payload: TagsType = {
        tags: transformedObject,
      }

      try {
        await createTags(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.tag_added'),
        })
        reset()
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [createTags, reset, t]
  )

  const groupedCategoryData = groupBy(tags, 'type')
  const uniqueCategoryTypes = Object.keys(groupedCategoryData)

  const areInputFieldsDirty = !!(
    dirtyFields.tagCategorySelection && dirtyFields.tagInput
  )

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
            hidden={!includes(userPrivileges, Privileges.AddTag)}
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
            disabled={!areInputFieldsDirty}
            hidden={!includes(userPrivileges, Privileges.AddTag)}
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
                hidden={type === t('tag.skills_tag')}
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
