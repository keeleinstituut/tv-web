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
import { filter, map } from 'lodash'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import { Price, PriceUnits } from 'types/price'
import { VolumeValue } from 'types/volumes'

interface VolumeRowProps extends VolumeValue {
  index: number
  handleDelete: (index: number, id: string) => void
  handleEdit: (index: number) => void
}

export const apiTypeToKey = (apiType: string) => {
  switch (apiType) {
    case 'CHARACTERS':
      return PriceUnits.CharacterFee
    case 'WORDS':
      return PriceUnits.WordFee
    case 'PAGES':
      return PriceUnits.PageFee
    case 'MINUTES':
      return PriceUnits.MinuteFee
    case 'HOURS':
      return PriceUnits.HourFee
    case 'MINIMALS':
    default:
      return PriceUnits.MinimalFee
  }
}

export const keyToApiType = (key: string) => {
  switch (key) {
    case PriceUnits.CharacterFee:
      return 'CHARACTERS'
    case PriceUnits.WordFee:
      return 'WORDS'
    case PriceUnits.PageFee:
      return 'PAGES'
    case PriceUnits.MinuteFee:
      return 'MINUTES'
    case PriceUnits.HourFee:
      return 'HOURS'
    case PriceUnits.MinimalFee:
    default:
      return 'MINIMALS'
  }
}

const VolumeRow: FC<VolumeRowProps> = ({
  unit_quantity,
  unit_type,
  cat_job,
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
      <span>{`${Number(unit_quantity)} ${t(
        `label.${apiTypeToKey(unit_type)}`
      )}${cat_job ? ` ${t('task.open_in_cat')}` : ''}`}</span>
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
  catSupported?: boolean
  vendorPrices?: Price
  vendorName?: string
  assignmentId?: string
  sub_project_id?: string
}

const AddVolumeInput: FC<AddVolumeInputProps> = ({
  label,
  className,
  hidden,
  onChange,
  value = [],
  catSupported,
  vendorPrices,
  vendorName,
  assignmentId,
  sub_project_id,
  disabled,
}) => {
  const { t } = useTranslation()

  const handleDelete = useCallback(
    (index: number, id: string) => {
      const newVolumes = filter(
        value,
        (_, volumeIndex) => index !== volumeIndex
      )
      showModal(ModalTypes.ConfirmDeleteVolume, {
        newVolumes,
        sub_project_id,
        volumeId: id,
        callback: () => onChange(newVolumes),
        assignmentId,
      })
    },
    [value, sub_project_id, assignmentId, onChange]
  )

  const handleEdit = useCallback(
    (index: number) => {
      const matchingVolume = value[index]
      const isCat = !!matchingVolume.cat_job

      const onChangeValue = (updatedVolume: VolumeValue) => {
        onChange(
          map(value, (volume) =>
            volume.id === matchingVolume.id ? updatedVolume : volume
          )
        )
      }
      showModal(ModalTypes.VolumeChange, {
        isCat,
        vendorPrices,
        vendorName,
        onChangeValue,
        sub_project_id,
        ...matchingVolume,
      })
    },
    [value, vendorPrices, vendorName, onChange, sub_project_id]
  )

  const handleAdd = useCallback(() => {
    const onChangeValue = (newVolume: VolumeValue) => {
      onChange([...value, newVolume])
    }

    showModal(ModalTypes.AddVolume, {
      onChangeValue,
      assignmentId,
      sub_project_id,
      catSupported,
      vendorPrices,
      vendorName,
    })
  }, [
    assignmentId,
    sub_project_id,
    catSupported,
    vendorPrices,
    vendorName,
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
          disabled={disabled}
          icon={Add}
          children={t('button.add_volume')}
          onClick={handleAdd}
        />
      </div>
    </div>
  )
}

export default AddVolumeInput
