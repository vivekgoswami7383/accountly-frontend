export interface ApiCustomer {
  _id: string;
  name: string;
  phone: string;
  address?: string;
  balance: number;
  business: { _id: string; business_name: string };
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
  business: { _id: string; business_name: string };
  name: string;
  phone: string;
  address?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  address?: string;
  balance?: string | number;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  transaction_type: 'sent' | 'received';
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransactionRequest {
  business: { _id: string; business_name: string };
  customer: { _id: string; name: string };
  amount: number;
  transaction_type: 'sent' | 'received';
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
  total_sent: number;
  total_received: number;
  pending: number;
  total_transactions: number;
}

export interface RecentCustomer {
  _id: string;
  name: string;
  phone: string;
  balance: number;
  status: number;
  business: { _id: string; business_name: string };
}

export interface ApiTransaction {
  _id: string;
  customer: { _id: string; name: string };
  amount: number;
  transaction_type: 'sent' | 'received';
  description: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStatisticsResponse {
  stats: DashboardStats;
  recent_customers: RecentCustomer[];
  recent_transactions: ApiTransaction[];
}
