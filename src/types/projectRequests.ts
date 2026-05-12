export enum ProjectRequestStatus {
  Pending = 'PENDING',
  Accepted = 'ACCEPTED',
  Responded = 'RESPONDED',
  Declined = 'DECLINED',
  Expired = 'EXPIRED',
  Cancelled = 'CANCELLED',
}

import { VolumeUnits } from 'types/assignments'

export type ReactionTimeMinutes = 15 | 30 | 60 | 120 | 180 | 240

export const REACTION_TIME_OPTIONS: ReactionTimeMinutes[] = [
  15, 30, 60, 120, 180, 240,
]

export interface ExternalVendorInstitution {
  id: string
  name: string
  email: string
  phone?: string
}

export interface ProjectRequestRecipient {
  id: string
  external_vendor_institution_id: string
  institution_name: string
  email: string
  phone?: string
  price?: number
  volume?: number
  priority: number
  status: ProjectRequestStatus
  vendor_comment?: string
  tpm_cancellation_comment?: string
  responded_at?: string
}

export interface ProjectRequest {
  id: string
  assignment_id: string
  project_id: string
  project_ext_id?: string
  project_type_name?: string
  language_pair?: string
  cascade_mode: boolean
  reaction_time_minutes?: ReactionTimeMinutes
  response_deadline_at?: string
  special_instructions?: string
  include_project_files: boolean
  include_price: boolean
  bulk_volume?: number
  bulk_volume_unit?: VolumeUnits
  bulk_price?: number
  recipients: ProjectRequestRecipient[]
  status: ProjectRequestStatus
  created_at: string
  cancellation_comment?: string
  requestor_institution_name?: string
  requestor_email?: string
}

export interface CreateProjectRequestPayload {
  assignment_id: string
  cascade_mode: boolean
  reaction_time_minutes?: ReactionTimeMinutes
  response_deadline_at?: string
  special_instructions?: string
  include_project_files: boolean
  include_price: boolean
  bulk_volume?: number
  bulk_volume_unit?: VolumeUnits
  bulk_price?: number
  recipients: Array<{
    external_vendor_institution_id: string
    priority: number
    price?: number
    volume?: number
  }>
  file_ids?: string[]
}

export interface DeclineProjectRequestPayload {
  comment: string
}

export interface CancelProjectRequestPayload {
  comment: string
}

export interface SelectWinningVendorPayload {
  winning_recipient_id: string
  cancellation_comments: Record<string, string>
}

export interface ProjectRequestFilters {
  status?: ProjectRequestStatus
  search?: string
  page?: number
  per_page?: number
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}
