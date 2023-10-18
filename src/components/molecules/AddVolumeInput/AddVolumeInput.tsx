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
import { useAssignmentAddVolume } from 'hooks/requests/useAssignments'
import { VolumePayload } from 'types/assignments'

// TODO: not sure about this data structure

interface VolumeRowProps extends VolumeValue {
  index: number
  handleDelete: (index: number, id: string) => void
  handleEdit: (index: number) => void
}

const apiTypeToKey = (apiType: string) => {
  switch (apiType) {
    case 'CHARACTERS':
      return 'character_fee'
    case 'WORDS':
      return 'word_fee'
    case 'PAGES':
      return 'page_fee'
    case 'MINUTES':
      return 'minute_fee'
    case 'HOURS':
      return 'hour_fee'
    case 'MINIMALS':
      return 'minimal_fee'
    default:
      return 'minimal_fee'
  }
}

const VolumeRow: FC<VolumeRowProps> = ({
  unit_quantity,
  unit_type,
  isCat,
  index,
  handleDelete,
  handleEdit,
  id,
}) => {
  const { t } = useTranslation()
  const onEditClick = useCallback(() => {
    handleEdit(index)
  }, [handleEdit, index])
  const onDeleteClick = useCallback(() => {
    handleDelete(index, id)
  }, [handleDelete, index, id])
  return (
    <div className={classes.row}>
      <span>{`${unit_quantity} ${t(`label.${apiTypeToKey(unit_type)}`)}${
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
  subOrderId?: string
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
  subOrderId,
  disabled,
  loading,
}) => {
  const { t } = useTranslation()

  const { addAssignmentVolume } = useAssignmentAddVolume({ subOrderId })

  const handleDelete = useCallback(
    (index: number, id: string) => {
      const newVolumes = filter(
        value,
        (_, volumeIndex) => index !== volumeIndex
      )
      showModal(ModalTypes.ConfirmDeleteVolume, {
        newVolumes,
        subOrderId,
        volumeId: id,
        callback: () => onChange(newVolumes),
        assignmentId,
      })
    },
    [value, subOrderId, assignmentId, onChange]
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
    const onSave = async (args: { data: VolumePayload }) => {
      const { data: response } = await addAssignmentVolume(args)
      onChange([...value, response])
    }

    // TODO: open add/edit modal with add mode
    showModal(ModalTypes.AddVolume, {
      onSave,
      assignmentId,
      subOrderId,
      catSupported,
      vendorPrices,
      vendorDiscounts,
      vendorName,
      cat_analyzis,
    })
  }, [
    assignmentId,
    subOrderId,
    catSupported,
    vendorPrices,
    vendorDiscounts,
    vendorName,
    cat_analyzis,
    addAssignmentVolume,
    onChange,
    value,
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
