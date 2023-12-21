import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import React, { ReactElement, useEffect, useState } from 'react'
import ProgressBar from 'components/atoms/ProgressBar/ProgressBar'
import { filter, find, isEmpty, map, size, keys, includes } from 'lodash'
import { Control, FieldValues, useFormState } from 'react-hook-form'

import classes from './classes.module.scss'

interface FormDataProps {
  label: string
  title: string
  helperText: string
  modalContent: ReactElement | string
  buttonComponent?: ReactElement
  showOnly?: boolean
}
export interface FormProgressProps<TFormValues extends FieldValues> {
  formData?: FormDataProps[]
  isModalOpen?: boolean
  closeModal: () => void
  submitForm?: () => void
  resetForm?: () => void
  buttonComponent?: ReactElement
  control?: Control<TFormValues>
}

interface PotentialErrorType {
  src_lang_classifier_value_id?: string
  dst_lang_classifier_value_id?: string
  priceObject?: {
    [key: string]: {
      isSelected: string
      [key: string]: string
    }
  }
}

function FormProgressModal<TFormValues extends FieldValues>({
  formData,
  isModalOpen,
  closeModal,
  submitForm,
  resetForm,
  buttonComponent,
  control,
}: FormProgressProps<TFormValues>) {
  const [activeStep, setActiveStep] = useState(1)

  const formStateErrors = useFormState({ control }).errors
  const typedErrors = formStateErrors?.new as PotentialErrorType

  useEffect(() => {
    if (!isEmpty(typedErrors)) {
      const errorKeys = keys(typedErrors)
      const isErrorOnFirstStep =
        includes(errorKeys, 'src_lang_classifier_value_id') ||
        includes(errorKeys, 'dst_lang_classifier_value_id')
      const priceObjectErrors = typedErrors?.priceObject
      const priceObjectErrorKeys = keys(priceObjectErrors)
      const isErrorOnSecondStep = includes(priceObjectErrorKeys, 'skill_id')
      if (isErrorOnFirstStep) {
        setActiveStep(1)
      } else if (isErrorOnSecondStep) {
        setActiveStep(2)
      }
    }
  }, [typedErrors])

  useEffect(() => {
    if (isModalOpen) {
      setActiveStep(1)
    }
  }, [isModalOpen])

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
      buttonComponent={<>{ButtonComponent}</>}
    >
      <div>{modalContent}</div>
    </ModalBase>
  )
}

export default FormProgressModal
