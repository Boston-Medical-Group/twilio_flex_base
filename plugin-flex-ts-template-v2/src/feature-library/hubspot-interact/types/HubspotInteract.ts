export interface HubspotContact {
  firstname?: string
  lastname?: string
  phone?: string
  hs_object_id?: string
  email?: string
  reservar_cita?: string
  donotcall?: boolean | string
  numero_de_telefono_adicional?: string
  numero_de_telefono_adicional_?: string
  whatsappoptout?: boolean | string
  country?: string
  createdate?: string
  lastmodifieddate?: string
  [key: string]: any
}

export interface HubspotDeal {
  dealname?: string
  dealstage?: string
  hs_object_id?: string
  reservar_cita?: string
  [key: string]: any
}

export type HubpostContactType = undefined | {
  contact?: HubspotContact,
  deal?: HubspotDeal
}

export type CallCardType = HubpostContactType

export interface HubspotContactRaw {
  id: string
  properties: HubspotContact
  createdAt?: string
  updatedAt?: string
  archived?: boolean
  deal?: HubspotDeal
}