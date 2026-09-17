import { PriceUnits } from './price'
import { DiscountPercentages } from './vendors'
import { VolumeAnalysisBands } from './assignments'

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
  volume_analysis: VolumeAnalysisBands | null
  discounts: DiscountPercentages
  assignment?: any
}
