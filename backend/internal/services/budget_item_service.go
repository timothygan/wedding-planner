package services

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"

	"wedding-planner-backend/internal/db"
	"wedding-planner-backend/internal/models"
)

// BudgetItemService handles business logic for budget items
type BudgetItemService struct{}

// NewBudgetItemService creates a new budget item service
func NewBudgetItemService() *BudgetItemService {
	return &BudgetItemService{}
}

// GetAll retrieves all budget items
func (s *BudgetItemService) GetAll() ([]models.BudgetItem, error) {
	query := `
		SELECT id, category, vendor_id, estimated_amount, actual_amount,
		       paid_amount, payment_status, deposit_amount, deposit_due_date,
		       final_payment_due_date, notes, created_at, updated_at
		FROM budget_items
		ORDER BY created_at DESC
	`

	rows, err := db.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query budget items: %w", err)
	}
	defer rows.Close()

	items := []models.BudgetItem{}
	for rows.Next() {
		var b models.BudgetItem
		var vendorID, notes sql.NullString
		var depositAmount sql.NullInt64
		var depositDueDate, finalPaymentDueDate sql.NullTime

		err := rows.Scan(
			&b.ID, &b.Category, &vendorID, &b.EstimatedAmount, &b.ActualAmount,
			&b.PaidAmount, &b.PaymentStatus, &depositAmount, &depositDueDate,
			&finalPaymentDueDate, &notes, &b.CreatedAt, &b.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan budget item: %w", err)
		}

		if vendorID.Valid {
			b.VendorID = &vendorID.String
		}
		if depositAmount.Valid {
			amount := int(depositAmount.Int64)
			b.DepositAmount = &amount
		}
		if depositDueDate.Valid {
			b.DepositDueDate = &depositDueDate.Time
		}
		if finalPaymentDueDate.Valid {
			b.FinalPaymentDueDate = &finalPaymentDueDate.Time
		}
		if notes.Valid {
			b.Notes = &notes.String
		}

		items = append(items, b)
	}

	return items, nil
}

// GetByID retrieves a budget item by ID
func (s *BudgetItemService) GetByID(id string) (*models.BudgetItem, error) {
	query := `
		SELECT id, category, vendor_id, estimated_amount, actual_amount,
		       paid_amount, payment_status, deposit_amount, deposit_due_date,
		       final_payment_due_date, notes, created_at, updated_at
		FROM budget_items
		WHERE id = ?
	`

	var b models.BudgetItem
	var vendorID, notes sql.NullString
	var depositAmount sql.NullInt64
	var depositDueDate, finalPaymentDueDate sql.NullTime

	err := db.DB.QueryRow(query, id).Scan(
		&b.ID, &b.Category, &vendorID, &b.EstimatedAmount, &b.ActualAmount,
		&b.PaidAmount, &b.PaymentStatus, &depositAmount, &depositDueDate,
		&finalPaymentDueDate, &notes, &b.CreatedAt, &b.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("budget item not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query budget item: %w", err)
	}

	if vendorID.Valid {
		b.VendorID = &vendorID.String
	}
	if depositAmount.Valid {
		amount := int(depositAmount.Int64)
		b.DepositAmount = &amount
	}
	if depositDueDate.Valid {
		b.DepositDueDate = &depositDueDate.Time
	}
	if finalPaymentDueDate.Valid {
		b.FinalPaymentDueDate = &finalPaymentDueDate.Time
	}
	if notes.Valid {
		b.Notes = &notes.String
	}

	return &b, nil
}

// Create creates a new budget item
func (s *BudgetItemService) Create(req models.CreateBudgetItemRequest) (*models.BudgetItem, error) {
	id := uuid.New().String()

	// Set defaults
	paymentStatus := req.PaymentStatus
	if paymentStatus == "" {
		paymentStatus = "unpaid"
	}

	now := time.Now()

	query := `
		INSERT INTO budget_items (
			id, category, vendor_id, estimated_amount, actual_amount,
			paid_amount, payment_status, deposit_amount, deposit_due_date,
			final_payment_due_date, notes, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := db.DB.Exec(
		query,
		id, req.Category, req.VendorID, req.EstimatedAmount, req.ActualAmount,
		req.PaidAmount, paymentStatus, req.DepositAmount, req.DepositDueDate,
		req.FinalPaymentDueDate, req.Notes, now, now,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create budget item: %w", err)
	}

	return s.GetByID(id)
}

// Update updates an existing budget item
func (s *BudgetItemService) Update(id string, req models.UpdateBudgetItemRequest) (*models.BudgetItem, error) {
	// Check if budget item exists
	_, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	query := "UPDATE budget_items SET updated_at = CURRENT_TIMESTAMP"
	args := []interface{}{}

	if req.Category != nil {
		query += ", category = ?"
		args = append(args, *req.Category)
	}
	if req.VendorID != nil {
		query += ", vendor_id = ?"
		args = append(args, *req.VendorID)
	}
	if req.EstimatedAmount != nil {
		query += ", estimated_amount = ?"
		args = append(args, *req.EstimatedAmount)
	}
	if req.ActualAmount != nil {
		query += ", actual_amount = ?"
		args = append(args, *req.ActualAmount)
	}
	if req.PaidAmount != nil {
		query += ", paid_amount = ?"
		args = append(args, *req.PaidAmount)
	}
	if req.PaymentStatus != nil {
		query += ", payment_status = ?"
		args = append(args, *req.PaymentStatus)
	}
	if req.DepositAmount != nil {
		query += ", deposit_amount = ?"
		args = append(args, *req.DepositAmount)
	}
	if req.DepositDueDate != nil {
		query += ", deposit_due_date = ?"
		args = append(args, *req.DepositDueDate)
	}
	if req.FinalPaymentDueDate != nil {
		query += ", final_payment_due_date = ?"
		args = append(args, *req.FinalPaymentDueDate)
	}
	if req.Notes != nil {
		query += ", notes = ?"
		args = append(args, *req.Notes)
	}

	query += " WHERE id = ?"
	args = append(args, id)

	_, err = db.DB.Exec(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to update budget item: %w", err)
	}

	return s.GetByID(id)
}

// Delete deletes a budget item
func (s *BudgetItemService) Delete(id string) error {
	// Check if budget item exists
	_, err := s.GetByID(id)
	if err != nil {
		return err
	}

	query := "DELETE FROM budget_items WHERE id = ?"
	_, err = db.DB.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete budget item: %w", err)
	}

	return nil
}

