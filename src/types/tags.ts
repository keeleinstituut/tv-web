export enum TagTypes {
  Tolkemalud = 'Tõlkemälud',
  Teostaja = 'Teostaja',
  Tellimus = 'Tellimus',
  Oskused = 'Oskused',
}

export interface TagFields extends Object {
  id?: string
  institution_id?: string
  name?: string
  type: TagTypes
  created_at?: string
  updated_at?: string
}

export interface TagsResponse {
  data: TagFields[]
}

export interface TagsPayload {
  tags: TagFields[]
}
