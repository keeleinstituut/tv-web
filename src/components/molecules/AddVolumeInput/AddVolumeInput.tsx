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
import { filter, identity, map, pickBy } from 'lodash'
import BaseButton from 'components/atoms/BaseButton/BaseButton'
import { ModalTypes, showModal } from 'components/organisms/modals/ModalRoot'
import { Price, PriceUnits } from 'types/price'
import { CatAnalysis, CatJob } from 'types/orders'
import { VolumeValue } from 'types/volumes'
import {
  useAssignmentAddCatVolume,
  useAssignmentAddVolume,
  useAssignmentEditCatVolume,
  useAssignmentEditVolume,
} from 'hooks/requests/useAssignments'
import { CatVolumePayload, ManualVolumePayload } from 'types/assignments'
import { DiscountPercentages } from 'types/vendors'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from '../Notification/Notification'
import i18n from 'i18n/i18n'

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

  const { addAssignmentVolume } = useAssignmentAddVolume({ subOrderId })
  const { addAssignmentCatVolume } = useAssignmentAddCatVolume({ subOrderId })
  const { editAssignmentVolume } = useAssignmentEditVolume({ subOrderId })
  const { editAssignmentCatVolume } = useAssignmentEditCatVolume({ subOrderId })

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
      const onSave = async (
        isCat: boolean,
        args: ManualVolumePayload | CatVolumePayload
      ) => {
        delete args.assignment_id
        let res: VolumeValue
        try {
          if (isCat) {
            const { data: response } = await editAssignmentCatVolume({
              volumeId: matchingVolume.id,
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
          showNotification({
            type: NotificationTypes.Success,
            title: i18n.t('notification.announcement'),
            content: i18n.t('success.volume_edited'),
          })
          onChange(
            value.map((volume) =>
              volume.id === matchingVolume.id ? res : volume
            )
          )
        } catch (error) {
          showNotification({
            type: NotificationTypes.Error,
            title: i18n.t('notification.error'),
            // content: typedErrorData.message,
          })
        }
      }
      showModal(ModalTypes.VolumeChange, {
        onSave,
        isCat,
        vendorPrices,
        vendorName,
        ...matchingVolume,
      })
    },
    [
      value,
      vendorPrices,
      vendorName,
      onChange,
      editAssignmentCatVolume,
      editAssignmentVolume,
    ]
  )

  const handleAdd = useCallback(() => {
    const onSave = async (
      isCat: boolean,
      args: ManualVolumePayload | CatVolumePayload
    ) => {
      let res: VolumeValue
      try {
        if (isCat) {
          const { data: response } = await addAssignmentCatVolume({
            data: {
              ...(args as CatVolumePayload),
              discounts: pickBy(
                (args as CatVolumePayload).discounts,
                identity
              ) as DiscountPercentages,
            },
          })
          res = response
        } else {
          const { data: response } = await addAssignmentVolume({
            data: args as ManualVolumePayload,
          })
          res = response
        }
        showNotification({
          type: NotificationTypes.Success,
          title: i18n.t('notification.announcement'),
          content: i18n.t('success.volume_added'),
        })
        onChange([...value, res])
      } catch (error) {
        showNotification({
          type: NotificationTypes.Error,
          title: i18n.t('notification.error'),
        })
      }
    }

    // TODO: open add/edit modal with add mode
    showModal(ModalTypes.AddVolume, {
      onSave,
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
