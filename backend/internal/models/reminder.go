package models

import (
	"time"
)

// Reminder represents a reminder for a task or vendor
type Reminder struct {
	ID                  string     `json:"id"`
	TaskID              *string    `json:"task_id,omitempty"`
	VendorID            *string    `json:"vendor_id,omitempty"`
	Title               string     `json:"title" binding:"required"`
	Message             *string    `json:"message,omitempty"`
	ReminderType        string     `json:"reminder_type" binding:"required"`
	RemindAt           time.Time  `json:"remind_at" binding:"required"`
	Recurrence          string     `json:"recurrence"`
	NotificationChannels string    `json:"notification_channels" binding:"required"` // JSON array
	Status              string     `json:"status"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
}

// CreateReminderRequest represents the request body for creating a reminder
type CreateReminderRequest struct {
	TaskID              *string   `json:"task_id"`
	VendorID            *string   `json:"vendor_id"`
	Title               string    `json:"title" binding:"required"`
	Message             *string   `json:"message"`
	ReminderType        string    `json:"reminder_type" binding:"required"`
	RemindAt            time.Time `json:"remind_at" binding:"required"`
	Recurrence          string    `json:"recurrence"`
	NotificationChannels []string  `json:"notification_channels" binding:"required"`
	Status              string    `json:"status"`
}

// UpdateReminderRequest represents the request body for updating a reminder
type UpdateReminderRequest struct {
	TaskID              *string   `json:"task_id"`
	VendorID            *string   `json:"vendor_id"`
	Title               *string   `json:"title"`
	Message             *string   `json:"message"`
	ReminderType        *string   `json:"reminder_type"`
	RemindAt            *time.Time `json:"remind_at"`
	Recurrence          *string   `json:"recurrence"`
	NotificationChannels *[]string `json:"notification_channels"`
	Status              *string   `json:"status"`
}

// ValidReminderTypes defines valid reminder types
var ValidReminderTypes = []string{
	"follow_up", "payment_due", "meeting", "deadline", "custom",
}

// ValidReminderStatuses defines valid reminder statuses
var ValidReminderStatuses = []string{
	"pending", "sent", "dismissed", "snoozed",
}

// ValidRecurrences defines valid recurrence patterns
var ValidRecurrences = []string{
	"none", "daily", "weekly", "monthly",
}

