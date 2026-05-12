import { FC } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import Delete from 'assets/icons/delete.svg?react'
import DragHandle from 'assets/icons/drag_handle.svg?react'

import classes from './classes.module.scss'

interface SortableVendorItemProps {
  id: string
  name: string
  onRemove: (id: string) => void
}

const SortableVendorItem: FC<SortableVendorItemProps> = ({
  id,
  name,
  onRemove,
}) => {
  const { t } = useTranslation()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames(
        classes.vendorRow,
        isDragging && classes.vendorRowDragging
      )}
    >
      <button
        type="button"
        className={classes.dragHandle}
        aria-label={t('label.reorder')}
        {...attributes}
        {...listeners}
      >
        <DragHandle />
      </button>
      <span className={classes.vendorName}>{name}</span>
      <BaseButton
        type="button"
        className={classes.removeButton}
        onClick={() => onRemove(id)}
        aria-label={t('button.delete')}
      >
        <Delete />
      </BaseButton>
    </div>
  )
}

export default SortableVendorItem
