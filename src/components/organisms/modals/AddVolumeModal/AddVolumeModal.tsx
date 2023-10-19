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
import { ManualVolumePayload } from 'types/assignments'
import { useCatAnalysisFetch } from 'hooks/requests/useAnalysis'

// TODO: this is WIP code for suborder view

export interface AddVolumeModalProps extends VolumeChangeModalProps {
  onSave?: (newVolume: ManualVolumePayload) => void
  catSupported?: boolean
  cat_analyzis?: CatAnalysis[]
  subOrderId?: string
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
  subOrderId,
  ...rest
}) => {
  const { t } = useTranslation()
  const { cat_analysis } = useCatAnalysisFetch({ subOrderId })

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
        options: map(cat_analysis?.jobs, ({ id }) => ({
          value: id.toString(),
          label: id.toString(),
        })),
        rules: {
          required: true,
        },
      },
    ],
    [cat_analysis?.jobs]
  )

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      showModal(ModalTypes.VolumeChange, {
        onSave,
        isCat: values?.addType === 'cat',
        matchingCatAnalysis: find(cat_analysis?.jobs, { id: values?.chunkId })
          ?.volume_analysis,
        ...rest,
      })
    },
    [cat_analysis, onSave, rest]
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
