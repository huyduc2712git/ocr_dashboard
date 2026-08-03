export interface ColumnDef {
  field: string;
  type: string;
  key?: string;
  null?: string;
}

export interface DbStatus {
  connected: boolean;
  host: string;
  port: number;
  user: string;
  database: string;
  pingTimeMs?: number;
  tables?: string[];
  totalRows?: number;
  hasImageOcrTable?: boolean;
  isDemoMode: boolean;
  message: string;
  error?: string;
}

export interface TokenUsage {
  input_tokens?: number;
  input_text_tokens?: number;
  input_image_tokens?: number;
  output_tokens?: number;
  total_tokens?: number;
  input_cost?: number;
  output_cost?: number;
  total_cost?: number;
  input_cost_vnd?: number;
  output_cost_vnd?: number;
  total_cost_vnd?: number;
  model_name?: string;
}

export interface OcrRecord {
  id: number | string;
  image_id?: number;
  image_url?: string;
  image_base64?: string;
  name?: string;
  phone?: string;
  address?: string;
  products?: string | any[];
  model_used?: string;
  document_type?: string;
  type?: string;
  status?: string;
  confidence_score?: number;
  accuracy?: number;
  execution_time?: number;
  ocr_text?: string;
  text?: string;
  raw_text?: string;
  ground_truth?: string;
  token_usage?: string | TokenUsage;
  extracted_json?: string | object;
  json_result?: string | object;
  file_name?: string;
  file_size_kb?: number;
  created_at?: string;
  updated_at?: string;
  processed_at?: string;
  [key: string]: any;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse {
  success: boolean;
  databaseName?: string;
  tableName: string;
  columns: ColumnDef[];
  data: OcrRecord[];
  pagination: Pagination;
  availableDatabases?: string[];
  availableTables?: string[];
  isDemoMode: boolean;
  notice?: string;
  source?: string;
}

export type ViewMode = 'table' | 'grid' | 'split';

