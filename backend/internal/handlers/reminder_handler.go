package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"wedding-planner-backend/internal/models"
	"wedding-planner-backend/internal/services"
)

// ReminderHandler handles HTTP requests for reminders
type ReminderHandler struct {
	service  *services.ReminderService
	checker  *services.ReminderChecker
}

// NewReminderHandler creates a new reminder handler
func NewReminderHandler() *ReminderHandler {
	return &ReminderHandler{
		service: services.NewReminderService(),
		checker: services.NewReminderChecker(),
	}
}

// GetAll returns all reminders
// GET /api/reminders
func (h *ReminderHandler) GetAll(c *gin.Context) {
	reminders, err := h.service.GetAll()
	if err != nil {
		respondWithInternalError(c, "retrieve reminders", err)
		return
	}

	c.JSON(http.StatusOK, reminders)
}

// GetByID returns a specific reminder by ID
// GET /api/reminders/:id
func (h *ReminderHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	reminder, err := h.service.GetByID(id)
	if err != nil {
		if err.Error() == "reminder not found" {
			respondWithNotFound(c, "Reminder")
			return
		}
		respondWithInternalError(c, "retrieve reminder", err)
		return
	}

	c.JSON(http.StatusOK, reminder)
}

// Create creates a new reminder
// POST /api/reminders
func (h *ReminderHandler) Create(c *gin.Context) {
	var req models.CreateReminderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate that at least one of task_id or vendor_id is provided
	if req.TaskID == nil && req.VendorID == nil {
		respondWithError(c, http.StatusBadRequest, "Either task_id or vendor_id must be provided")
		return
	}

	// Validate reminder type
	if !validateEnum(req.ReminderType, models.ValidReminderTypes) {
		respondWithValidationError(c, "reminder_type", models.ValidReminderTypes)
		return
	}

	// Validate recurrence if provided
	if req.Recurrence != "" && !validateEnum(req.Recurrence, models.ValidRecurrences) {
		respondWithValidationError(c, "recurrence", models.ValidRecurrences)
		return
	}

	reminder, err := h.service.Create(req)
	if err != nil {
		respondWithInternalError(c, "create reminder", err)
		return
	}

	c.JSON(http.StatusCreated, reminder)
}

// Update updates an existing reminder
// PUT /api/reminders/:id
func (h *ReminderHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateReminderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate reminder type if provided
	if !validateEnumPtr(req.ReminderType, models.ValidReminderTypes) {
		respondWithValidationError(c, "reminder_type", models.ValidReminderTypes)
		return
	}

	// Validate recurrence if provided
	if !validateEnumPtr(req.Recurrence, models.ValidRecurrences) {
		respondWithValidationError(c, "recurrence", models.ValidRecurrences)
		return
	}

	// Validate status if provided
	if !validateEnumPtr(req.Status, models.ValidReminderStatuses) {
		respondWithValidationError(c, "status", models.ValidReminderStatuses)
		return
	}

	reminder, err := h.service.Update(id, req)
	if err != nil {
		if err.Error() == "reminder not found" {
			respondWithNotFound(c, "Reminder")
			return
		}
		respondWithInternalError(c, "update reminder", err)
		return
	}

	c.JSON(http.StatusOK, reminder)
}

// Delete deletes a reminder
// DELETE /api/reminders/:id
func (h *ReminderHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	err := h.service.Delete(id)
	if err != nil {
		if err.Error() == "reminder not found" {
			respondWithNotFound(c, "Reminder")
			return
		}
		respondWithInternalError(c, "delete reminder", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Reminder deleted successfully",
	})
}

// GetDueReminders returns reminders that are due
// GET /api/reminders/due
func (h *ReminderHandler) GetDueReminders(c *gin.Context) {
	reminders, err := h.checker.GetDueReminders()
	if err != nil {
		respondWithInternalError(c, "retrieve due reminders", err)
		return
	}

	c.JSON(http.StatusOK, reminders)
}

// ProcessReminder processes a due reminder (sends notifications)
// POST /api/reminders/:id/process
func (h *ReminderHandler) ProcessReminder(c *gin.Context) {
	id := c.Param("id")
	userEmail := c.Query("email") // Optional user email for email notifications

	reminder, err := h.service.GetByID(id)
	if err != nil {
		respondWithNotFound(c, "Reminder")
		return
	}

	// Check if reminder is due
	now := time.Now()
	if reminder.RemindAt.After(now) {
		respondWithError(c, http.StatusBadRequest, "Reminder is not yet due")
		return
	}

	if reminder.Status != "pending" {
		respondWithError(c, http.StatusBadRequest, "Reminder has already been processed")
		return
	}

	err = h.checker.ProcessReminder(reminder, userEmail)
	if err != nil {
		respondWithInternalError(c, "process reminder", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Reminder processed successfully",
	})
}

