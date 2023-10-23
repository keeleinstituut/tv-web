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
import { Price, PriceUnits } from 'types/price'
import { DiscountPercentages } from 'types/vendors'
import { CatAnalysis } from 'types/orders'
import { VolumeValue } from 'types/volumes'
import {
  useAssignmentAddCatVolume,
  useAssignmentAddVolume,
  useAssignmentEditVolume,
} from 'hooks/requests/useAssignments'
import { CatVolumePayload, ManualVolumePayload } from 'types/assignments'

// TODO: not sure about this data structure

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
      return PriceUnits.MinimalFee
    default:
      return PriceUnits.MinimalFee
  }
}

export const keyToApiType = (key: string) => {
  switch (key) {
    case 'character_fee':
      return 'CHARACTERS'
    case 'word_fee':
      return 'WORDS'
    case 'page_fee':
      return 'PAGES'
    case 'minute_fee':
      return 'MINUTES'
    case 'hour_fee':
      return 'HOURS'
    case 'minimal_fee':
      return 'MINIMALS'
    default:
      return 'MINIMALS'
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
  const { addAssignmentCatVolume } = useAssignmentAddCatVolume({ subOrderId })
  const { editAssignmentVolume } = useAssignmentEditVolume({ subOrderId })

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
      const onSave = async (
        isCat: boolean,
        args: ManualVolumePayload | CatVolumePayload
      ) => {
        delete args.assignment_id
        let res: VolumeValue
        if (isCat) {
          const { data: response } = await addAssignmentCatVolume({
            data: args as CatVolumePayload,
          })
          res = response
        } else {
          const { data: response } = await editAssignmentVolume({
            volumeId: matchingVolume.id,
            data: args as ManualVolumePayload,
          })
          res = response
        }
        onChange(
          value.map((volume) =>
            volume.id === matchingVolume.id ? res : volume
          )
        )
      }
      showModal(ModalTypes.VolumeChange, {
        onSave,
        vendorPrices,
        vendorDiscounts,
        vendorName,
        ...matchingVolume,
      })
    },
    [
      value,
      vendorPrices,
      vendorDiscounts,
      vendorName,
      onChange,
      addAssignmentCatVolume,
      editAssignmentVolume,
    ]
  )

  const handleAdd = useCallback(() => {
    const onSave = async (
      isCat: boolean,
      args: ManualVolumePayload | CatVolumePayload
    ) => {
      let res: VolumeValue
      if (isCat) {
        const { data: response } = await addAssignmentCatVolume({
          data: args as CatVolumePayload,
        })
        res = response
      } else {
        const { data: response } = await addAssignmentVolume({
          data: args as ManualVolumePayload,
        })
        res = response
      }
      onChange([...value, res])
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
    addAssignmentCatVolume,
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
