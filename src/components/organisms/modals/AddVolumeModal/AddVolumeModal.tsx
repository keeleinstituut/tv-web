import { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalTypes, closeModal, showModal } from '../ModalRoot'
import ConfirmationModalBase from '../ConfirmationModalBase/ConfirmationModalBase'
import { SubmitHandler, useForm } from 'react-hook-form'
import { map, find } from 'lodash'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { VolumeChangeModalProps } from 'components/organisms/modals/VolumeChangeModal/VolumeChangeModal'
import { CatAnalysis } from 'types/orders'
import { VolumeValue } from 'types/volumes'

// TODO: this is WIP code for suborder view

export interface AddVolumeModalProps extends VolumeChangeModalProps {
  onSave?: (newVolume: VolumeValue) => void
  catSupported?: boolean
  cat_analyzis?: CatAnalysis[]
}

interface FormValues {
  addType?: string
  chunkId?: string
}

const AddVolumeModal: FC<AddVolumeModalProps> = ({
  onSave,
  catSupported,
  isModalOpen,
  cat_analyzis,
  ...rest
}) => {
  const { t } = useTranslation()

  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<FormValues>({
    reValidateMode: 'onChange',
    defaultValues: {
      addType: 'manual',
    },
  })

  const options = useMemo(
    () => [
      { value: 'manual', label: t('task.add_manual_volume') },
      ...(catSupported
        ? [{ value: 'cat', label: t('task.add_cat_volume') }]
        : []),
    ],
    [catSupported, t]
  )

  const addType = watch('addType')

  const selectionFields: FieldProps<FormValues>[] = useMemo(
    () => [
      {
        inputType: InputTypes.Selections,
        ariaLabel: t('label.pick_volume_type'),
        placeholder: t('placeholder.pick'),
        name: 'addType',
        options: options,
        rules: {
          required: true,
        },
      },
    ],
    [options, t]
  )

  const chunkField: FieldProps<FormValues>[] = useMemo(
    () => [
      {
        inputType: InputTypes.RadioGroup,
        name: 'chunkId',
        options: map(cat_analyzis, ({ chunk_id }) => ({
          value: chunk_id,
          label: chunk_id,
        })),
        rules: {
          required: true,
        },
      },
    ],
    [cat_analyzis]
  )

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      showModal(ModalTypes.VolumeChange, {
        onSave,
        isCat: values?.addType === 'cat',
        matchingCatAnalysis: find(cat_analyzis, { chunk_id: values?.chunkId }),
        ...rest,
      })
    },
    [cat_analyzis, onSave, rest]
  )

  return (
    <ConfirmationModalBase
      isModalOpen={isModalOpen}
      handleProceed={handleSubmit(onSubmit)}
      proceedButtonDisabled={!isValid}
      cancelButtonContent={t('button.quit')}
      proceedButtonContent={t('button.confirm')}
      title={t('modal.pick_volume_add_method')}
      helperText={t('modal.pick_volume_helper')}
      closeModal={closeModal}
      modalContent={
        <DynamicForm
          control={control}
          fields={[
            ...selectionFields,
            ...(addType === 'cat' ? chunkField : []),
          ]}
        />
      }
    />
  )
}

export default AddVolumeModal
