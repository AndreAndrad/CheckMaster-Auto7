
export enum FieldType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  DATE = 'DATE',
  CHECKBOX = 'CHECKBOX',
  PLATE_IA = 'PLATE_IA',
  IMEI_IA = 'IMEI_IA',
  SINGLE_SELECT = 'SINGLE_SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  VEHICLE_INFO = 'VEHICLE_INFO',
  IMAGE = 'IMAGE',
  PRICE_MANUAL = 'PRICE_MANUAL'
}

export interface Option {
  id: string;
  label: string;
  price?: number;
}

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options?: Option[];
  price?: number; 
}

export interface Template {
  id: string;
  name: string;
  description: string;
  fields: Field[];
  createdAt: number;
}

export interface Submission {
  id: string;
  templateId: string;
  templateName: string;
  data: Record<string, any>;
  totalValue: number;
  date: number;
  thumbnail?: string;
}

export interface AIResult {
  placa?: string;
  marca?: string;
  modelo?: string;
  imei?: string[];
}
