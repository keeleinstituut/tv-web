import { FC, useMemo, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { filter, map } from 'lodash'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { useFetchExternalVendorInstitutions } from 'hooks/requests/useProjectRequests'
import { ExternalVendorInstitution } from 'types/projectRequests'
import TextInput from 'components/molecules/TextInput/TextInput'

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
  const { institutions } = useFetchExternalVendorInstitutions()
  const [search, setSearch] = useState('')

  const selectedIds = useMemo(
    () => new Set(map(recipients, 'external_vendor_institution_id')),
    [recipients]
  )

  const availableOptions = useMemo(() => {
    const lowered = search.trim().toLowerCase()
    return filter(
      institutions,
      (inst) =>
        !selectedIds.has(inst.id) &&
        (!lowered || inst.name.toLowerCase().includes(lowered))
    )
  }, [institutions, selectedIds, search])

  const handleAdd = useCallback(
    (institution: ExternalVendorInstitution) => {
      onChange([
        ...recipients,
        {
          external_vendor_institution_id: institution.id,
          institution_name: institution.name,
          email: institution.email,
        },
      ])
      setSearch('')
    },
    [onChange, recipients]
  )

  const handleRemove = useCallback(
    (institutionId: string) => {
      onChange(
        filter(
          recipients,
          (r) => r.external_vendor_institution_id !== institutionId
        )
      )
    },
    [onChange, recipients]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = recipients.findIndex(
        (r) => r.external_vendor_institution_id === active.id
      )
      const newIndex = recipients.findIndex(
        (r) => r.external_vendor_institution_id === over.id
      )
      if (oldIndex < 0 || newIndex < 0) return
      onChange(arrayMove(recipients, oldIndex, newIndex))
    },
    [onChange, recipients]
  )

  return (
    <div className={classes.stepBody}>
      <h2 className={classes.stepTitle}>{t('requests.compose_title')}</h2>
      <p className={classes.stepHint}>
        {t('requests.select_external_vendors_hint')}
      </p>

      <div className={classes.fieldGroup}>
        <label className={classes.fieldLabel}>
          {t('requests.select_organisation')}
        </label>
        <TextInput
          name="external-vendor-search"
          ariaLabel={t('requests.search_placeholder')}
          placeholder={t('requests.search_placeholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          isSearch
        />
        {search && availableOptions.length > 0 && (
          <ul className={classes.searchResults}>
            {map(availableOptions, (institution) => (
              <li key={institution.id}>
                <button
                  type="button"
                  className={classes.searchResultItem}
                  onClick={() => handleAdd(institution)}
                >
                  {institution.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={classes.fieldGroup}>
        <label className={classes.fieldLabel}>
          {t('requests.selected_external_vendors')}
        </label>
        <div className={classes.selectedList}>
          {recipients.length === 0 && (
            <p className={classes.emptyHint}>
              {t('requests.search_placeholder')}
            </p>
          )}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={map(recipients, 'external_vendor_institution_id')}
              strategy={verticalListSortingStrategy}
            >
              {map(recipients, (recipient) => (
                <SortableVendorItem
                  key={recipient.external_vendor_institution_id}
                  id={recipient.external_vendor_institution_id}
                  name={recipient.institution_name}
                  onRemove={handleRemove}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  )
}

export default Step1VendorSelection
