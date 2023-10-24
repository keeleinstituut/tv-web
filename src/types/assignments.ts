import { CatJob, JobDefinition } from './orders'
import { Vendor } from './vendors'
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
  job_definition: JobDefinition
  id: string
  candidates: Candidate[]
  volumes: VolumeValue[]
  jobs: CatJob[]
  assigned_vendor_id?: string
  assignee?: Vendor
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
