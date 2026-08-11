import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModalTypes, closeModal, showModal } from '../ModalRoot'
import ConfirmationModalBase from '../ConfirmationModalBase/ConfirmationModalBase'
import { ModalSizeTypes } from 'components/organisms/ModalBase/ModalBase'
import { SubmitHandler, useForm } from 'react-hook-form'
import DynamicForm, {
  FieldProps,
  InputTypes,
} from 'components/organisms/DynamicForm/DynamicForm'
import { VolumeChangeModalProps } from 'components/organisms/modals/VolumeChangeModal/VolumeChangeModal'
import { useSubProjectCache } from 'hooks/requests/useProjects'
import { useCatJobs } from 'components/organisms/features/CatToolFeature/useCatJobs'
import { mapCattoAnalysisToVolumeAnalysis } from 'components/organisms/features/CatToolFeature/analysisAdapter'
import { CattoAnalysis } from 'components/organisms/features/CatToolFeature/types'
import AnalysesTable from 'components/organisms/features/CatToolFeature/AnalysesTable'

export interface AddVolumeModalProps extends VolumeChangeModalProps {
  catSupported?: boolean
  sub_project_id?: string
}

interface FormValues {
  addType?: string
}

const AddVolumeModal: FC<AddVolumeModalProps> = ({
  isModalOpen,
  sub_project_id,
  ...rest
}) => {
  const { t } = useTranslation()
  const catProjectId =
    useSubProjectCache(sub_project_id)?.cat_metadata?.catto_project_id
  const { data: catJobsData } = useCatJobs(catProjectId)
  const [selectedAnalysis, setSelectedAnalysis] = useState<CattoAnalysis>()

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
      ...(catProjectId
        ? [{ value: 'cat', label: t('task.add_cat_volume') }]
        : []),
    ],
    [catProjectId, t]
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

  useEffect(() => {
    if (addType !== 'cat') {
      setSelectedAnalysis(undefined)
    }
  }, [addType])

  const onSubmit: SubmitHandler<FormValues> = useCallback(
    async (values) => {
      const isCat = values?.addType === 'cat'

      const shouldUseVolumeFromCat = isCat && selectedAnalysis

      showModal(ModalTypes.VolumeChange, {
        sub_project_id,
        isCat,
        volume_analysis: shouldUseVolumeFromCat
            ? mapCattoAnalysisToVolumeAnalysis(selectedAnalysis)
            : undefined,
        ...rest,
      })
    },
    [catJobsData?.data, selectedAnalysis, sub_project_id, rest]
  )

  return (
    <ConfirmationModalBase
      isModalOpen={isModalOpen}
      size={addType === 'cat' ? ModalSizeTypes.ExtraLarge : undefined}
      handleProceed={handleSubmit(onSubmit)}
      proceedButtonDisabled={
        !isValid || (addType === 'cat' && !selectedAnalysis)
      }
      cancelButtonContent={t('button.quit')}
      proceedButtonContent={t('button.confirm')}
      title={t('modal.pick_volume_add_method')}
      helperText={t('modal.pick_volume_helper')}
      closeModal={closeModal}
      modalContent={
        <>
          <DynamicForm control={control} fields={selectionFields} />
          {addType === 'cat' && catProjectId && (
            <AnalysesTable
              catProjectId={catProjectId}
              selectable
              selectedAnalysisId={selectedAnalysis?.id}
              onSelect={setSelectedAnalysis}
            />
          )}
        </>
      }
    />
  )
}

export default AddVolumeModal
