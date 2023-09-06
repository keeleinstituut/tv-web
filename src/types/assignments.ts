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
  assigned_vendor_id?: string
  assignee_id?: string
  // TODO: no idea whether it will be skill_ids or sth else
  skill_id: string
  // TODO: no idea if this field will come from here
  finished_at: string
}

// TODO: no idea if this is the correct format
export interface AssignmentPayload {
  candidates_ids?: string[]
  volumes?: VolumeValue[]
}
