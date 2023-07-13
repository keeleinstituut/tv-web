export interface TagType {
  id?: string
  institution_id?: string
  name?: string
  type?: string
  created_at?: string
  updated_at?: string
}

export interface TagsDataType {
  data: TagType[]
}
