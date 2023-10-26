import { PriceUnits } from './price'
import { DiscountPercentages } from './vendors'

// TODO: not sure about the structure here
export interface VolumeValue {
  amount: number
  unit: PriceUnits
  chunkId?: string
  cat_job?: boolean
  discount: DiscountPercentages
  id: string
  assignment_id: string
  unit_type: string
  unit_quantity: string
  unit_fee: number
  updated_at: string
  created_at: string
  job: null | any
  volume_analysis: null | any
}
