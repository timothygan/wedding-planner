package services

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/google/uuid"

	"wedding-planner-backend/internal/db"
	"wedding-planner-backend/internal/models"
)

// TaskService handles business logic for tasks
type TaskService struct{}

// NewTaskService creates a new task service
func NewTaskService() *TaskService {
	return &TaskService{}
}

// GetAll retrieves all tasks
func (s *TaskService) GetAll() ([]models.Task, error) {
	query := `
		SELECT id, title, description, category, vendor_id, due_date,
		       timeline_phase, priority, status, estimated_cost, actual_cost,
		       notes, created_at, updated_at
		FROM tasks
		ORDER BY created_at DESC
	`

	rows, err := db.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query tasks: %w", err)
	}
	defer rows.Close()

	tasks := []models.Task{}
	for rows.Next() {
		var t models.Task
		var description, category, vendorID, timelinePhase, notes sql.NullString
		var dueDate sql.NullTime
		var estimatedCost, actualCost sql.NullInt64

		err := rows.Scan(
			&t.ID, &t.Title, &description, &category, &vendorID, &dueDate,
			&timelinePhase, &t.Priority, &t.Status, &estimatedCost, &actualCost,
			&notes, &t.CreatedAt, &t.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan task: %w", err)
		}

		if description.Valid {
			t.Description = &description.String
		}
		if category.Valid {
			t.Category = &category.String
		}
		if vendorID.Valid {
			t.VendorID = &vendorID.String
		}
		if dueDate.Valid {
			t.DueDate = &dueDate.Time
		}
		if timelinePhase.Valid {
			t.TimelinePhase = &timelinePhase.String
		}
		if notes.Valid {
			t.Notes = &notes.String
		}
		if estimatedCost.Valid {
			cost := int(estimatedCost.Int64)
			t.EstimatedCost = &cost
		}
		if actualCost.Valid {
			cost := int(actualCost.Int64)
			t.ActualCost = &cost
		}

		tasks = append(tasks, t)
	}

	return tasks, nil
}

// GetByID retrieves a task by ID
func (s *TaskService) GetByID(id string) (*models.Task, error) {
	query := `
		SELECT id, title, description, category, vendor_id, due_date,
		       timeline_phase, priority, status, estimated_cost, actual_cost,
		       notes, created_at, updated_at
		FROM tasks
		WHERE id = ?
	`

	var t models.Task
	var description, category, vendorID, timelinePhase, notes sql.NullString
	var dueDate sql.NullTime
	var estimatedCost, actualCost sql.NullInt64

	err := db.DB.QueryRow(query, id).Scan(
		&t.ID, &t.Title, &description, &category, &vendorID, &dueDate,
		&timelinePhase, &t.Priority, &t.Status, &estimatedCost, &actualCost,
		&notes, &t.CreatedAt, &t.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("task not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query task: %w", err)
	}

	if description.Valid {
		t.Description = &description.String
	}
	if category.Valid {
		t.Category = &category.String
	}
	if vendorID.Valid {
		t.VendorID = &vendorID.String
	}
	if dueDate.Valid {
		t.DueDate = &dueDate.Time
	}
	if timelinePhase.Valid {
		t.TimelinePhase = &timelinePhase.String
	}
	if notes.Valid {
		t.Notes = &notes.String
	}
	if estimatedCost.Valid {
		cost := int(estimatedCost.Int64)
		t.EstimatedCost = &cost
	}
	if actualCost.Valid {
		cost := int(actualCost.Int64)
		t.ActualCost = &cost
	}

	return &t, nil
}

// Create creates a new task
func (s *TaskService) Create(req models.CreateTaskRequest) (*models.Task, error) {
	id := uuid.New().String()

	// Set defaults
	priority := req.Priority
	if priority == "" {
		priority = "medium"
	}

	status := req.Status
	if status == "" {
		status = "todo"
	}

	now := time.Now()

	query := `
		INSERT INTO tasks (
			id, title, description, category, vendor_id, due_date,
			timeline_phase, priority, status, estimated_cost, actual_cost,
			notes, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err := db.DB.Exec(
		query,
		id, req.Title, req.Description, req.Category, req.VendorID, req.DueDate,
		req.TimelinePhase, priority, status, req.EstimatedCost, req.ActualCost,
		req.Notes, now, now,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	return s.GetByID(id)
}

// Update updates an existing task
func (s *TaskService) Update(id string, req models.UpdateTaskRequest) (*models.Task, error) {
	// Check if task exists
	_, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	query := "UPDATE tasks SET updated_at = CURRENT_TIMESTAMP"
	args := []interface{}{}

	if req.Title != nil {
		query += ", title = ?"
		args = append(args, *req.Title)
	}
	if req.Description != nil {
		query += ", description = ?"
		args = append(args, *req.Description)
	}
	if req.Category != nil {
		query += ", category = ?"
		args = append(args, *req.Category)
	}
	if req.VendorID != nil {
		query += ", vendor_id = ?"
		args = append(args, *req.VendorID)
	}
	if req.DueDate != nil {
		query += ", due_date = ?"
		args = append(args, *req.DueDate)
	}
	if req.TimelinePhase != nil {
		query += ", timeline_phase = ?"
		args = append(args, *req.TimelinePhase)
	}
	if req.Priority != nil {
		query += ", priority = ?"
		args = append(args, *req.Priority)
	}
	if req.Status != nil {
		query += ", status = ?"
		args = append(args, *req.Status)
	}
	if req.EstimatedCost != nil {
		query += ", estimated_cost = ?"
		args = append(args, *req.EstimatedCost)
	}
	if req.ActualCost != nil {
		query += ", actual_cost = ?"
		args = append(args, *req.ActualCost)
	}
	if req.Notes != nil {
		query += ", notes = ?"
		args = append(args, *req.Notes)
	}

	query += " WHERE id = ?"
	args = append(args, id)

	_, err = db.DB.Exec(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to update task: %w", err)
	}

	return s.GetByID(id)
}

// Delete deletes a task
func (s *TaskService) Delete(id string) error {
	// Check if task exists
	_, err := s.GetByID(id)
	if err != nil {
		return err
	}

	query := "DELETE FROM tasks WHERE id = ?"
	_, err = db.DB.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete task: %w", err)
	}

	return nil
}

