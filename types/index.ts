// ==================== User Types ====================

export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
}

// ==================== Auth Types ====================

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
}

// ==================== Beneficiary Types ====================

export interface Beneficiary {
  id: number;
  payeeEmail: string;
  payeeAlias: string;
  payeeId?: string;
}

export interface BeneficiaryEnrollRequest {
  payeeEmail: string;
  payeeAlias: string;
}

export interface BeneficiaryEnrollResponse {
  message: string;
  beneficiary?: Beneficiary;
}

// ==================== Payment/Ledger Types ====================

export interface Payment {
  id: string;
  payerId: string;
  payeeId: string;
  amount: number;
  timestamp: string; // ISO-8601 UTC: "2025-12-27T05:53:00.000Z"
  description: string;
  category?: string;
  payer?: UserInfo; // ⭐ Populated by backend aggregation
  payee?: UserInfo; // ⭐ Populated by backend aggregation
  createdAt?: string; // Audit field
  updatedAt?: string; // Audit field
}

export interface PaymentRequest {
  payerId: string;
  payeeId: string;
  amount: number;
  description: string;
  timestamp?: string; // ISO-8601 UTC format
  category?: string;
}

export interface LedgerRecord {
  id: string;
  payerId: string;
  payeeId: string;
  amount: number;
  timestamp: string;
  description: string;
  category?: string;
}

// ⭐ NEW: Ledger API Types
export interface FetchLedgersParams {
  userId: string;
  startDate?: string; // Format: YYYY-MM-DD
  endDate?: string;   // Format: YYYY-MM-DD
}

export interface CreateLedgerRequest {
  payerId: string;
  payeeId: string;
  amount: number;
  description?: string;
  timestamp?: string; // ISO-8601 UTC format
  category?: string;
}

// ==================== API Response Types ====================

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
