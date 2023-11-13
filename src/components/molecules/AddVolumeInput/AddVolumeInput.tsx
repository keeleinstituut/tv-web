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
import { CatAnalysis, CatJob } from 'types/orders'
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
  loading?: boolean
  catSupported?: boolean
  vendorPrices?: Price
  vendorName?: string
  cat_analyzis?: CatAnalysis[]
  assignmentId?: string
  subOrderId?: string
  assignmentCatJobs?: CatJob[]
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
  cat_analyzis,
  assignmentId,
  subOrderId,
  assignmentCatJobs,
  disabled,
  loading,
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
        subOrderId,
        volumeId: id,
        callback: () => onChange(newVolumes),
        assignmentId,
      })
    },
    [value, subOrderId, assignmentId, onChange]
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
        subOrderId,
        ...matchingVolume,
      })
    },
    [value, vendorPrices, vendorName, onChange, subOrderId]
  )

  const handleAdd = useCallback(() => {
    const onChangeValue = (newVolume: VolumeValue) => {
      onChange([...value, newVolume])
    }

    // TODO: open add/edit modal with add mode
    showModal(ModalTypes.AddVolume, {
      onChangeValue,
      assignmentId,
      subOrderId,
      catSupported,
      vendorPrices,
      vendorName,
      cat_analyzis,
      assignmentCatJobs,
    })
  }, [
    assignmentId,
    subOrderId,
    catSupported,
    vendorPrices,
    vendorName,
    cat_analyzis,
    assignmentCatJobs,
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
