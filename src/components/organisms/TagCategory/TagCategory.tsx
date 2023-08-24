import { filter, includes, map } from 'lodash'
import { FC, useCallback } from 'react'
import { Tag, TagTypes, TagsPayload } from 'types/tags'
import EditableListContainer from 'components/molecules/EditableListContainer/EditableListContainer'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import { useBulkUpdate } from 'hooks/requests/useTags'
import {
  DataStateTypes,
  EditDataType,
} from 'components/organisms/modals/EditableListModal/EditableListModal'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { t } from 'i18next'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import useValidators from 'hooks/useValidators'
import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'

type TagCategoryTypes = {
  tagsList?: Tag[]
  type: TagTypes
  isEditable: boolean
}

const TagCategory: FC<TagCategoryTypes> = ({ tagsList, type, isEditable }) => {
  const { updateTags } = useBulkUpdate({ type })
  const { tagInputValidator } = useValidators()
  const { userPrivileges } = useAuth()

  const handleOnSubmitTags = useCallback(
    async (values: EditDataType[]) => {
      const filteredData = filter(
        values,
        ({ state }) => !includes([DataStateTypes.DELETED], state)
      )

      const updatedData: Partial<Tag>[] = map(
        filteredData,
        ({ name, id, state }) => {
          return {
            name: name || '',
            id: !includes([DataStateTypes.NEW], state) ? id : '',
          }
        }
      )

      const payload: TagsPayload = {
        type,
        tags: updatedData,
      }

      await updateTags(payload)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.tag_updated'),
      })
    },
    [type, updateTags]
  )

  const handleCategoryEdit = () => {
    showModal(ModalTypes.EditableListModal, {
      editableData: tagsList,
      title: t('modal.edit_category_tag'),
      handleOnSubmit: handleOnSubmitTags,
      type,
      inputValidator: tagInputValidator,
      hasAddingPrivileges: includes(userPrivileges, Privileges.AddTag),
      hasDeletingPrivileges: includes(userPrivileges, Privileges.DeleteTag),
      hasEditPrivileges: includes(userPrivileges, Privileges.EditTag),
    })
  }

  return (
    <EditableListContainer
      title={type}
      data={tagsList}
      isEditable={isEditable}
      handleEditList={handleCategoryEdit}
    />
  )
}

export default TagCategory
