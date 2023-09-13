import { FC, useCallback } from 'react'
import classNames from 'classnames'
import classes from './classes.module.scss'
import { useTranslation } from 'react-i18next'
import { ReactComponent as Delete } from 'assets/icons/delete.svg'
import { ReactComponent as Edit } from 'assets/icons/edit.svg'
import { ReactComponent as Add } from 'assets/icons/add.svg'
import Button, {
  AppearanceTypes,
  IconPositioningTypes,
} from 'components/molecules/Button/Button'
import { filter, map, find } from 'lodash'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import { Price } from 'types/price'
import { DiscountPercentages } from 'types/vendors'
import { CatAnalysis } from 'types/orders'
import { VolumeValue } from 'types/volumes'

// TODO: not sure about this data structure

interface VolumeRowProps extends VolumeValue {
  index: number
  handleDelete: (index: number) => void
  handleEdit: (index: number) => void
}

const VolumeRow: FC<VolumeRowProps> = ({
  amount,
  unit,
  isCat,
  index,
  handleDelete,
  handleEdit,
}) => {
  const { t } = useTranslation()
  const onEditClick = useCallback(() => {
    handleEdit(index)
  }, [handleEdit, index])
  const onDeleteClick = useCallback(() => {
    handleDelete(index)
  }, [handleDelete, index])
  return (
    <div className={classes.row}>
      <span>{`${amount} ${t(`label.${unit}`)}${
        isCat ? ` ${t('task.open_in_cat')}` : ''
      }`}</span>
      <BaseButton onClick={onEditClick} className={classes.editButton}>
        <Edit className={classes.editIcon} />
      </BaseButton>
      <BaseButton onClick={onDeleteClick} className={classes.deleteButton}>
        <Delete className={classes.deleteIcon} />
      </BaseButton>
    </div>
  )
}

export interface AddVolumeInputProps {
  onChange: (newVolumeValues: VolumeValue[]) => void
  value?: VolumeValue[]
  name: string
  className?: string
  label?: JSX.Element | string
  disabled?: boolean
  hidden?: boolean
  loading?: boolean
  catSupported?: boolean
  vendorPrices?: Price
  vendorDiscounts?: DiscountPercentages
  vendorName?: string
  cat_analyzis?: CatAnalysis[]
  assignmentId?: string
}

const AddVolumeInput: FC<AddVolumeInputProps> = ({
  label,
  className,
  hidden,
  onChange,
  value = [],
  catSupported,
  vendorPrices,
  vendorDiscounts,
  vendorName,
  cat_analyzis,
  assignmentId,
  disabled,
  loading,
}) => {
  const { t } = useTranslation()

  const handleDelete = useCallback(
    (index: number) => {
      const newVolumes = filter(
        value,
        (_, volumeIndex) => index !== volumeIndex
      )
      // Random guess that delete will actually be update to all assignment volumes
      // This might not be the case, but works like this in some other cases
      showModal(ModalTypes.ConfirmDeleteVolume, {
        newVolumes,
        callback: () => onChange(newVolumes),
        assignmentId,
      })

      // TODO: delete volume at index
    },
    [onChange, value, assignmentId]
  )

  const addNewVolume = useCallback(
    (volumePayload: VolumeValue) => {
      onChange([...value, volumePayload])
    },
    [onChange, value]
  )

  const editVolume = useCallback(
    (volumePayload: VolumeValue, index: number) => {
      const volumesCopy = [...value]
      volumesCopy[index] = volumePayload
      onChange(volumesCopy)
    },
    [onChange, value]
  )

  const handleEdit = useCallback(
    (index: number) => {
      const matchingVolume = value[index]
      const matchingCatAnalysis = find(cat_analyzis, {
        chunk_id: matchingVolume.chunkId,
      })
      showModal(ModalTypes.VolumeChange, {
        onSave: (volumePayload: VolumeValue) =>
          editVolume(volumePayload, index),
        vendorPrices,
        vendorDiscounts,
        vendorName,
        matchingCatAnalysis,
        ...matchingVolume,
      })
    },
    [value, cat_analyzis, editVolume, vendorPrices, vendorDiscounts, vendorName]
  )

  const handleAdd = useCallback(() => {
    // TODO: open add/edit modal with add mode
    showModal(ModalTypes.AddVolume, {
      onSave: addNewVolume,
      catSupported,
      vendorPrices,
      vendorDiscounts,
      vendorName,
      cat_analyzis,
    })
  }, [
    addNewVolume,
    catSupported,
    vendorPrices,
    vendorDiscounts,
    vendorName,
    cat_analyzis,
  ])
  // Might need event handler wrappers here
  if (hidden) return null
  return (
    <div className={classNames(classes.container, className)}>
      <label className={classNames(classes.label, !label && classes.hidden)}>
        {label}
      </label>
      <div className={classes.valuesContainer}>
        {map(value, (props, index) => (
          <VolumeRow
            {...{ ...props, index, handleDelete, handleEdit }}
            key={index}
          />
        ))}
        <Button
          appearance={AppearanceTypes.Text}
          className={classes.addButton}
          iconPositioning={IconPositioningTypes.Left}
          icon={Add}
          children={t('button.add_volume')}
          onClick={handleAdd}
        />
      </div>
    </div>
  )
}

export default AddVolumeInput
