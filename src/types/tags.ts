export enum TagTypes {
  Tolkemalud = 'Tõlkemälud',
  Teostaja = 'Teostaja',
  Tellimus = 'Tellimus',
  Oskused = 'Oskused',
}
export interface TagsResponse {
  data: Tag[]
}

export interface TagsPayload {
  type?: TagTypes
  tags: Partial<Tag>[]
}

export interface Tag {
  id: string
  institution_id: null
  name: string
  type: TagTypes
  created_at: string
  updated_at: string
}
