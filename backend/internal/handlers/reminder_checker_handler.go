package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"

	"wedding-planner-backend/internal/services"
)

// ReminderCheckerHandler handles reminder checking endpoints
type ReminderCheckerHandler struct {
	checker *services.ReminderChecker
}

// NewReminderCheckerHandler creates a new reminder checker handler
func NewReminderCheckerHandler() *ReminderCheckerHandler {
	return &ReminderCheckerHandler{
		checker: services.NewReminderChecker(),
	}
}

// GetDueReminders returns reminders that are due
// GET /api/reminders/due
func (h *ReminderCheckerHandler) GetDueReminders(c *gin.Context) {
	reminders, err := h.checker.GetDueReminders()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve due reminders",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, reminders)
}

// ProcessReminder processes a due reminder (sends notifications)
// POST /api/reminders/:id/process
func (h *ReminderCheckerHandler) ProcessReminder(c *gin.Context) {
	id := c.Param("id")
	userEmail := c.Query("email") // Optional user email for email notifications

	reminder, err := services.NewReminderService().GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Reminder not found",
		})
		return
	}

	// Check if reminder is due
	now := time.Now()
	if reminder.RemindAt.After(now) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Reminder is not yet due",
		})
		return
	}

	if reminder.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Reminder has already been processed",
		})
		return
	}

	err = h.checker.ProcessReminder(reminder, userEmail)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to process reminder",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Reminder processed successfully",
	})
}

