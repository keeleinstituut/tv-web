export interface MTProvider {
  name: string
  label: string
  supports_file_translation: boolean
}

export interface MTDropDownOption {
  value: string
  label: string
}

export interface MTProviderOptions {
  language_combinations: Record<string, Record<string, string[]>>
}

export interface TranslateTextPayload {
  provider: string
  text: string
  source_language: string
  target_language: string
  options?: Record<string, string>
}

export interface TranslateFilePayload {
  provider: string
  file: File
  source_language: string
  target_language: string
  options?: Record<string, string>
}

export type TranslationJobStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'

export interface TranslationJob {
  id: string
  type: 'text' | 'file'
  status: TranslationJobStatus
  provider: string
  source_language: string
  target_language: string
  output_text?: string | null
  original_filename?: string | null
  created_at?: string
}

export interface MTProvidersResponse {
  data: MTProvider[]
}

export interface MTProviderOptionsResponse {
  data: MTProviderOptions
}

export interface MTTextTranslationResponse {
  data: TranslationJob
}

export interface MTFileTranslationResponse {
  data: TranslationJob
}

export interface MTJobsResponse {
  data: TranslationJob[]
}

export interface AzureOpenAISettings {
  endpoint?: string | null
  tenant_id?: string | null
  application_id?: string | null
  deployment?: string | null
  has_api_key?: boolean
  has_client_secret?: boolean
}

export interface AzureOpenAISettingsPayload {
  endpoint?: string | null
  api_key?: string | null
  tenant_id?: string | null
  application_id?: string | null
  client_secret?: string | null
  deployment?: string | null
}

export interface AzureOpenAISettingsResponse {
  data: AzureOpenAISettings | null
}
