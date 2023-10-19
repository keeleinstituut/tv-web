import { CatAnalysis, SubProjectFeatures } from './orders'
import { DiscountPercentages, Vendor } from './vendors'
import { VolumeValue } from './volumes'

export enum AssignmentStatus {
  ForwardedToVendor = 'FORWARDED_TO_VENDOR',
  InProgress = 'IN_PROGRESS',
  NotAssigned = 'NOT_ASSIGNED',
  Done = 'DONE',
}

interface Candidate {
  vendor: Vendor
  vendor_id: string
  price: string
  candidate: string
  id: string
}

export interface AssignmentType {
  feature: SubProjectFeatures
  id: string
  candidates: Candidate[]
  volumes?: VolumeValue[]
  assigned_vendor_id?: string
  assignee_id?: string
  sub_project_id: string
  // TODO: no idea whether it will be skill_ids or sth else
  skill_id: string
  // TODO: no idea if this field will come from here
  finished_at: string
  //
  assigned_chunks: string[]
}

// TODO: no idea if this is the correct format
export interface AssignmentPayload {
  vendor_id?: string
  finished_at?: string | null
  volumes?: VolumeValue[]
}

export enum VolumeUnits {
  CHARACTERS = 'CHARACTERS',
  WORDS = 'WORDS',
  PAGES = 'PAGES',
  MINUTES = 'MINUTES',
  HOURS = 'HOURS',
}

export interface ManualVolumePayload {
  id?: string
  assignment_id: string
  unit_type: VolumeUnits
  unit_quantity: number
  unit_fee: number
}

export interface CatVolumePayload {
  assignment_id: string
  cat_tool_job_id: string
  unit_fee: number
  custom_volume_analysis: CatAnalysis
  discounts: DiscountPercentages
}
