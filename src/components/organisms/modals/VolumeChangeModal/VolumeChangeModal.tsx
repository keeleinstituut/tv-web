import { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { closeModal } from '../ModalRoot'
import ConfirmationModalBase from '../ConfirmationModalBase/ConfirmationModalBase'
import { Price } from 'types/price'
import { DiscountPercentages } from 'types/vendors'
import { CatAnalysis } from 'types/projects'
import { VolumeValue } from 'types/volumes'
import { ProjectDetailModes } from 'components/organisms/ProjectDetails/ProjectDetails'
import VolumeForm, { VolumeFormState } from 'components/organisms/forms/VolumeForm/VolumeForm'

import classes from './classes.module.scss'

export interface VolumeChangeModalProps {
  assignmentId?: string
  catJobId?: string
  isCat?: boolean
  isModalOpen?: boolean
  id?: string
  vendorPrices?: Price
  discounts?: DiscountPercentages
  vendorName?: string
  volume_analysis?: CatAnalysis
  unit_fee?: number
  unit_type?: string
  unit_quantity?: number
  sub_project_id?: string
  onChangeValue?: (volume: VolumeValue) => void
  mode?: ProjectDetailModes
  taskViewPricesClass?: string
}

const noop = () => {}

const VolumeChangeModal: FC<VolumeChangeModalProps> = ({
  isCat,
  id,
  vendorName,
  vendorPrices,
  discounts,
  volume_analysis,
  assignmentId,
  catJobId,
  unit_fee,
  unit_quantity,
  unit_type,
  sub_project_id,
  onChangeValue,
  mode,
  taskViewPricesClass,
  ...rest
}) => {
  const { t } = useTranslation()
  const [formState, setFormState] = useState<VolumeFormState>({
    submit: noop,
    isValid: false,
    isLoading: false,
  })

  const title =
    mode === ProjectDetailModes.View
      ? t('modal.view_cat_volumes')
      : isCat
      ? t('modal.pick_volume_by_cat')
      : t('modal.pick_volume_manually')

  const catHelperText = isCat ? (
    <>
      {t('modal.picked_analysis_for')}{' '}
      <b>{JSON.stringify(volume_analysis?.files_names)}</b>
      <br />
      {t('modal.pick_volume_by_cat_helper')}
    </>
  ) : (
    t('modal.pick_volume_manually_helper')
  )

  const helperText = mode === ProjectDetailModes.View ? '' : catHelperText

  return (
    <ConfirmationModalBase
      {...rest}
      className={classes.modalContainer}
      handleProceed={formState.submit}
      cancelButtonContent={t('button.close')}
      cancelButtonDisabled={formState.isLoading}
      proceedButtonContent={
        mode === ProjectDetailModes.View ? undefined : t('button.confirm')
      }
      proceedButtonDisabled={!formState.isValid}
      proceedButtonLoading={formState.isLoading}
      proceedButtonHidden={mode === ProjectDetailModes.View}
      title={title}
      helperText={helperText}
      closeModal={closeModal}
      modalContent={
        <VolumeForm
          isCat={isCat}
          id={id}
          vendorName={vendorName}
          vendorPrices={vendorPrices}
          discounts={discounts}
          volume_analysis={volume_analysis}
          assignmentId={assignmentId}
          catJobId={catJobId}
          unit_fee={unit_fee}
          unit_quantity={unit_quantity}
          unit_type={unit_type}
          sub_project_id={sub_project_id}
          mode={mode}
          taskViewPricesClass={taskViewPricesClass}
          onFormStateChange={setFormState}
          onSuccess={(volume) => {
            onChangeValue?.(volume)
            closeModal()
          }}
        />
      }
    />
  )
}

export default VolumeChangeModal
