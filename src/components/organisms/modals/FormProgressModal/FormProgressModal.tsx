import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import React, { FC, ReactElement, useEffect, useState } from 'react'
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar'
import { filter, find, isEmpty, keys, map, size } from 'lodash'
import { FormValues } from 'components/organisms/forms/VendorPriceListForm/VendorPriceListForm'
import { Control, useFormState } from 'react-hook-form'

import classes from './classes.module.scss'

interface FormDataProps {
  label: string
  title: string
  helperText: string
  modalContent: ReactElement | string
  buttonComponent?: ReactElement
  showOnly?: boolean
}
export interface FormProgressProps {
  formData?: FormDataProps[]
  isModalOpen?: boolean
  closeModal: () => void
  submitForm?: () => void
  resetForm?: () => void
  buttonComponent?: ReactElement
  control?: Control<FormValues>
}

const FormProgressModal: FC<FormProgressProps> = ({
  formData,
  isModalOpen,
  closeModal,
  submitForm,
  resetForm,
  buttonComponent,
  control,
}) => {
  const [activeStep, setActiveStep] = useState(1)

  const formState = useFormState({ control })
  const formErrors = formState.errors
  const valuesKey = keys(formErrors)[0]

  const isErrorOnFirstStep =
    valuesKey === 'src_lang_classifier_value_id' ||
    valuesKey === 'dst_lang_classifier_value_id' ||
    valuesKey === 'vendor_id'
  const isErrorOnSecondStep = valuesKey === 'skill_id'

  useEffect(() => {
    if (isErrorOnFirstStep) {
      setActiveStep(1)
    }
    if (isErrorOnSecondStep) {
      setActiveStep(2)
    }
    if (isModalOpen) {
      setActiveStep(1)
    }
  }, [isErrorOnFirstStep, isErrorOnSecondStep, isModalOpen])

  const filteredData = filter(formData, 'showOnly')

  const stepData = isEmpty(filteredData) ? formData : filteredData

  const steps = map(stepData, ({ label }) => {
    return { label }
  })

  const handleProceed = () => {
    if (size(steps) === activeStep) {
      if (submitForm) {
        submitForm()
      }
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
  const modalData = find(stepData, (_, index) => index + 1 === activeStep)
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
        size(steps) > 1 ? (
          <ProgressBar
            activeStep={activeStep}
            steps={steps}
            setActiveStep={setActiveStep}
          />
        ) : (
          <div />
        )
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
