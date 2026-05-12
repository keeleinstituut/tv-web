import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { map } from 'lodash'

import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { AppearanceTypes } from 'components/molecules/Button/Button'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useCreateProjectRequest } from 'hooks/requests/useProjectRequests'
import { CreateProjectRequestPayload } from 'types/projectRequests'

import StepIndicator from './StepIndicator'
import Step1VendorSelection from './Step1VendorSelection'
import Step2RequestConditions from './Step2RequestConditions'
import Step3RelatedFiles from './Step3RelatedFiles'
import Step4PriceAndVolume from './Step4PriceAndVolume'
import {
  ComposeProjectRequestDraft,
  WizardStep,
  createEmptyDraft,
} from './types'

export interface ComposeProjectRequestModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  assignmentId: string
}

const ComposeProjectRequestModal: FC<ComposeProjectRequestModalProps> = ({
  isModalOpen,
  closeModal,
  assignmentId,
}) => {
  const { t } = useTranslation()
  const [step, setStep] = useState<WizardStep>(WizardStep.VendorSelection)
  const [draft, setDraft] =
    useState<ComposeProjectRequestDraft>(createEmptyDraft)
  const [files, setFiles] = useState<File[]>([])
  const { createProjectRequest, isLoading } = useCreateProjectRequest()

  const updateDraft = useCallback(
    (patch: Partial<ComposeProjectRequestDraft>) =>
      setDraft((prev) => ({ ...prev, ...patch })),
    []
  )

  const reset = useCallback(() => {
    setStep(WizardStep.VendorSelection)
    setDraft(createEmptyDraft())
    setFiles([])
  }, [])

  const handleCancel = useCallback(() => {
    closeModal()
    reset()
  }, [closeModal, reset])

  const canAdvance = (() => {
    if (step === WizardStep.VendorSelection) return draft.recipients.length > 0
    if (step === WizardStep.RequestConditions) {
      if (draft.cascade_mode) return draft.reaction_time_minutes !== undefined
      return true
    }
    return true
  })()

  const handleNext = useCallback(async () => {
    if (step < WizardStep.PriceAndVolume) {
      setStep((s) => (s + 1) as WizardStep)
      return
    }

    const payload: CreateProjectRequestPayload = {
      assignment_id: assignmentId,
      cascade_mode: draft.cascade_mode,
      reaction_time_minutes: draft.cascade_mode
        ? draft.reaction_time_minutes
        : undefined,
      response_deadline_at: !draft.cascade_mode
        ? draft.response_deadline_at
        : undefined,
      special_instructions: draft.special_instructions || undefined,
      include_project_files: draft.include_project_files,
      include_price: draft.include_price,
      bulk_volume: draft.bulk_volume,
      bulk_volume_unit: draft.bulk_volume_unit,
      bulk_price: draft.bulk_price,
      recipients: map(draft.recipients, (r, index) => ({
        external_vendor_institution_id: r.external_vendor_institution_id,
        priority: index,
        price: r.price,
        volume: r.volume,
      })),
      file_ids: draft.file_ids,
    }

    try {
      await createProjectRequest(payload)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('requests.accept_confirmation'),
      })
      closeModal()
      reset()
    } catch (error) {
      showValidationErrorMessage(error)
    }
  }, [step, assignmentId, draft, createProjectRequest, t, closeModal, reset])

  const handleBack = useCallback(() => {
    if (step > WizardStep.VendorSelection) {
      setStep((s) => (s - 1) as WizardStep)
    }
  }, [step])

  const isLastStep = step === WizardStep.PriceAndVolume

  return (
    <ModalBase
      open={!!isModalOpen}
      titleFont={TitleFontTypes.Gray}
      size={ModalSizeTypes.ExtraLarge}
      buttonsPosition={ButtonPositionTypes.SpaceBetween}
      headComponent={<StepIndicator current={step} />}
      buttons={[
        {
          appearance: AppearanceTypes.Secondary,
          children: t('requests.cancel_button'),
          onClick:
            step === WizardStep.VendorSelection ? handleCancel : handleBack,
        },
        {
          appearance: AppearanceTypes.Primary,
          children: isLastStep
            ? t('requests.send_button')
            : t('requests.next_step'),
          onClick: handleNext,
          disabled: !canAdvance,
          loading: isLoading && isLastStep,
        },
      ]}
    >
      {step === WizardStep.VendorSelection && (
        <Step1VendorSelection
          recipients={draft.recipients}
          onChange={(recipients) => updateDraft({ recipients })}
        />
      )}
      {step === WizardStep.RequestConditions && (
        <Step2RequestConditions draft={draft} onChange={updateDraft} />
      )}
      {step === WizardStep.RelatedFiles && (
        <Step3RelatedFiles
          draft={draft}
          files={files}
          onChange={updateDraft}
          onFilesChange={setFiles}
        />
      )}
      {step === WizardStep.PriceAndVolume && (
        <Step4PriceAndVolume draft={draft} onChange={updateDraft} />
      )}
    </ModalBase>
  )
}

export default ComposeProjectRequestModal
