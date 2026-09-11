export interface ApiCustomer {
  _id: string;
  name: string;
  phone: string;
  address?: string;
  balance: number;
  business_id: string;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  balance: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  address?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  address?: string;
}

export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  transaction_type: TransactionType;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  customer: { _id: string; name: string };
  amount: number;
  transaction_type: TransactionType;
  description?: string;
}

export interface FilterCondition {
  field_name: string;
  field_value: string;
  operator: string;
}

export interface TransactionFilter {
  search: FilterCondition[][];
}

export interface DashboardStats {
  receivable: number;
  payable: number;
  net: number;
  customer_count: number;
  total_transactions: number;
}

export interface RecentCustomer {
  _id: string;
  name: string;
  phone: string;
  balance: number;
  status: number;
  business_id: string;
}

export interface ApiTransaction {
  _id: string;
  customer: { _id: string; name: string };
  amount: number;
  transaction_type: TransactionType;
  description: string;
  created_at: string;
  updated_at: string;
  balance_after?: number;
}

export interface DashboardStatisticsResponse {
  stats: DashboardStats;
  recent_customers: RecentCustomer[];
  recent_transactions: ApiTransaction[];
}
