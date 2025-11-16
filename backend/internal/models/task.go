package models

import (
	"time"
)

// Task represents a wedding planning task
type Task struct {
	ID           string     `json:"id"`
	Title        string     `json:"title" binding:"required"`
	Description  *string    `json:"description,omitempty"`
	Category     *string    `json:"category,omitempty"`
	VendorID     *string    `json:"vendor_id,omitempty"`
	DueDate      *time.Time `json:"due_date,omitempty"`
	TimelinePhase *string   `json:"timeline_phase,omitempty"`
	Priority     string     `json:"priority"`
	Status       string     `json:"status"`
	EstimatedCost *int      `json:"estimated_cost,omitempty"` // in cents
	ActualCost   *int       `json:"actual_cost,omitempty"`     // in cents
	Notes        *string    `json:"notes,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`
}

// CreateTaskRequest represents the request body for creating a task
type CreateTaskRequest struct {
	Title         string     `json:"title" binding:"required"`
	Description   *string    `json:"description"`
	Category      *string    `json:"category"`
	VendorID      *string    `json:"vendor_id"`
	DueDate       *time.Time `json:"due_date"`
	TimelinePhase *string    `json:"timeline_phase"`
	Priority      string     `json:"priority"`
	Status        string     `json:"status"`
	EstimatedCost *int       `json:"estimated_cost"`
	ActualCost    *int       `json:"actual_cost"`
	Notes         *string    `json:"notes"`
}

// UpdateTaskRequest represents the request body for updating a task
type UpdateTaskRequest struct {
	Title         *string    `json:"title"`
	Description   *string    `json:"description"`
	Category      *string    `json:"category"`
	VendorID      *string    `json:"vendor_id"`
	DueDate       *time.Time `json:"due_date"`
	TimelinePhase *string    `json:"timeline_phase"`
	Priority      *string    `json:"priority"`
	Status        *string    `json:"status"`
	EstimatedCost *int       `json:"estimated_cost"`
	ActualCost    *int       `json:"actual_cost"`
	Notes         *string    `json:"notes"`
}

// ValidTaskStatuses defines valid task statuses
var ValidTaskStatuses = []string{
	"todo", "in_progress", "waiting", "completed", "cancelled",
}

// ValidTaskPriorities defines valid task priorities
var ValidTaskPriorities = []string{
	"low", "medium", "high", "urgent",
}

// ValidTimelinePhases defines valid timeline phases
var ValidTimelinePhases = []string{
	"12+ months", "9-12 months", "6-9 months", "3-6 months",
	"1-3 months", "1 month", "1 week", "day of",
}

