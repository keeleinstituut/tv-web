import { DiscountPercentages } from './vendors'

export interface InstitutionType {
  created_at?: string
  updated_at?: string
  id: string
  email?: string | null
  logo_url?: string | null
  name: string
  phone?: string | null
  short_name?: string | null
  worktime_timezone?: string
  monday_worktime_start?: string
  monday_worktime_end?: string
  tuesday_worktime_start?: string
  tuesday_worktime_end?: string
  wednesday_worktime_start?: string
  wednesday_worktime_end?: string
  thursday_worktime_start?: string
  thursday_worktime_end?: string
  friday_worktime_start?: string
  friday_worktime_end?: string
  saturday_worktime_start?: string
  saturday_worktime_end?: string
  sunday_worktime_start?: string
  sunday_worktime_end?: string
}

export interface InstitutionsDataType {
  data: InstitutionType[]
}
export interface InstitutionDataType {
  data: InstitutionType
}

export interface InstitutionPostType {
  name: string
  short_name?: string | null
  phone?: string | null
  email?: string | null
  worktime_timezone?: string | null
  monday_worktime_start?: string | null
  monday_worktime_end?: string | null
  tuesday_worktime_start?: string | null
  tuesday_worktime_end?: string | null
  wednesday_worktime_start?: string | null
  wednesday_worktime_end?: string | null
  thursday_worktime_start?: string | null
  thursday_worktime_end?: string | null
  friday_worktime_start?: string | null
  friday_worktime_end?: string | null
  saturday_worktime_start?: string | null
  saturday_worktime_end?: string | null
  sunday_worktime_start?: string | null
  sunday_worktime_end?: string | null
}

export enum DayTypes {
  monday = 'monday',
  tuesday = 'tuesday',
  wednesday = 'wednesday',
  thursday = 'thursday',
  friday = 'friday',
  saturday = 'saturday',
  sunday = 'sunday',
}

export interface InstitutionDiscountsDataType {
  data: DiscountPercentages
}
