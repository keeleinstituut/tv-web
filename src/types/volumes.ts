import { AssignmentType } from './assignments'
import { PriceUnits } from './price'
import { CatAnalysis } from './projects'
import { DiscountPercentages } from './vendors'

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
  volume_analysis?: CatAnalysis
  discounts: DiscountPercentages
  assignment?: Omit<AssignmentType, 'volumes'>
}
