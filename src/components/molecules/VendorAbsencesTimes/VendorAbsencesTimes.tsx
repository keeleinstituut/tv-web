import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { join, map } from 'lodash'
import dayjs from 'dayjs'
import Button, {
  AppearanceTypes,
  SizeTypes,
} from 'components/molecules/Button/Button'
import EditIcon from 'assets/icons/edit.svg?react'
import { showModal, ModalTypes } from 'components/organisms/modals/ModalRoot'
import {
  useFetchVendorAbsences,
  useCreateVendorAbsence,
  useDeleteVendorAbsence,
} from 'hooks/requests/useCalendar'
import { VendorAbsence } from 'types/vendors'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import classes from './classes.module.scss'

interface VendorAbsencesTimesProps {
  vendorId: string
}

const VendorAbsencesTimes: FC<VendorAbsencesTimesProps> = ({ vendorId }) => {
  const { t } = useTranslation()
  const { absences } = useFetchVendorAbsences(vendorId)
  const { mutateAsync: createAbsence } = useCreateVendorAbsence()
  const { mutateAsync: deleteAbsence } = useDeleteVendorAbsence()

  const displayText = join(
    map(absences, (a) => {
      const start = dayjs(a.start_at).format('DD.MM.YYYY HH:mm')
      const end = dayjs(a.end_at).format('DD.MM.YYYY HH:mm')
      return `${start} – ${end}`
    }),
    ', '
  )

  const handleEdit = () => {
    showModal(ModalTypes.VendorAbsences, {
      vendorId,
      absences,
      onSave: async (
        toCreate: Array<Pick<VendorAbsence, 'start_at' | 'end_at'>>,
        toDelete: string[]
      ) => {
        await Promise.all(toDelete.map((entryId) => deleteAbsence(entryId)))
        await Promise.all(
          toCreate.map((a) =>
            createAbsence({
              vendor_id: vendorId,
              start_at: a.start_at,
              end_at: a.end_at,
            })
          )
        )
        showNotification({
          type: NotificationTypes.Success,
          title: t('notification.announcement'),
          content: t('success.vendor_absences_updated'),
        })
      },
    })
  }

  return (
    <div className={classes.dateContainer}>
      <span className={classes.bold}>
        {t('institution.vendor_absence_times')}
      </span>
      <span className={classes.blue}>{displayText}</span>
      <Button
        ariaLabel={t('institution.vendor_absence_times')}
        appearance={AppearanceTypes.Text}
        size={SizeTypes.S}
        className={classes.editButton}
        icon={EditIcon}
        onClick={handleEdit}
      />
    </div>
  )
}

export default VendorAbsencesTimes
