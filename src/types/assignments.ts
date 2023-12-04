import {
  CatAnalysis,
  CatJob,
  JobDefinition,
  SubProjectDetail,
} from 'types/projects'
import { DiscountPercentages, Vendor } from './vendors'
import { VolumeValue } from './volumes'

export enum AssignmentStatus {
  New = 'NEW',
  InProgress = 'IN_PROGRESS',
  Done = 'DONE',
}

export enum CandidateStatus {
  New = 'NEW',
  Submitted = 'SUBMITTED_TO_VENDOR',
  Accepted = 'ACCEPTED',
  Done = 'DONE',
}

interface Candidate {
  vendor: Vendor
  price: string
  status: CandidateStatus
}

export interface AssignmentType {
  job_definition: JobDefinition
  id: string
  candidates: Candidate[]
  volumes?: VolumeValue[]
  cat_jobs?: CatJob[]
  assigned_vendor_id?: string
  assignee?: Vendor
  assignee_comments?: string
  sub_project_id: string
  deadline_at?: string
  event_start_at?: string
  created_at: string
  ext_id: string
  updated_at: string
  status: AssignmentStatus
  subProject?: Partial<SubProjectDetail>
  // TODO: no idea whether it will be skill_ids or sth else
  skill_id: string
  // TODO: no idea if this field will come from here
  finished_at: string
  assigned_chunks: string[]
  comments: string
  price: string
}

// TODO: no idea if this is the correct format
export interface AssignmentPayload {
  vendor_id?: string
  finished_at?: string | null
  volumes?: VolumeValue[]
  comments?: string
  deadline_at?: string
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
  assignment_id?: string
  unit_type: VolumeUnits
  unit_quantity: number
  unit_fee: number
}

export interface CatVolumePayload {
  assignment_id?: string
  cat_tool_job_id: string
  unit_fee: number
  custom_volume_analysis?: CatAnalysis
  discounts: DiscountPercentages
}

export interface CompleteAssignmentPayload {
  accepted?: boolean
  final_file_id?: string[]
}
