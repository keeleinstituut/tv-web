/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import { isEditable } from '@testing-library/user-event/dist/utils'
import { ReactComponent as EditIcon } from 'assets/icons/edit.svg'
import { groupBy, map, compact, uniqueId } from 'lodash'
import classes from './classes.module.scss'
import { ValidationError } from 'api/errorHandler'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { Root } from '@radix-ui/react-dialog'
import { Type } from 'typescript'
import { DayTypes, InstitutionType } from 'types/institutions'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import { useUpdateInstitution } from 'hooks/requests/useInstitutions'

interface WorkingTimesPropType {
  data?: InstitutionType
}

const WorkingTimes: FC<WorkingTimesPropType> = (props) => {
  const { updateInstitution, isLoading } = useUpdateInstitution({
    institutionId: props?.data?.id,
  })

  const { t } = useTranslation()
  console.log('props', props)
  const data = {
    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    name: 'string',
    phone: 'string',
    email: 'user@example.com',
    short_name: 'string',
    logo_url: 'string',
    updated_at: '2023-08-29T08:51:59.577Z',
    created_at: '2023-08-29T08:51:59.577Z',
    worktime_timezone: 'Europe/Tallinn',
    monday_worktime_start: '08:00:00',
    monday_worktime_end: '16:00:00',
    tuesday_worktime_start: '08:00:00',
    tuesday_worktime_end: '16:00:00',
    wednesday_worktime_start: '08:00:00',
    wednesday_worktime_end: '16:00:00',
    thursday_worktime_start: '08:00:00',
    thursday_worktime_end: '17:00:00',
    friday_worktime_start: '09:00:00',
    friday_worktime_end: '16:00:00',
    saturday_worktime_start: undefined,
    saturday_worktime_end: undefined,
    sunday_worktime_start: undefined,
    sunday_worktime_end: undefined,
  }

  const formattedWorkTime = compact(
    map(DayTypes, (day) => {
      const startTime = data[`${day}_worktime_start`]
      const endTime = data[`${day}_worktime_end`]
      if (startTime || endTime) {
        return {
          day,
          time_range: { start: startTime, end: endTime },
        }
      }
    })
  )
  //console.log('formattedWorkTime', formattedWorkTime)

  const groupedData = groupBy(formattedWorkTime, ({ time_range }) =>
    JSON.stringify(time_range)
  )

  const editableData = map(groupedData, (item, key) => {
    const days = map(item, 'day')
    const newId = uniqueId()
    return {
      id: newId,
      days,
      time_range: JSON.parse(key),
    }
  })

  // console.log('group', groupedData)
  // console.log('data', editableData)

  const handleEditList = () => {
    showModal(ModalTypes.DateTimeRangeFormModal, {
      editableData: editableData,
      title: t('modal.set_working_times_title'),
      // handleOnSubmit: handleOnSubmitTags,
      //type: 'time',
      // inputValidator: tagInputValidator,
      // hasAddingPrivileges: includes(userPrivileges, Privileges.AddTag),
      // hasDeletingPrivileges: includes(userPrivileges, Privileges.DeleteTag),
      // hasEditPrivileges: includes(userPrivileges, Privileges.EditTag),
    })
  }

  return (
    <div className={classes.dateTimeContainer}>
      <span className={classes.bold}>
        {t('institution.working_times')}
        {':'}
      </span>
      <span className={classes.blue}> {'E-N 9:00-17:00'}</span>
      <Button
        appearance={AppearanceTypes.Text}
        size={SizeTypes.S}
        className={classes.editButton}
        icon={EditIcon}
        onClick={handleEditList}
        hidden={!isEditable}
      />
    </div>
  )
}

export default WorkingTimes
