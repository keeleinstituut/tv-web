import { SubProjectFeatures } from './orders'
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

export interface VolumePayload {
  assignment_id: string
  unit_type: string
  unit_quantity: number
  unit_fee: number
}
