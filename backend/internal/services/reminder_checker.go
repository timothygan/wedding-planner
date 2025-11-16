package services

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"wedding-planner-backend/internal/db"
	"wedding-planner-backend/internal/models"
)

// ReminderChecker handles checking and processing due reminders
type ReminderChecker struct {
	reminderService *ReminderService
	emailService    *EmailService
}

// NewReminderChecker creates a new reminder checker
func NewReminderChecker() *ReminderChecker {
	return &ReminderChecker{
		reminderService: NewReminderService(),
		emailService:    NewEmailService(),
	}
}

// GetDueReminders returns reminders that are due (remind_at <= now and status = pending)
func (c *ReminderChecker) GetDueReminders() ([]models.Reminder, error) {
	query := `
		SELECT id, task_id, vendor_id, title, message, reminder_type,
		       remind_at, recurrence, notification_channels, status,
		       created_at, updated_at
		FROM reminders
		WHERE status = 'pending' AND remind_at <= CURRENT_TIMESTAMP
		ORDER BY remind_at ASC
	`

	rows, err := db.DB.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query due reminders: %w", err)
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

// ProcessReminder processes a due reminder (sends notifications and handles recurrence)
func (c *ReminderChecker) ProcessReminder(reminder *models.Reminder, userEmail string) error {
	// Parse notification channels
	var channels []string
	if err := json.Unmarshal([]byte(reminder.NotificationChannels), &channels); err != nil {
		return fmt.Errorf("failed to parse notification channels: %w", err)
	}

	// Send email notification if requested
	for _, channel := range channels {
		if channel == "email" && userEmail != "" {
			message := reminder.Title
			if reminder.Message != nil {
				message = *reminder.Message
			}
			if err := c.emailService.SendReminderEmail(userEmail, reminder.Title, message); err != nil {
				// Log error but continue processing
				fmt.Printf("Failed to send email for reminder %s: %v\n", reminder.ID, err)
			}
		}
	}

	// Update reminder status to 'sent'
	status := "sent"
	query := "UPDATE reminders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
	_, err := db.DB.Exec(query, status, reminder.ID)
	if err != nil {
		return fmt.Errorf("failed to update reminder status: %w", err)
	}

	// Handle recurrence - create next reminder if needed
	if reminder.Recurrence != "none" && reminder.Recurrence != "" {
		nextRemindAt, err := c.calculateNextRemindAt(reminder.RemindAt, reminder.Recurrence)
		if err != nil {
			return fmt.Errorf("failed to calculate next remind_at: %w", err)
		}

		// Create new reminder for next occurrence
		createReq := models.CreateReminderRequest{
			TaskID:              reminder.TaskID,
			VendorID:            reminder.VendorID,
			Title:               reminder.Title,
			Message:             reminder.Message,
			ReminderType:        reminder.ReminderType,
			RemindAt:            nextRemindAt,
			Recurrence:          reminder.Recurrence,
			NotificationChannels: channels,
			Status:              "pending",
		}

		_, err = c.reminderService.Create(createReq)
		if err != nil {
			return fmt.Errorf("failed to create recurring reminder: %w", err)
		}
	}

	return nil
}

// calculateNextRemindAt calculates the next reminder time based on recurrence
func (c *ReminderChecker) calculateNextRemindAt(currentTime time.Time, recurrence string) (time.Time, error) {
	switch recurrence {
	case "daily":
		return currentTime.AddDate(0, 0, 1), nil
	case "weekly":
		return currentTime.AddDate(0, 0, 7), nil
	case "monthly":
		return currentTime.AddDate(0, 1, 0), nil
	default:
		return currentTime, fmt.Errorf("unknown recurrence: %s", recurrence)
	}
}

