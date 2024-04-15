import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useDepartmentsFetch,
  useParallelMutationDepartment,
} from 'hooks/requests/useDepartments'

import EditableListContainer from 'components/molecules/EditableListContainer/EditableListContainer'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import { EditDataType } from 'components/organisms/modals/EditableListModal/EditableListModal'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { includes, intersection, isEmpty } from 'lodash'

import { useAuth } from 'components/contexts/AuthContext'
import { Privileges } from 'types/privileges'

const DepartmentManagement: FC = () => {
  const { t } = useTranslation()
  const { userPrivileges } = useAuth()
  const { existingDepartments } = useDepartmentsFetch()
  const { parallelUpdating } = useParallelMutationDepartment()

  const handleOnSubmit = useCallback(
    async (values: EditDataType[]) => {
      await parallelUpdating(values)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('success.department_updated'),
      })
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
      hasEditPrivileges: includes(userPrivileges, Privileges.EditDepartment),
    })
  }

  return (
    <EditableListContainer
      title={t('institution.departments')}
      data={existingDepartments}
      isEditable={
        !isEmpty(
          intersection(userPrivileges, [
            Privileges.EditDepartment,
            Privileges.AddDepartment,
            Privileges.DeleteDepartment,
          ])
        )
      }
      handleEditList={handleEditDepartmentsModal}
    />
  )
}

export default DepartmentManagement
