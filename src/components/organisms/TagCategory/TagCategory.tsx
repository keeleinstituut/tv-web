import { filter, includes, map } from 'lodash'
import { FC, useCallback } from 'react'
import { TagTypes, TagsUpdatePayloadType, TagsUpdateType } from 'types/tags'
import EditableListContainer, {
  ListDataType,
} from 'components/molecules/EditableListContainer/EditableListContainer'

import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import { useBulkUpdate } from 'hooks/requests/useTags'
import {
  DataStateTypes,
  PayloadType,
} from 'components/organisms/modals/TagEditModal/TagEditModal'
import { showValidationErrorMessage } from 'api/errorHandler'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { t } from 'i18next'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'

type TagCategoryTypes = {
  tagsList?: ListDataType[]
  type: TagTypes
}

const TagCategory: FC<TagCategoryTypes> = ({ tagsList, type }) => {
  const { updateTags, isLoading: isUpdatingTags } = useBulkUpdate({
    type: type,
  })

  const handelOnSubmitTags = useCallback(
    async (values: PayloadType[]) => {
      const filteredData = filter(
        values,
        ({ state }) => !includes([DataStateTypes.DELETED], state)
      )

      const updatedData: TagsUpdateType[] = map(
        filteredData,
        ({ name, id, state }) => {
          return {
            name: name || '',
            id: !includes([DataStateTypes.NEW], state) ? id : '',
          }
        }
      )

      const payload: TagsUpdatePayloadType = {
        type: values[0].type,
        tags: updatedData,
      }

      try {
        await updateTags(payload)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.tag_updated'),
        })
      } catch (errorData) {
        showValidationErrorMessage(errorData)
      }
    },
    [updateTags]
  )

  const handleCategoryEdit = () => {
    showModal(ModalTypes.TagEditModal, {
      editableData: tagsList,
      title: t('modal.edit_category_tag'),
      handelOnSubmit: handelOnSubmitTags,
      type,
      isLoading: isUpdatingTags,
    })
  }

  return (
    <EditableListContainer
      title={type}
      data={tagsList}
      isEditable={type === TagTypes.Oskused}
      handelEditList={handleCategoryEdit}
    />
  )
}

export default TagCategory
