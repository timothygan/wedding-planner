export interface BudgetItem {
  id: string;
  category: string;
  vendor_id?: string;
  estimated_amount: number; // in cents
  actual_amount: number; // in cents
  paid_amount: number; // in cents
  payment_status: PaymentStatus;
  deposit_amount?: number; // in cents
  deposit_due_date?: string;
  final_payment_due_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'partially_paid' | 'paid';

export interface CreateBudgetItemRequest {
  category: string;
  vendor_id?: string;
  estimated_amount: number;
  actual_amount?: number;
  paid_amount?: number;
  payment_status?: PaymentStatus;
  deposit_amount?: number;
  deposit_due_date?: string;
  final_payment_due_date?: string;
  notes?: string;
}

export interface UpdateBudgetItemRequest {
  category?: string;
  vendor_id?: string;
  estimated_amount?: number;
  actual_amount?: number;
  paid_amount?: number;
  payment_status?: PaymentStatus;
  deposit_amount?: number;
  deposit_due_date?: string;
  final_payment_due_date?: string;
  notes?: string;
}

