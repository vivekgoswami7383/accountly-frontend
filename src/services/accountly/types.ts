export type LinkStatus = 'pending' | 'active';

export type LinkLookupStatus = LinkStatus | 'available' | 'unavailable';

export interface LinkRequest {
  id: string;
  business_name: string;
  requested_at: string;
}

export interface BlockedLink {
  id: string;
  business_name: string;
  blocked_at: string;
}

export interface ApiCustomer {
  _id: string;
  name: string;
  phone: string;
  address?: string;
  balance: number;
  business_id: string;
  image_key?: string;
  image_url?: string;
  link_id?: string | null;
  link_status?: LinkStatus | null;
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
  imageUrl: string;
  linkId: string | null;
  linkStatus: LinkStatus | null;
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
  image_key?: string;
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
  balanceAfter?: number;
  attachmentUrl?: string;
  isMirrored?: boolean;
}

export interface CreateTransactionRequest {
  customer: { _id: string; name: string };
  amount: number;
  transaction_type: TransactionType;
  description?: string;
  transaction_date?: string;
  attachment_key?: string;
}

export interface FilterCondition {
  field_name: string;
  field_value: string | string[];
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
  image_url?: string;
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
  attachment_url?: string;
}

export type UploadCategory = 'logo' | 'avatar' | 'customer' | 'attachment';

export interface DashboardStatisticsResponse {
  stats: DashboardStats;
  recent_customers: RecentCustomer[];
  recent_transactions: ApiTransaction[];
}

export type ExpenseCategory = 'food' | 'travel' | 'rent' | 'utilities' | 'shopping' | 'other';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  note: string;
  expenseDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseRequest {
  amount: number;
  category: ExpenseCategory;
  note?: string;
  expense_date?: string;
}

export interface ExpenseFilter {
  search: FilterCondition[][];
  sort?: Record<string, 1 | -1>;
}

export interface ExpenseCategoryTotal {
  category: ExpenseCategory;
  total: number;
  count: number;
}

export interface ExpenseSummary {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  monthCount: number;
  categoryTotals: ExpenseCategoryTotal[];
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  content: string;
}

export interface NoteFilter {
  search: FilterCondition[][];
  sort?: Record<string, 1 | -1>;
}

export interface ReportTotals {
  collected: number;
  given: number;
  net: number;
  transactionCount: number;
}

export interface ReportDailyPoint {
  date: string;
  collected: number;
  given: number;
}

export interface ReportTopCustomer {
  id: string;
  name: string;
  phone: string;
  balance: number;
}

export interface BusinessReport {
  totals: ReportTotals;
  daily: ReportDailyPoint[];
  topCustomers: ReportTopCustomer[];
}
