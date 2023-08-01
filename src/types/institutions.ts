export interface InstitutionType {
  created_at?: string
  updated_at?: string
  id: string
  email?: string | null
  logo_url?: string | null
  name: string
  phone?: string | null
  short_name?: string | null
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
}
