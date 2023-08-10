import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { AppearanceTypes } from 'components/molecules/Button/Button'
import { useTranslation } from 'react-i18next'
import { FC, ReactElement, useState } from 'react'
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar'
import { find, map, size } from 'lodash'

import classes from './classes.module.scss'
import { useForm } from 'react-hook-form'
import { FormValues } from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'

interface FormDataProps {
  label: string
  title: string
  helperText: string
  modalContent: ReactElement | string
}

export interface FormProgressProps {
  formData?: FormDataProps[]
  isModalOpen?: boolean
  closeModal: () => void
  test?: string
}

const FormProgressModal: FC<FormProgressProps> = ({
  formData,
  isModalOpen,
  closeModal,
  test,
}) => {
  const { t } = useTranslation()
  const [activeStep, setActiveStep] = useState(1)
  const steps = map(formData, ({ label }) => {
    return { label }
  })

  const handleProceed = () => {
    if (size(steps) === activeStep) {
      //Todo add form submit
      // submitForm()
      closeModal()
      setActiveStep(1)
    } else {
      setActiveStep(activeStep + 1)
    }
  }
  const handleQuit = () => {
    //Todo add form reset
    //resetForm()
    closeModal()
    setActiveStep(1)
  }

  const modalData = find(formData, (_, index) => index + 1 === activeStep)
  const { title, helperText, modalContent } = modalData || {}

  const { watch } = useForm<FormValues>({})

  const watchfield = watch(['source_language'])

  console.log('watchfield Modal', watchfield)
  console.log('watch', watch())

  return (
    <ModalBase
      title={title}
      titleFont={TitleFontTypes.Gray}
      open={!!isModalOpen}
      buttonsPosition={ButtonPositionTypes.SpaceBetween}
      progressBar={
        steps && <ProgressBar activeStep={activeStep} steps={steps} />
      }
      className={classes.progressBarHelperText}
      size={ModalSizeTypes.Big}
      helperText={helperText}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          onClick: handleQuit,
          children: t('button.quit'),
        },
        {
          appearance: AppearanceTypes.Primary,
          onClick: handleProceed,
          children:
            size(steps) === activeStep ? t('button.save') : t('button.proceed'),
        },
      ]}
    >
      <p>???{watchfield}</p>

      <div>{modalContent}</div>
    </ModalBase>
  )
}

export default FormProgressModal
