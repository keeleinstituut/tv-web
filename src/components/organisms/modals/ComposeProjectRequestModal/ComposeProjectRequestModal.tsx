import { FC, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { map } from 'lodash'
import dayjs from 'dayjs'
import { Root } from '@radix-ui/react-form'

import ModalBase, {
  ButtonPositionTypes,
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import { AppearanceTypes } from 'components/molecules/Button/Button'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useCreateOutsourceRequest } from 'hooks/requests/useProjectRequests'
import {
  CreateOutsourceRequestPayload,
  OutsourceRequestMode,
  OutsourceRequestPriceMode,
} from 'types/outsourceRequests'

import StepIndicator from './StepIndicator'
import Step1VendorSelection from './Step1VendorSelection'
import Step2RequestConditions from './Step2RequestConditions'
import Step3RelatedFiles from './Step3RelatedFiles'
import Step4PriceAndVolume from './Step4PriceAndVolume'
import {
  ComposeProjectRequestDraft,
  WIZARD_STEPS,
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
  const { createOutsourceRequest, isLoading } = useCreateOutsourceRequest()

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

  const currentIndex = WIZARD_STEPS.indexOf(step)
  const isLastStep = currentIndex === WIZARD_STEPS.length - 1
  const isFirstStep = currentIndex === 0

  const canAdvance = (() => {
    if (step === WizardStep.VendorSelection) return draft.recipients.length > 0
    if (step === WizardStep.RequestConditions) {
      if (draft.cascade_mode) return draft.reaction_time_minutes !== undefined
      if (!draft.response_deadline_at) return false
      return dayjs(draft.response_deadline_at).isAfter(dayjs())
    }
    return true
  })()

  const handleNext = useCallback(async () => {
    if (!isLastStep) {
      setStep(WIZARD_STEPS[currentIndex + 1])
      return
    }

    const mode = draft.cascade_mode
      ? OutsourceRequestMode.Cascade
      : OutsourceRequestMode.Parallel

    let reactionTimeMinutes: number | undefined
    if (mode === OutsourceRequestMode.Cascade) {
      reactionTimeMinutes = draft.reaction_time_minutes
    } else if (draft.response_deadline_at) {
      const diffMs = dayjs(draft.response_deadline_at).diff(dayjs())
      reactionTimeMinutes = Math.max(1, Math.round(diffMs / 60_000))
    }

    if (!reactionTimeMinutes) {
      showNotification({
        type: NotificationTypes.Error,
        title: t('notification.error'),
        content: t('requests.reaction_time_required'),
      })
      return
    }

    const payload: CreateOutsourceRequestPayload = {
      assignment_id: assignmentId,
      mode,
      reaction_time_minutes: reactionTimeMinutes,
      offers: map(draft.recipients, (r) => ({
        institution_id: r.institution_id,
      })),
      special_instructions: draft.special_instructions || undefined,
      include_source_files: draft.include_source_files,
      price_mode: draft.price_mode,
      price:
        draft.price_mode === OutsourceRequestPriceMode.FixedPrice
          ? draft.price
          : undefined,
      request_files: files.length > 0 ? files : undefined,
    }

    try {
      await createOutsourceRequest(payload)
      showNotification({
        type: NotificationTypes.Success,
        title: t('notification.announcement'),
        content: t('requests.send_success'),
      })
      closeModal()
      reset()
    } catch (error) {
      showValidationErrorMessage(error)
    }
  }, [
    isLastStep,
    currentIndex,
    assignmentId,
    draft,
    files,
    createOutsourceRequest,
    t,
    closeModal,
    reset,
  ])

  const handleBack = useCallback(() => {
    if (!isFirstStep) {
      setStep(WIZARD_STEPS[currentIndex - 1])
    }
  }, [isFirstStep, currentIndex])

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
          onClick: isFirstStep ? handleCancel : handleBack,
        },
        {
          appearance: AppearanceTypes.Primary,
          children: isLastStep
            ? t('requests.send_button')
            : t('requests.next_step'),
          onClick: handleNext,
          disabled: !canAdvance || (isLoading && isLastStep),
          loading: isLoading && isLastStep,
        },
      ]}
    >
      <Root onSubmit={(e) => e.preventDefault()}>
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
      </Root>
    </ModalBase>
  )
}

export default ComposeProjectRequestModal
