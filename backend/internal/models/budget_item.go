package models

import (
	"time"
)

// BudgetItem represents a budget item
type BudgetItem struct {
	ID                  string     `json:"id"`
	Category            string     `json:"category" binding:"required"`
	VendorID            *string    `json:"vendor_id,omitempty"`
	EstimatedAmount     int        `json:"estimated_amount"` // in cents
	ActualAmount        int        `json:"actual_amount"`    // in cents
	PaidAmount          int        `json:"paid_amount"`       // in cents
	PaymentStatus       string     `json:"payment_status"`
	DepositAmount       *int       `json:"deposit_amount,omitempty"` // in cents
	DepositDueDate      *time.Time `json:"deposit_due_date,omitempty"`
	FinalPaymentDueDate *time.Time `json:"final_payment_due_date,omitempty"`
	Notes               *string    `json:"notes,omitempty"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
}

// CreateBudgetItemRequest represents the request body for creating a budget item
type CreateBudgetItemRequest struct {
	Category            string     `json:"category" binding:"required"`
	VendorID            *string    `json:"vendor_id"`
	EstimatedAmount     int        `json:"estimated_amount"`
	ActualAmount        int        `json:"actual_amount"`
	PaidAmount          int        `json:"paid_amount"`
	PaymentStatus       string     `json:"payment_status"`
	DepositAmount       *int       `json:"deposit_amount"`
	DepositDueDate      *time.Time `json:"deposit_due_date"`
	FinalPaymentDueDate *time.Time `json:"final_payment_due_date"`
	Notes               *string    `json:"notes"`
}

// UpdateBudgetItemRequest represents the request body for updating a budget item
type UpdateBudgetItemRequest struct {
	Category            *string    `json:"category"`
	VendorID            *string    `json:"vendor_id"`
	EstimatedAmount     *int       `json:"estimated_amount"`
	ActualAmount        *int       `json:"actual_amount"`
	PaidAmount          *int       `json:"paid_amount"`
	PaymentStatus       *string    `json:"payment_status"`
	DepositAmount       *int       `json:"deposit_amount"`
	DepositDueDate      *time.Time `json:"deposit_due_date"`
	FinalPaymentDueDate *time.Time `json:"final_payment_due_date"`
	Notes               *string    `json:"notes"`
}

// ValidPaymentStatuses defines valid payment statuses
var ValidPaymentStatuses = []string{
	"unpaid", "deposit_paid", "partially_paid", "paid",
}

