import { filter, groupBy, map, omit } from 'lodash'
import { FC, useCallback } from 'react'
import { TagFields, TagTypes, TagsPayload } from 'types/tags'
import EditableListContainer, {
  ListDataType,
} from 'components/molecules/EditableListContainer/EditableListContainer'

import classes from './classes.module.scss'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import { useBulkCreate, useBulkUpdate } from 'hooks/requests/useTags'
import { PayloadType } from '../modals/TagEditModal/TagEditModal'
import { showValidationErrorMessage } from 'api/errorHandler'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { t } from 'i18next'
import { showNotification } from '../NotificationRoot/NotificationRoot'

type TagCategoriesTypes = {
  tags?: TagFields[]
}

const TagCategories: FC<TagCategoriesTypes> = ({ tags }) => {
  const groupedCategoryData = groupBy(tags, 'type')
  const { updateTags, isLoading: isUpdatingTags } = useBulkUpdate()
  const { createTags, isLoading: isCreatingTags } = useBulkCreate()

  const handleCreateTags = useCallback(
    (values: PayloadType[]) => {
      const payload: TagsPayload = {
        tags: values,
      }

      // try {
      createTags(payload)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.tag_added'),
      })
      // } catch (errorData) {
      //   showValidationErrorMessage(errorData)
      // }
    },
    [createTags]
  )
  const handleUpdateTags = useCallback(
    (values: PayloadType[]) => {
      const payload: TagsPayload = {
        type: values[0].type,
        tags: map(values, (value) => omit(value, 'type')),
      }
      // try {
      updateTags(payload)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.tag_updated'),
      })
      // } catch (errorData) {
      //   showValidationErrorMessage(errorData)
      // }
    },
    [updateTags]
  )

  return (
    <div className={classes.categoryContainer}>
      {map(groupedCategoryData, (tagsList: ListDataType[], type: TagTypes) => {
        const handleCategoryEdit = () => {
          showModal(ModalTypes.TagEditModal, {
            editableData: tagsList,
            title: t('modal.edit_category_tag'),
            handleCreateData: handleCreateTags,
            handleUpdateData: handleUpdateTags,
            // handleDeleteData,
            type,
            isLoading: isCreatingTags,
          })
        }

        return (
          <EditableListContainer
            key={type}
            title={type}
            data={tagsList}
            isEditable={type === TagTypes.Oskused}
            handelEditList={handleCategoryEdit}
          />
        )
      })}
    </div>
  )
}

export default TagCategories
