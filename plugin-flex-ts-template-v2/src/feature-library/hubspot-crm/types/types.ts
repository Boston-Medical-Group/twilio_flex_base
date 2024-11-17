export interface HubspotContact {
  [key: string]: any;
  hs_object_id?: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
  email?: string;
  reservar_cita?: string;
  donotcall?: boolean | string;
  numero_de_telefono_adicional?: string;
  numero_de_telefono_adicional_?: string;
  whatsappoptout?: boolean | string;
  country?: string;
  createdate?: string;
  lastmodifieddate?: string;
}
