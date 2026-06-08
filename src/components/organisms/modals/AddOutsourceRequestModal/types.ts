import { OutsourceRequestPriceMode, ReactionTimeMinutes } from 'types/outsourceRequests'

export interface DraftRecipient {
  institution_id: string
  institution_name: string
}

export interface AddOutsourceRequestDraft {
  recipients: DraftRecipient[]
  cascade_mode: boolean
  reaction_time_minutes?: ReactionTimeMinutes
  response_deadline_at?: string
  special_instructions: string
  include_source_files: boolean
  price_mode: OutsourceRequestPriceMode
  price?: number
}

export const createEmptyDraft = (): AddOutsourceRequestDraft => ({
  recipients: [],
  cascade_mode: false,
  reaction_time_minutes: undefined,
  response_deadline_at: undefined,
  special_instructions: '',
  include_source_files: true,
  price_mode: OutsourceRequestPriceMode.PricelistBased,
})

export enum WizardStep {
  VendorSelection = 1,
  RequestConditions = 2,
  RelatedFiles = 3,
  PriceAndVolume = 4,
  Summary = 5,
}

export const WIZARD_STEPS: WizardStep[] = [
  WizardStep.VendorSelection,
  WizardStep.RequestConditions,
  WizardStep.RelatedFiles,
  WizardStep.PriceAndVolume,
  WizardStep.Summary,
]
