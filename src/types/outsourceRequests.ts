import { AssignmentType } from 'types/assignments'

export enum OutsourceRequestPriceMode {
  PricelistBased = 'PRICELIST_BASED',
  FixedPrice = 'FIXED_PRICE',
  AskForPrice = 'ASK_FOR_PRICE',
}

export enum OutsourceRequestMode {
  Cascade = 'CASCADE',
  Parallel = 'PARALLEL',
}

export enum OutsourceRequestStatus {
  Active = 'ACTIVE',
  Fulfilled = 'FULFILLED',
  Cancelled = 'CANCELLED',
}

export enum OutsourceOfferStatus {
  RequestPending = 'REQUEST_PENDING',
  RequestSent = 'REQUEST_SENT',
  RequestAccepted = 'REQUEST_ACCEPTED',
  RequestDeclined = 'REQUEST_DECLINED',
  RequestExpired = 'REQUEST_EXPIRED',
  OfferAccepted = 'OFFER_ACCEPTED',
  OfferDeclined = 'OFFER_DECLINED',
}

export type ReactionTimeMinutes = 15 | 30 | 60 | 120 | 180 | 240

export const REACTION_TIME_OPTIONS: ReactionTimeMinutes[] = [
  15, 30, 60, 120, 180, 240,
]

export interface Institution {
  id: string
  name?: string | null
  short_name?: string | null
  email?: string | null
  phone?: string | null
  logo_url?: string | null
  type?: 'INSTITUTION' | 'TRANSLATION_AGENCY' | null
}

export interface InstitutionPartner {
  id: string
  institution_id: string
  partner_institution_id: string
  created_at: string
  updated_at: string
  partner_institution?: Institution | null
}

export interface InstitutionPartnerFilters {
  partner_institution_id?: string[]
  per_page?: number
  page?: number
  sort_by?: 'created_at'
  sort_order?: 'asc' | 'desc'
}

export interface OutsourceOffer {
  id: string
  institution_id: string
  position: number
  status: OutsourceOfferStatus
  notified_at?: string | null
  responded_at?: string | null
  expires_at?: string | null
  price?: number | null
  decline_comment?: string | null
  rejection_comment?: string | null
  response_comment?: string | null
  institution?: Institution | null
  outsource_request?: OutsourceRequest | null
  created_at: string
  updated_at: string
}

export interface OutsourceRequest {
  id: string
  assignment_id: string
  owner_institution?: Institution | null
  mode: OutsourceRequestMode
  price_mode: OutsourceRequestPriceMode
  reaction_time_minutes: number
  deadline_at?: string | null
  special_instructions?: string | null
  price?: number | null
  include_source_files: boolean
  status: OutsourceRequestStatus
  cancellation_reason?: string | null
  is_cascade_exhausted: boolean
  offers?: OutsourceOffer[]
  assignment?: AssignmentType | null
  media?: unknown[] | null
  created_at: string
  updated_at: string
}

export interface CreateOutsourceRequestPayload {
  assignment_id: string
  mode: OutsourceRequestMode
  reaction_time_minutes?: number
  offers: Array<{ institution_id: string }>
  special_instructions?: string
  include_source_files?: boolean
  price_mode: OutsourceRequestPriceMode
  price?: number
  request_files?: File[]
}

export interface AcceptOutsourceRequestPayload {
  price?: number
  response_comment?: string
}

export interface DeclineOutsourceRequestPayload {
  decline_comment: string
}

export interface CancelOutsourceRequestPayload {
  cancellation_reason: string
}

export interface SelectOutsourceOfferPayload {
  offer_id: string
  rejection_comments: Array<{ offer_id: string; rejection_comment: string }>
}

export interface OutsourceOfferFilters {
  q?: string
  assignment_id?: string
  sub_project_id?: string
  project_id?: string
  status?: OutsourceOfferStatus[]
  institution_id?: string
  language_directions?: string[]
  type_classifier_value_ids?: string[]
  per_page?: number
  page?: number
  sort_by?: 'created_at' | 'expires_at'
  sort_order?: 'asc' | 'desc'
}

export interface OutsourceRequestFilters {
  type?: 'INCOMING' | 'OUTGOING'
  status?: OutsourceRequestStatus[]
  offer_status?: OutsourceOfferStatus[]
  assignment_id?: string
  sub_project_id?: string
  project_id?: string
  per_page?: number
  page?: number
  sort_by?: 'created_at'
  sort_order?: 'asc' | 'desc'
  search?: string
}
