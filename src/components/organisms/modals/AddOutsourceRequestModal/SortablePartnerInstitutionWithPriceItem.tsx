import { FC } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTranslation } from 'react-i18next'
import classNames from 'classnames'
import DragHandle from 'assets/icons/drag_handle.svg?react'

import classes from './classes.module.scss'

interface SortablePartnerInstitutionWithPriceItemProps {
  id: string
  name: string
  price: number | null | undefined
}

const SortablePartnerInstitutionWithPriceItem: FC<
  SortablePartnerInstitutionWithPriceItemProps
> = ({ id, name, price }) => {
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
      <span className={classes.vendorPrice}>
        {price != null ? `${price}€` : '—'}
      </span>
    </div>
  )
}

export default SortablePartnerInstitutionWithPriceItem
