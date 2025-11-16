package services

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"

	"wedding-planner-backend/internal/db"
	"wedding-planner-backend/internal/models"
)

// ReminderService handles business logic for reminders
type ReminderService struct{}

// NewReminderService creates a new reminder service
func NewReminderService() *ReminderService {
	return &ReminderService{}
}

// GetAll retrieves all reminders
func (s *ReminderService) GetAll() ([]models.Reminder, error) {
	query := `
		SELECT id, task_id, vendor_id, title, message, reminder_type,
		       remind_at, recurrence, notification_channels, status,
		       created_at, updated_at
		FROM reminders
		ORDER BY remind_at ASC
	`

	rows, err := db.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query reminders: %w", err)
	}
	defer rows.Close()

	reminders := []models.Reminder{}
	for rows.Next() {
		var r models.Reminder
		var taskID, vendorID, message, recurrence sql.NullString
		var notificationChannelsJSON sql.NullString

		err := rows.Scan(
			&r.ID, &taskID, &vendorID, &r.Title, &message, &r.ReminderType,
			&r.RemindAt, &recurrence, &notificationChannelsJSON, &r.Status,
			&r.CreatedAt, &r.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan reminder: %w", err)
		}

		if taskID.Valid {
			r.TaskID = &taskID.String
		}
		if vendorID.Valid {
			r.VendorID = &vendorID.String
		}
		if message.Valid {
			r.Message = &message.String
		}
		if recurrence.Valid {
			r.Recurrence = recurrence.String
		} else {
			r.Recurrence = "none"
		}
		if notificationChannelsJSON.Valid {
			r.NotificationChannels = notificationChannelsJSON.String
		}

		reminders = append(reminders, r)
	}

	return reminders, nil
}

// GetByID retrieves a reminder by ID
func (s *ReminderService) GetByID(id string) (*models.Reminder, error) {
	query := `
		SELECT id, task_id, vendor_id, title, message, reminder_type,
		       remind_at, recurrence, notification_channels, status,
		       created_at, updated_at
		FROM reminders
		WHERE id = ?
	`

	var r models.Reminder
	var taskID, vendorID, message, recurrence sql.NullString
	var notificationChannelsJSON sql.NullString

	err := db.DB.QueryRow(query, id).Scan(
		&r.ID, &taskID, &vendorID, &r.Title, &message, &r.ReminderType,
		&r.RemindAt, &recurrence, &notificationChannelsJSON, &r.Status,
		&r.CreatedAt, &r.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("reminder not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query reminder: %w", err)
	}

	if taskID.Valid {
		r.TaskID = &taskID.String
	}
	if vendorID.Valid {
		r.VendorID = &vendorID.String
	}
	if message.Valid {
		r.Message = &message.String
	}
	if recurrence.Valid {
		r.Recurrence = recurrence.String
	} else {
		r.Recurrence = "none"
	}
	if notificationChannelsJSON.Valid {
		r.NotificationChannels = notificationChannelsJSON.String
	}

	return &r, nil
}

// Create creates a new reminder
func (s *ReminderService) Create(req models.CreateReminderRequest) (*models.Reminder, error) {
	// Validate that at least one of task_id or vendor_id is provided
	if req.TaskID == nil && req.VendorID == nil {
		return nil, fmt.Errorf("either task_id or vendor_id must be provided")
	}

	id := uuid.New().String()

	// Set defaults
	recurrence := req.Recurrence
	if recurrence == "" {
		recurrence = "none"
	}

	status := req.Status
	if status == "" {
		status = "pending"
	}

	// Marshal notification_channels to JSON
	notificationChannelsJSON, err := json.Marshal(req.NotificationChannels)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal notification_channels: %w", err)
	}

	now := time.Now()

	query := `
		INSERT INTO reminders (
			id, task_id, vendor_id, title, message, reminder_type,
			remind_at, recurrence, notification_channels, status,
			created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	_, err = db.DB.Exec(
		query,
		id, req.TaskID, req.VendorID, req.Title, req.Message, req.ReminderType,
		req.RemindAt, recurrence, string(notificationChannelsJSON), status,
		now, now,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create reminder: %w", err)
	}

	return s.GetByID(id)
}

// Update updates an existing reminder
func (s *ReminderService) Update(id string, req models.UpdateReminderRequest) (*models.Reminder, error) {
	// Check if reminder exists
	_, err := s.GetByID(id)
	if err != nil {
		return nil, err
	}

	query := "UPDATE reminders SET updated_at = CURRENT_TIMESTAMP"
	args := []interface{}{}

	if req.TaskID != nil {
		query += ", task_id = ?"
		args = append(args, *req.TaskID)
	}
	if req.VendorID != nil {
		query += ", vendor_id = ?"
		args = append(args, *req.VendorID)
	}
	if req.Title != nil {
		query += ", title = ?"
		args = append(args, *req.Title)
	}
	if req.Message != nil {
		query += ", message = ?"
		args = append(args, *req.Message)
	}
	if req.ReminderType != nil {
		query += ", reminder_type = ?"
		args = append(args, *req.ReminderType)
	}
	if req.RemindAt != nil {
		query += ", remind_at = ?"
		args = append(args, *req.RemindAt)
	}
	if req.Recurrence != nil {
		query += ", recurrence = ?"
		args = append(args, *req.Recurrence)
	}
	if req.NotificationChannels != nil {
		notificationChannelsJSON, err := json.Marshal(*req.NotificationChannels)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal notification_channels: %w", err)
		}
		query += ", notification_channels = ?"
		args = append(args, string(notificationChannelsJSON))
	}
	if req.Status != nil {
		query += ", status = ?"
		args = append(args, *req.Status)
	}

	query += " WHERE id = ?"
	args = append(args, id)

	_, err = db.DB.Exec(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to update reminder: %w", err)
	}

	return s.GetByID(id)
}

// Delete deletes a reminder
func (s *ReminderService) Delete(id string) error {
	// Check if reminder exists
	_, err := s.GetByID(id)
	if err != nil {
		return err
	}

	query := "DELETE FROM reminders WHERE id = ?"
	_, err = db.DB.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete reminder: %w", err)
	}

	return nil
}

