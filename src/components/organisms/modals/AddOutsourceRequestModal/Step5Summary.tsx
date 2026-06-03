import { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { map } from 'lodash'
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

import FileIcon from 'assets/icons/file.svg?react'
import { useAssignmentCache } from 'hooks/requests/useAssignments'
import { useOutsourceRequestPreviewPrices } from 'hooks/requests/useOutsourceRequests'
import { apiTypeToKey } from 'components/molecules/AddVolumeInput/AddVolumeInput'

import classes from './classes.module.scss'
import { AddOutsourceRequestDraft, DraftRecipient } from './types'
import SortablePartnerInstitutionWithPriceItem from './SortablePartnerInstitutionWithPriceItem'

interface Step5SummaryProps {
  draft: AddOutsourceRequestDraft
  files: File[]
  assignmentId: string
  sub_project_id: string
  onChange: (recipients: DraftRecipient[]) => void
}

const Step5Summary: FC<Step5SummaryProps> = ({
  draft,
  files,
  assignmentId,
  sub_project_id,
  onChange,
}) => {
  const { t } = useTranslation()

  const assignment = useAssignmentCache({ id: assignmentId, sub_project_id })
  const volumes = assignment?.volumes ?? []

  const { previewOffers } = useOutsourceRequestPreviewPrices({
    assignmentId,
    offers: map(draft.recipients, (r) => ({ institution_id: r.institution_id })),
    priceMode: draft.price_mode,
    price: draft.price,
    enabled: draft.recipients.length > 0,
  })

  const priceByInstitutionId = new Map(
    previewOffers.map((o) => [o.institution_id, o.price])
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return
      const oldIndex = draft.recipients.findIndex(
        (r) => r.institution_id === active.id
      )
      const newIndex = draft.recipients.findIndex(
        (r) => r.institution_id === over.id
      )
      if (oldIndex < 0 || newIndex < 0) return
      onChange(arrayMove(draft.recipients, oldIndex, newIndex))
    },
    [draft.recipients, onChange]
  )

  return (
    <div className={classes.stepBody}>
      <div className={classes.formRow}>
        <span className={classes.rowLabel}>
          {t('requests.field_source_files')}
        </span>
        <div className={classes.rowContent}>
          <span style={{ paddingTop: '8px' }}>
            {draft.include_source_files ? t('label.yes') : t('label.no')}
          </span>
        </div>
      </div>

      <div className={classes.formRow}>
        <span className={classes.rowLabel}>{t('label.added_files')}</span>
        <div className={classes.rowContent}>
          <div className={classes.fileTableHeader}>{t('label.tag_name')}</div>
          {files.length === 0 ? (
            <span>{t('requests.files_none')}</span>
          ) : (
            files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className={classes.summaryFileItem}
              >
                <FileIcon className={classes.summaryFileIcon} />
                <span className={classes.summaryFileName}>{file.name}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className={classes.formRow}>
        <span className={classes.rowLabel}>
          {t('requests.selected_external_vendors')}
        </span>
        <div className={classes.rowContent}>
          <div className={classes.vendorTableHeader}>
            <span className={classes.vendorTableHeaderName}>
              {t('requests.vendor_table_organisation')}
            </span>
            <span className={classes.vendorTableHeaderPrice}>
              {t('requests.price_label')}
            </span>
          </div>
          <div className={classes.selectedList}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              autoScroll={false}
            >
              <SortableContext
                items={map(draft.recipients, 'institution_id')}
                strategy={verticalListSortingStrategy}
              >
                {map(draft.recipients, (recipient) => (
                  <SortablePartnerInstitutionWithPriceItem
                    key={recipient.institution_id}
                    id={recipient.institution_id}
                    name={recipient.institution_name}
                    price={priceByInstitutionId.get(recipient.institution_id)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>

      {volumes.length > 0 && (
        <div className={classes.formRow}>
          <span className={classes.rowLabel}>
            {t('requests.volume_section_label')}
          </span>
          <div className={classes.rowContent}>
            <div className={classes.summaryVolumeList}>
              {volumes.map((volume) => (
                <span key={volume.id} className={classes.summaryVolumeItem}>
                  {`${Number(volume.unit_quantity)} ${t(
                    `label.${apiTypeToKey(volume.unit_type)}`
                  )}`}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {draft.special_instructions && (
        <div className={classes.formRow}>
          <span className={classes.rowLabel}>
            {t('requests.field_special_instructions')}
          </span>
          <div className={classes.rowContent}>
            <span style={{ paddingTop: '8px' }}>{draft.special_instructions}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default Step5Summary
