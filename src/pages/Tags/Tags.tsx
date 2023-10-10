import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Tooltip from 'components/organisms/Tooltip/Tooltip'
import Container from 'components/atoms/Container/Container'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { SubmitHandler, useForm } from 'react-hook-form'
import Button from 'components/molecules/Button/Button'
import { useFetchTags, useBulkCreate } from 'hooks/requests/useTags'
import {
  fromPairs,
  groupBy,
  includes,
  map,
  omit,
  sortBy,
  toPairs,
} from 'lodash'
import { Tag, TagTypes, TagsPayload } from 'types/tags'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import Loader from 'components/atoms/Loader/Loader'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'
import useValidators from 'hooks/useValidators'
import TagCategory from 'components/organisms/TagCategory/TagCategory'
import { showValidationErrorMessage } from 'api/errorHandler'

import classes from './classes.module.scss'

export type FormValues = {
  name: string
  type: TagTypes
}

const Tags: FC = () => {
  const { t } = useTranslation()
  const { tagInputValidator } = useValidators()
  const { userPrivileges } = useAuth()

  const { tags, isLoading: isFetchingTags } = useFetchTags()
  const { createTags, isLoading: isCreatingTags } = useBulkCreate()

  const groupedData = groupBy(tags, 'type')

  const sortedData = fromPairs(sortBy(toPairs(groupedData), 0))

  const tagCategoryOptions = map(omit(TagTypes, 'Skills'), (type) => {
    return {
      label: t(`tag.type.${type}`),
      value: type || '',
    }
  })

  const {
    control,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<FormValues>({
    reValidateMode: 'onSubmit',
  })

  const tagFields: FieldProps<FormValues>[] = [
    {
      inputType: InputTypes.Text,
      ariaLabel: t('tag.tag_name'),
      label: `${t('label.tag_name')}*`,
      name: 'name',
      placeholder: t('tag.tag_input'),
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
      name: 'type',
      ariaLabel: t('tag.select_tag_category'),
      options: tagCategoryOptions,
      placeholder: t('tag.select_tag_category'),
      rules: {
        required: true,
      },
      className: classes.tagInputField,
      disabled: !includes(userPrivileges, Privileges.AddTag),
    },
  ]

  const onTagsSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const { name, type } = values

      const payload: TagsPayload = {
        tags: [{ name, type }],
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

  const isEditable = (type: TagTypes) => {
    if (type === TagTypes.Skills) {
      return false
    }
    return (
      includes(userPrivileges, Privileges.DeleteTag) ||
      includes(userPrivileges, Privileges.AddTag) ||
      includes(userPrivileges, Privileges.EditTag)
    )
  }

  if (isFetchingTags) {
    return <Loader loading />
  }

  return (
    <>
      <div className={classes.tagsHeader}>
        <h1>{t('tag.tag_management')}</h1>
        <Tooltip helpSectionKey="tags" />
      </div>
      <Container className={classes.tagsContainer}>
        <div>
          <h4 className={classes.addingTag}>{t('tag.adding_tag')}</h4>
          <p>{t('tag.naming_tag')}</p>
        </div>

        <div className={classes.tagsSection}>
          <DynamicForm fields={tagFields} control={control} />
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
            disabled={!isDirty}
            hidden={!includes(userPrivileges, Privileges.AddTag)}
          />
        </div>
      </Container>
      <div className={classes.categoryContainer}>
        {map(sortedData, (tagsList: Tag[], type: TagTypes) => (
          <TagCategory
            key={type}
            tagsList={tagsList}
            type={type}
            isEditable={isEditable(type)}
          />
        ))}
      </div>
    </>
  )
}

export default Tags
