import { ReactionTimeMinutes } from 'types/projectRequests'
import { VolumeUnits } from 'types/assignments'

export interface DraftRecipient {
  external_vendor_institution_id: string
  institution_name: string
  email: string
  price?: number
  volume?: number
}

export interface ComposeProjectRequestDraft {
  recipients: DraftRecipient[]
  cascade_mode: boolean
  reaction_time_minutes?: ReactionTimeMinutes
  response_deadline_at?: string
  special_instructions: string
  include_project_files: boolean
  include_price: boolean
  bulk_volume?: number
  bulk_volume_unit?: VolumeUnits
  bulk_price?: number
  file_ids: string[]
}

export const createEmptyDraft = (): ComposeProjectRequestDraft => ({
  recipients: [],
  cascade_mode: false,
  reaction_time_minutes: undefined,
  response_deadline_at: undefined,
  special_instructions: '',
  include_project_files: true,
  include_price: true,
  bulk_volume: undefined,
  bulk_price: undefined,
  file_ids: [],
})

export enum WizardStep {
  VendorSelection = 1,
  RequestConditions = 2,
  RelatedFiles = 3,
  PriceAndVolume = 4,
}

export const WIZARD_STEPS: WizardStep[] = [
  WizardStep.VendorSelection,
  WizardStep.RequestConditions,
  WizardStep.RelatedFiles,
  WizardStep.PriceAndVolume,
]
