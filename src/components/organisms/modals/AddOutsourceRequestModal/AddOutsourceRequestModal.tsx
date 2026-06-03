import { FC, ReactElement, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { map } from 'lodash'
import dayjs from 'dayjs'
import { Root } from '@radix-ui/react-form'

import ModalBase, {
  ModalSizeTypes,
  TitleFontTypes,
} from 'components/organisms/ModalBase/ModalBase'
import Button, { AppearanceTypes } from 'components/molecules/Button/Button'
import { showNotification } from 'components/organisms/NotificationRoot/NotificationRoot'
import { NotificationTypes } from 'components/molecules/Notification/Notification'
import { showValidationErrorMessage } from 'api/errorHandler'
import { useCreateOutsourceRequest } from 'hooks/requests/useOutsourceRequests'
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
import Step5Summary from './Step5Summary'
import {
  AddOutsourceRequestDraft,
  WIZARD_STEPS,
  WizardStep,
  createEmptyDraft,
} from './types'
import classes from './classes.module.scss'

export interface AddOutsourceRequestModalProps {
  isModalOpen?: boolean
  closeModal: () => void
  assignmentId: string
  sub_project_id: string
}

const AddOutsourceRequestModal: FC<AddOutsourceRequestModalProps> = ({
  isModalOpen,
  closeModal,
  assignmentId,
  sub_project_id,
}) => {
  const { t } = useTranslation()
  const [step, setStep] = useState<WizardStep>(WizardStep.VendorSelection)
  const [draft, setDraft] =
    useState<AddOutsourceRequestDraft>(createEmptyDraft)
  const [files, setFiles] = useState<File[]>([])
  const { createOutsourceRequest, isLoading } = useCreateOutsourceRequest()

  const updateDraft = useCallback(
    (patch: Partial<AddOutsourceRequestDraft>) =>
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

  const stepConfig = useMemo(
    (): Record<WizardStep, { title: string; helperText: string | ReactElement }> => ({
      [WizardStep.VendorSelection]: {
        title: t('requests.compose_title'),
        helperText: t('requests.select_external_vendors_hint'),
      },
      [WizardStep.RequestConditions]: {
        title: t('requests.wizard_step_2'),
        helperText: t('requests.step2_subtitle'),
      },
      [WizardStep.RelatedFiles]: {
        title: t('requests.step3_title'),
        helperText: t('requests.step3_subtitle'),
      },
      [WizardStep.PriceAndVolume]: {
        title: t('requests.step4_title'),
        helperText: (
          <>
            {t('requests.step4_subtitle_1')}
            <br />
            {t('requests.step4_subtitle_2')}
          </>
        ),
      },
      [WizardStep.Summary]: {
        title: t('requests.step5_title'),
        helperText: '',
      },
    }),
    [t]
  )

  const currentIndex = WIZARD_STEPS.indexOf(step)
  const isLastStep = currentIndex === WIZARD_STEPS.length - 1
  const isFirstStep = currentIndex === 0

  const canAdvance = (() => {
    if (step === WizardStep.VendorSelection) return draft.recipients.length > 0
    if (step === WizardStep.RequestConditions) {
      if (draft.cascade_mode) return draft.reaction_time_minutes !== undefined
      return (
        !!draft.response_deadline_at &&
        dayjs(draft.response_deadline_at).isAfter(dayjs())
      )
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
      title={stepConfig[step].title}
      helperText={stepConfig[step].helperText}
      titleFont={TitleFontTypes.Gray}
      size={ModalSizeTypes.ExtraLarge}
      progressBar={<StepIndicator current={step} />}
      buttonComponent={
        <div className={classes.footer}>
          <Button appearance={AppearanceTypes.Secondary} onClick={handleCancel}>
            {t('requests.cancel_button')}
          </Button>
          <div className={classes.footerRight}>
            {!isFirstStep && (
              <Button appearance={AppearanceTypes.Secondary} onClick={handleBack}>
                {t('requests.prev_step')}
              </Button>
            )}
            <Button
              appearance={AppearanceTypes.Primary}
              onClick={handleNext}
              disabled={!canAdvance || (isLoading && isLastStep)}
              loading={isLoading && isLastStep}
            >
              {isLastStep ? t('requests.send_button') : t('requests.next_step')}
            </Button>
          </div>
        </div>
      }
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
          <Step4PriceAndVolume
            draft={draft}
            onChange={updateDraft}
            assignmentId={assignmentId}
            sub_project_id={sub_project_id}
          />
        )}
        {step === WizardStep.Summary && (
          <Step5Summary
            draft={draft}
            files={files}
            assignmentId={assignmentId}
            sub_project_id={sub_project_id}
            onChange={(recipients) => updateDraft({ recipients })}
          />
        )}
      </Root>
    </ModalBase>
  )
}

export default AddOutsourceRequestModal
