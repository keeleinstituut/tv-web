import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { uniqueId } from 'lodash'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { DatePickerComponent } from 'components/molecules/DatePickerInput/DatePickerInput'
import TimeDropdownSelect from 'components/molecules/TimeDropdownSelect/TimeDropdownSelect'
import Add from 'assets/icons/add.svg?react'
import Delete from 'assets/icons/delete.svg?react'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { VendorAbsence } from 'types/vendors'
import classes from './classes.module.scss'

dayjs.extend(customParseFormat)

export interface VendorAbsencesModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  vendorId: string
  absences: VendorAbsence[]
  onSave: (
    toCreate: Array<Pick<VendorAbsence, 'start_at' | 'end_at'>>,
    toDelete: string[]
  ) => Promise<void>
}

interface RowState {
  rowId: string
  existingId?: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
}

function absencesToRows(absences: VendorAbsence[]): RowState[] {
  return absences.map((a) => ({
    rowId: a.id,
    existingId: a.id,
    startDate: dayjs(a.start_at).format('DD/MM/YYYY'),
    startTime: dayjs(a.start_at).format('HH:mm'),
    endDate: dayjs(a.end_at).format('DD/MM/YYYY'),
    endTime: dayjs(a.end_at).format('HH:mm'),
  }))
}

function rowToIsoRange(row: RowState): { start_at: string; end_at: string } | null {
  const s = dayjs(
    `${row.startDate} ${row.startTime}`,
    'DD/MM/YYYY HH:mm'
  )
  const e = dayjs(`${row.endDate} ${row.endTime}`, 'DD/MM/YYYY HH:mm')
  if (!s.isValid() || !e.isValid() || !e.isAfter(s) || s.isBefore(dayjs())) return null
  return { start_at: s.toISOString(), end_at: e.toISOString() }
}

const VendorAbsencesModal: FC<VendorAbsencesModalProps> = ({
  isModalOpen,
  closeModal,
  absences,
  onSave,
}) => {
  const { t } = useTranslation()
  const [rows, setRows] = useState<RowState[]>(() => absencesToRows(absences))
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetRows = () => setRows(absencesToRows(absences))

  const addRow = () =>
    setRows((prev) => [
      ...prev,
      {
        rowId: uniqueId('absence_'),
        startDate: '',
        startTime: '09:00',
        endDate: '',
        endTime: '17:00',
      },
    ])

  const deleteRow = (rowId: string) =>
    setRows((prev) => prev.filter((r) => r.rowId !== rowId))

  const updateRow = (rowId: string, patch: Partial<RowState>) =>
    setRows((prev) =>
      prev.map((r) => (r.rowId === rowId ? { ...r, ...patch } : r))
    )

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      const currentExistingIds = new Set(
        rows.filter((r) => r.existingId).map((r) => r.existingId!)
      )
      const toDelete = absences
        .map((a) => a.id)
        .filter((id) => !currentExistingIds.has(id))
      const toCreate = rows
        .filter((r) => !r.existingId)
        .map(rowToIsoRange)
        .filter((x): x is { start_at: string; end_at: string } => x !== null)
      await onSave(toCreate, toDelete)
      closeModal()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    resetRows()
    closeModal()
  }

  const hasNewRowWithDates = (r: RowState) =>
    !r.existingId && (r.startDate || r.endDate)

  const hasAtLeastOneValidNewRow = rows.some(
    (r) => !r.existingId && !!rowToIsoRange(r)
  )
  const hasAnyDeletion = absences.some(
    (a) => !rows.find((r) => r.existingId === a.id)
  )
  const hasChanges = hasAtLeastOneValidNewRow || hasAnyDeletion
  const hasInvalidFilledRow = rows.some(
    (r) => hasNewRowWithDates(r) && !rowToIsoRange(r)
  )

  return (
    <ModalBase
      title={t('modal.vendor_absence_times_title')}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      buttonsPosition={ButtonPositionTypes.Right}
      size={ModalSizeTypes.Medium}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          children: t('button.cancel'),
          onClick: handleClose,
          autoFocus: true,
        },
        {
          appearance: AppearanceTypes.Primary,
          children: t('button.save'),
          loading: isSubmitting,
          onClick: handleSave,
          disabled: hasInvalidFilledRow || !hasChanges,
        },
      ]}
    >
      <div className={classes.formContainer}>
        {rows.map((row) => (
          <div className={classes.row} key={row.rowId}>
            <div className={classes.datePicker}>
              <DatePickerComponent
                name={`${row.rowId}_start_date`}
                value={row.startDate}
                onChange={(v) => updateRow(row.rowId, { startDate: v })}
                disabled={!!row.existingId}
                minDate={new Date()}
              />
            </div>
            <div className={classes.timeSelect}>
              <TimeDropdownSelect
                value={row.startTime}
                onChange={(v) => updateRow(row.rowId, { startTime: v })}
                disabled={!!row.existingId}
              />
            </div>
            <span>–</span>
            <div className={classes.datePicker}>
              <DatePickerComponent
                name={`${row.rowId}_end_date`}
                value={row.endDate}
                onChange={(v) => updateRow(row.rowId, { endDate: v })}
                disabled={!!row.existingId}
                minDate={new Date()}
              />
            </div>
            <div className={classes.timeSelect}>
              <TimeDropdownSelect
                value={row.endTime}
                onChange={(v) => updateRow(row.rowId, { endTime: v })}
                disabled={!!row.existingId}
              />
            </div>
            <BaseButton
              className={classes.deleteButton}
              onClick={() => deleteRow(row.rowId)}
              aria-label={t('button.delete')}
            >
              <Delete />
            </BaseButton>
          </div>
        ))}
      </div>
      <Button
        appearance={AppearanceTypes.Text}
        iconPositioning={IconPositioningTypes.Left}
        icon={Add}
        children={t('tag.add_new_row')}
        onClick={addRow}
        hidden={rows.length > 6}
      />
    </ModalBase>
  )
}

export default VendorAbsencesModal
