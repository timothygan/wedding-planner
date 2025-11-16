package services

import (
	"database/sql"
	"fmt"

	"github.com/google/uuid"

	"wedding-planner-backend/internal/db"
	"wedding-planner-backend/internal/models"
)

// VendorService handles business logic for vendors
type VendorService struct{}

// NewVendorService creates a new vendor service
func NewVendorService() *VendorService {
	return &VendorService{}
}

// GetAll retrieves all vendors with optional filtering
func (s *VendorService) GetAll(category, status, search string) ([]models.Vendor, error) {
	query := `
		SELECT id, name, category, email, phone, website, city, state,
		       starting_price, status, notes, ai_discovery_source,
		       last_communication_at, last_communication_type,
		       created_at, updated_at
		FROM vendors
		WHERE 1=1
	`
	args := []interface{}{}

	if category != "" {
		query += " AND category = ?"
		args = append(args, category)
	}

	if status != "" {
		query += " AND status = ?"
		args = append(args, status)
	}

	if search != "" {
		query += " AND (name LIKE ? OR city LIKE ? OR notes LIKE ?)"
		searchPattern := "%" + search + "%"
		args = append(args, searchPattern, searchPattern, searchPattern)
	}

	query += " ORDER BY created_at DESC"

	rows, err := db.DB.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to query vendors: %w", err)
	}
	defer rows.Close()

	vendors := []models.Vendor{}
	for rows.Next() {
		var v models.Vendor
		err := rows.Scan(
			&v.ID, &v.Name, &v.Category, &v.Email, &v.Phone, &v.Website,
			&v.City, &v.State, &v.StartingPrice, &v.Status, &v.Notes,
			&v.AIDiscoverySource, &v.LastCommunicationAt, &v.LastCommunicationType,
			&v.CreatedAt, &v.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan vendor: %w", err)
		}
		vendors = append(vendors, v)
	}

	return vendors, nil
}

// GetByID retrieves a vendor by ID
func (s *VendorService) GetByID(id string) (*models.Vendor, error) {
	query := `
		SELECT id, name, category, email, phone, website, city, state,
		       starting_price, status, notes, ai_discovery_source,
		       last_communication_at, last_communication_type,
		       created_at, updated_at
		FROM vendors
		WHERE id = ?
	`

	var v models.Vendor
	err := db.DB.QueryRow(query, id).Scan(
		&v.ID, &v.Name, &v.Category, &v.Email, &v.Phone, &v.Website,
		&v.City, &v.State, &v.StartingPrice, &v.Status, &v.Notes,
		&v.AIDiscoverySource, &v.LastCommunicationAt, &v.LastCommunicationType,
		&v.CreatedAt, &v.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("vendor not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query vendor: %w", err)
	}

	return &v, nil
}

// Create creates a new vendor
func (s *VendorService) Create(req models.CreateVendorRequest) (*models.Vendor, error) {
	// Generate UUID for new vendor
	id := uuid.New().String()

	// Set default status if not provided
	status := req.Status
	if status == "" {
		status = "considering"
	}

	query := `
		INSERT INTO vendors (
			id, name, category, email, phone, website, city, state,
			starting_price, status, notes, ai_discovery_source
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := db.DB.Exec(
		query,
		id, req.Name, req.Category, req.Email, req.Phone, req.Website,
		req.City, req.State, req.StartingPrice, status, req.Notes,
		req.AIDiscoverySource,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create vendor: %w", err)
	}

	return s.GetByID(id)
}

// Update updates an existing vendor
func (s *VendorService) Update(id string, req models.UpdateVendorRequest) (*models.Vendor, error) {
	// First, check if vendor exists
	_, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	// Build dynamic update query based on provided fields
	query := "UPDATE vendors SET updated_at = CURRENT_TIMESTAMP"
	args := []interface{}{}

	if req.Name != nil {
		query += ", name = ?"
		args = append(args, *req.Name)
	}
	if req.Category != nil {
		query += ", category = ?"
		args = append(args, *req.Category)
	}
	if req.Email != nil {
		query += ", email = ?"
		args = append(args, *req.Email)
	}
	if req.Phone != nil {
		query += ", phone = ?"
		args = append(args, *req.Phone)
	}
	if req.Website != nil {
		query += ", website = ?"
		args = append(args, *req.Website)
	}
	if req.City != nil {
		query += ", city = ?"
		args = append(args, *req.City)
	}
	if req.State != nil {
		query += ", state = ?"
		args = append(args, *req.State)
	}
	if req.StartingPrice != nil {
		query += ", starting_price = ?"
		args = append(args, *req.StartingPrice)
	}
	if req.Status != nil {
		query += ", status = ?"
		args = append(args, *req.Status)
	}
	if req.Notes != nil {
		query += ", notes = ?"
		args = append(args, *req.Notes)
	}
	if req.AIDiscoverySource != nil {
		query += ", ai_discovery_source = ?"
		args = append(args, *req.AIDiscoverySource)
	}

	query += " WHERE id = ?"
	args = append(args, id)

	_, err = db.DB.Exec(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to update vendor: %w", err)
	}

	// Return updated vendor
	return s.GetByID(id)
}

// Delete deletes a vendor
func (s *VendorService) Delete(id string) error {
	// First, check if vendor exists
	_, err := s.GetByID(id)
	if err != nil {
		return err
	}

	query := "DELETE FROM vendors WHERE id = ?"
	_, err = db.DB.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete vendor: %w", err)
	}

	return nil
}
