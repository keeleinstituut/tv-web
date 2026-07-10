import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { uniqueId } from 'lodash'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import DateRangePicker from 'components/molecules/DateRangePicker/DateRangePicker'
import Add from 'assets/icons/add.svg?react'
import { EmergencySchedule } from 'types/vendors'
import { Root } from '@radix-ui/react-form'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import classes from './classes.module.scss'

dayjs.extend(customParseFormat)

export interface EmoSchedulesModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  vendorId: string
  schedules: EmergencySchedule[]
  onSave: (
    toCreate: Omit<EmergencySchedule, 'id'>[],
    toDelete: string[]
  ) => Promise<void>
}

interface RowState {
  rowId: string
  existingId?: string
  dateRange: { start?: string; end?: string }
}

function schedulesToRows(schedules: EmergencySchedule[]): RowState[] {
  return schedules.map((s) => ({
    rowId: s.id,
    existingId: s.id,
    dateRange: {
      start: dayjs(s.start_date).format('DD/MM/YYYY'),
      end: dayjs(s.end_date).format('DD/MM/YYYY'),
    },
  }))
}

const EmoSchedulesModal: FC<EmoSchedulesModalProps> = ({
  isModalOpen,
  closeModal,
  schedules,
  onSave,
}) => {
  const { t } = useTranslation()
  const [rows, setRows] = useState<RowState[]>(() =>
    schedulesToRows(schedules)
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetRows = () => setRows(schedulesToRows(schedules))

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      { rowId: uniqueId('emo_'), dateRange: {} },
    ])
  }

  const deleteRow = (rowId: string) => {
    setRows((prev) => prev.filter((r) => r.rowId !== rowId))
  }

  const updateDateRange = (
    rowId: string,
    dateRange: { start?: string; end?: string }
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.rowId === rowId ? { ...r, dateRange } : r))
    )
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      const existingIds = new Set(schedules.map((s) => s.id))
      const currentExistingIds = new Set(
        rows.filter((r) => r.existingId).map((r) => r.existingId!)
      )
      const toDelete = [...existingIds].filter(
        (id) => !currentExistingIds.has(id)
      )
      const toApiDate = (d: string) =>
        dayjs(d, 'DD/MM/YYYY').format('YYYY-MM-DD')
      const toCreate = rows
        .filter((r) => !r.existingId && r.dateRange.start && r.dateRange.end)
        .map((r) => ({
          start_date: toApiDate(r.dateRange.start!),
          end_date: toApiDate(r.dateRange.end!),
        }))
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

  return (
    <ModalBase
      title={t('modal.emo_working_hours_title')}
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
          disabled: rows.some((r) => !r.dateRange.start || !r.dateRange.end),
        },
      ]}
    >
      <Root>
        <div className={classes.formContainer}>
          {rows.map((row) => (
            <DateRangePicker
              key={row.rowId}
              name={`${row.rowId}.date_range`}
              label={t('institution.working_days_range')}
              value={row.dateRange}
              onChange={(v) => updateDateRange(row.rowId, v)}
              handleDelete={() => deleteRow(row.rowId)}
            />
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
      </Root>
    </ModalBase>
  )
}

export default EmoSchedulesModal
