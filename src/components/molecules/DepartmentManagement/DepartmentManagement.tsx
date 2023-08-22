import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useDepartmentsFetch,
  useParallelMutationDepartment,
} from 'hooks/requests/useDepartments'

import EditableListContainer from 'components/molecules/EditableListContainer/EditableListContainer'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import {
  DataStateTypes,
  EditDataType,
} from 'components/organisms/modals/EditableListModal/EditableListModal'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { filter, includes, isEmpty } from 'lodash'

import useAuth from 'hooks/useAuth'
import { Privileges } from 'types/privileges'

const DepartmentManagement: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { existingDepartments } = useDepartmentsFetch()
  const { parallelUpdating } = useParallelMutationDepartment()

  const handleOnSubmit = useCallback(
    async (values: EditDataType[]) => {
      const filteredPayload = filter(
        values,
        ({ state }) => state !== DataStateTypes.OLD
      )

      if (!isEmpty(filteredPayload)) {
        await parallelUpdating(values)
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.department_updated'),
        })
      }
    },
    [parallelUpdating, t]
  )

  const handleEditDepartmentsModal = () => {
    showModal(ModalTypes.EditableListModal, {
      editableData: existingDepartments,
      title: t('modal.edit_departments'),
      handleOnSubmit: handleOnSubmit,
      hasAddingPrivileges: includes(userPrivileges, Privileges.AddDepartment),
      hasDeletingPrivileges: includes(
        userPrivileges,
        Privileges.DeleteDepartment
      ),
    })
  }

  return (
    <EditableListContainer
      title={t('cheat_sheet.institution_management.departments')}
      data={existingDepartments}
      isEditable={includes(userPrivileges, Privileges.EditDepartment)}
      handleEditList={handleEditDepartmentsModal}
    />
  )
}

export default DepartmentManagement
