import { FC, useCallback } from 'react'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import {
  useCreateDepartment,
  useDepartmentsFetch,
} from 'hooks/requests/useDepartments'

import EditableListContainer, {
  ListDataType,
} from 'components/molecules/EditableListContainer/EditableListContainer'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import {
  DataStateTypes,
  EditDataType,
} from 'components/organisms/modals/EditableListModal/EditableListModal'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { showValidationErrorMessage } from 'api/errorHandler'
import { NotificationTypes } from '../Notification/Notification'
import { filter, groupBy, includes, map } from 'lodash'
import { DepartmentType } from 'types/departments'

const DepartmentManagement: FC = () => {
  const { t } = useTranslation()
  const { existingDepartments, isLoading } = useDepartmentsFetch()
  const { createDepartment, isLoading: isCreating } = useCreateDepartment()

  // const editableDepartments: ListDataType[] = existingDepartments

  // map(
  //   existingDepartments,
  //   ({ name, id }) => {
  //     return { name: , id }
  //   }
  // )

  console.log(existingDepartments)

  const handelOnSubmit = useCallback(async (values: EditDataType[]) => {
    console.log('values', values)
    const groupedValues = groupBy(values, 'state')
    console.log(groupedValues)
    // const { errors, successes } = map(groupedValues, (value, key) => {
    //   if (includes([DataStateTypes.DELETED], key)) {

    //   }
    // })
    // //   const filteredNewData = filter(values, ({ state }) =>
    //     includes([DataStateTypes.NEW], state)
    //   )
    //   // const updatedData: TagsUpdateType[] = map(
    //   //   filteredData,
    //   //   ({ name, id, state }) => {
    //   //     return {
    //   //       name: name || '',
    //   //       id: !includes([DataStateTypes.NEW], state) ? id : '',
    //   //     }
    //   //   }
    //   // )
    //   const = map(filteredNewData, ({ name }) => {
    //     return { name: name || '' }
    //   })
    //   const newValue = { name: filteredNewData[0].name || '' }
    //   //console.log('new', newValues)
    //   // const payload: TagsUpdatePayloadType = {
    //   //   type: values[0].type,
    //   //   tags: updatedData,
    //   // }
    try {
      // await createDepartment(newValue)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.tag_updated'),
      })
    } catch (errorData) {
      showValidationErrorMessage(errorData)
    }
  }, [])

  const handleEditDepartmentsModal = () => {
    showModal(ModalTypes.EditableListModal, {
      editableData: existingDepartments,
      title: t('modal.edit_departments'),
      handelOnSubmit: handelOnSubmit,
      //isLoading: isUpdatingTags,
      //inputValidator: tagInputValidator,
    })
  }

  return (
    <EditableListContainer
      title={t('cheat_sheet.institution_management.departments')}
      data={existingDepartments}
      isEditable={true}
      handelEditList={handleEditDepartmentsModal}
    />
  )
}

export default DepartmentManagement
