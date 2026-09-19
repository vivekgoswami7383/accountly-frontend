export type ContactType = 'customer' | 'supplier' | 'business' | 'friend' | 'family';

export const CONTACT_TYPES: ContactType[] = ['customer', 'supplier', 'business', 'friend', 'family'];

export interface ApiContact {
  _id: string;
  name: string;
  phone: string;
  address?: string;
  balance: number;
  business_id: string;
  image_key?: string;
  image_url?: string;
  type?: ContactType | null;
  due_date?: string | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Contact {
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
  contactType: ContactType | null;
  dueDate: string | null;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactRequest {
  name: string;
  phone: string;
  address?: string;
  type?: ContactType | null;
}

export interface UpdateContactRequest {
  name?: string;
  phone?: string;
  address?: string;
  image_key?: string;
  type?: ContactType | null;
  due_date?: string | null;
}

export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  id: string;
  contactId: string;
  contactName: string;
  amount: number;
  transaction_type: TransactionType;
  description: string;
  createdAt: string;
  updatedAt: string;
  balanceAfter?: number;
  attachmentUrl?: string;
}

export interface CreateTransactionRequest {
  contact: { _id: string; name: string };
  amount: number;
  transaction_type: TransactionType;
  description?: string;
  transaction_date?: string;
  attachment_key?: string;
  due_date?: string | null;
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
  contact_count: number;
  total_transactions: number;
}

export interface RecentContact {
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
  contact: { _id: string; name: string };
  amount: number;
  transaction_type: TransactionType;
  description: string;
  created_at: string;
  updated_at: string;
  balance_after?: number;
  attachment_url?: string;
}

export type UploadCategory = 'logo' | 'avatar' | 'contact' | 'attachment';

export interface DueBucket {
  count: number;
  amount: number;
}

export interface DueSummary {
  overdue: DueBucket;
  today: DueBucket;
  upcoming: DueBucket;
}

export interface DueListResponse {
  summary: DueSummary;
  overdue: ApiContact[];
  today: ApiContact[];
  upcoming: ApiContact[];
}

export interface DashboardStatisticsResponse {
  due: DueSummary | null;
  stats: DashboardStats;
  recent_contacts: RecentContact[];
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

export interface ReportTopContact {
  id: string;
  name: string;
  phone: string;
  balance: number;
}

export interface BusinessReport {
  totals: ReportTotals;
  daily: ReportDailyPoint[];
  topContacts: ReportTopContact[];
}
