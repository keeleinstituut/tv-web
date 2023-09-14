import { PriceUnits } from './price'

// TODO: not sure about the structure here
export interface VolumeValue {
  amount: number
  unit: PriceUnits
  chunkId?: string
  volumeId?: string
  isCat?: boolean
}
