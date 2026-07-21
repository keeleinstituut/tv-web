import { FilterFunctionType, SortingFunctionType } from './collective'

export type StatisticsType =
  | 'projects_plain'
  | 'projects_extended'
  | 'subprojects_plain'
  | 'subprojects_extended'
  | 'assignments_plain'
  | 'assignments_extended'
export type StatisticsTimeframe = 'daily' | 'monthly' | 'yearly'
export type StatisticsBasis = 'created' | 'completed'

export interface StatisticsParams {
  type: StatisticsType
  timeframe: StatisticsTimeframe
  basis: StatisticsBasis
}

export type StatisticsRow = Record<string, string | number | boolean | null>

export interface StatisticsResponse {
  data: StatisticsRow[]
}

export type StatisticsFilters = StatisticsParams &
  Partial<FilterFunctionType & SortingFunctionType>
