import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { FC, ReactElement, useState } from 'react'
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar'
import { find, map, size } from 'lodash'

import classes from './classes.module.scss'
import React from 'react'

interface FormDataProps {
  label: string
  title: string
  helperText: string
  modalContent: ReactElement | string
  buttonComponent?: ReactElement
}

export interface FormProgressProps {
  formData?: FormDataProps[]
  isModalOpen?: boolean
  closeModal: () => void
  submitForm?: () => void
  resetForm?: () => void
  buttonComponent?: ReactElement
}

const FormProgressModal: FC<FormProgressProps> = ({
  formData,
  isModalOpen,
  closeModal,
  submitForm,
  resetForm,
  buttonComponent,
}) => {
  const [activeStep, setActiveStep] = useState(1)
  const steps = map(formData, ({ label }) => {
    return { label }
  })
  const handleProceed = () => {
    if (size(steps) === activeStep) {
      if (submitForm) {
        submitForm()
      }
      closeModal()
      setActiveStep(1)
    } else {
      setActiveStep(activeStep + 1)
    }
  }
  const handleQuit = () => {
    if (resetForm) {
      resetForm()
    }
    closeModal()
    setActiveStep(1)
  }
  const modalData = find(formData, (_, index) => index + 1 === activeStep)
  const { title, helperText, modalContent } = modalData || {}

  const ButtonComponent = buttonComponent
    ? React.cloneElement(buttonComponent, {
        handleProceed: handleProceed,
        handleQuit: handleQuit,
        steps: steps,
        activeStep: activeStep,
      })
    : null

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
      buttonComponent={<div>{ButtonComponent}</div>}
    >
      <div>{modalContent}</div>
    </ModalBase>
  )
}

export default FormProgressModal
