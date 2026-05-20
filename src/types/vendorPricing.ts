import { LanguageClassifierValue } from 'types/price'
import { Vendor } from 'types/vendors'

export interface InstitutionPrice {
  id: string
  institution_id: string
  skill_id: string
  src_lang_classifier_value_id: string
  dst_lang_classifier_value_id: string
  character_fee: number
  word_fee: number
  page_fee: number
  minute_fee: number
  hour_fee: number
  minimal_fee: number
  created_at: string
  updated_at: string
  source_language_classifier_value?: LanguageClassifierValue
  destination_language_classifier_value?: LanguageClassifierValue
  skill?: { id: string; name: string }
}

export interface VendorSkillLanguage {
  id: string
  vendor_id: string
  skill_id: string
  src_lang_classifier_value_id: string
  dst_lang_classifier_value_id: string
  created_at: string
  updated_at: string
  vendor?: Vendor
  source_language_classifier_value?: LanguageClassifierValue
  destination_language_classifier_value?: LanguageClassifierValue
  skill?: { id: string; name: string }
}
