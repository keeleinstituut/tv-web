import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { filter, find, map } from 'lodash'
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { useFetchInstitutionPartners } from 'hooks/requests/useOutsourceRequests'
import SelectionControlsInput from 'components/organisms/SelectionControlsInput/SelectionControlsInput'

import classes from './classes.module.scss'
import { DraftRecipient } from './types'
import SortableVendorItem from './SortableVendorItem'

interface Step1VendorSelectionProps {
  recipients: DraftRecipient[]
  onChange: (recipients: DraftRecipient[]) => void
}

const Step1VendorSelection: FC<Step1VendorSelectionProps> = ({
  recipients,
  onChange,
}) => {
  const { t } = useTranslation()
  const { partners } = useFetchInstitutionPartners({ per_page: 50 })

  const partnerOptions = useMemo(
    () =>
      map(partners, (p) => ({
        id: p.partner_institution_id,
        name:
          p.partner_institution?.name ??
          p.partner_institution?.short_name ??
          p.partner_institution_id,
      })),
    [partners]
  )

  const selectedIds = useMemo(
    () => new Set(map(recipients, 'institution_id')),
    [recipients]
  )

  const dropdownOptions = useMemo(
    () =>
      filter(partnerOptions, (p) => !selectedIds.has(p.id)).map((p) => ({
        label: p.name,
        value: p.id,
      })),
    [partnerOptions, selectedIds]
  )

  const handleAdd = useCallback(
    (value: string | string[]) => {
      const id = Array.isArray(value) ? value[0] : value
      if (!id) return
      const partner = find(partnerOptions, { id })
      if (!partner) return
      onChange([
        ...recipients,
        {
          institution_id: partner.id,
          institution_name: partner.name,
        },
      ])
    },
    [partnerOptions, onChange, recipients]
  )

  const handleRemove = useCallback(
    (institutionId: string) => {
      onChange(filter(recipients, (r) => r.institution_id !== institutionId))
    },
    [onChange, recipients]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = recipients.findIndex(
        (r) => r.institution_id === active.id
      )
      const newIndex = recipients.findIndex((r) => r.institution_id === over.id)
      if (oldIndex < 0 || newIndex < 0) return
      onChange(arrayMove(recipients, oldIndex, newIndex))
    },
    [onChange, recipients]
  )

  return (
    <div className={classes.stepBody}>
      <div className={classes.fieldGroup}>
        <span className={classes.fieldLabel}>
          {t('requests.select_organisation')}
        </span>
        <SelectionControlsInput
          name="external-vendor-picker"
          ariaLabel={t('requests.select_organisation')}
          placeholder={t('requests.search_placeholder')}
          value=""
          options={dropdownOptions}
          onChange={handleAdd}
          showSearch
          usePortal
        />
      </div>

      <div className={classes.fieldGroup}>
        <span className={classes.fieldLabel}>
          {t('requests.selected_external_vendors')}
        </span>
        {recipients.length > 0 && (
          <div className={classes.selectedList}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              autoScroll={false}
            >
              <SortableContext
                items={map(recipients, 'institution_id')}
                strategy={verticalListSortingStrategy}
              >
                {map(recipients, (recipient) => (
                  <SortableVendorItem
                    key={recipient.institution_id}
                    id={recipient.institution_id}
                    name={recipient.institution_name}
                    onRemove={handleRemove}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        )}
      </div>
    </div>
  )
}

export default Step1VendorSelection
