package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"wedding-planner-backend/internal/models"
	"wedding-planner-backend/internal/services"
)

// ReminderHandler handles HTTP requests for reminders
type ReminderHandler struct {
	service *services.ReminderService
}

// NewReminderHandler creates a new reminder handler
func NewReminderHandler() *ReminderHandler {
	return &ReminderHandler{
		service: services.NewReminderService(),
	}
}

// GetAll returns all reminders
// GET /api/reminders
func (h *ReminderHandler) GetAll(c *gin.Context) {
	reminders, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve reminders",
			"details": err.Error(),
		})
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
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Reminder not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve reminder",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, reminder)
}

// Create creates a new reminder
// POST /api/reminders
func (h *ReminderHandler) Create(c *gin.Context) {
	var req models.CreateReminderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
			"details": err.Error(),
		})
		return
	}

	// Validate that at least one of task_id or vendor_id is provided
	if req.TaskID == nil && req.VendorID == nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Either task_id or vendor_id must be provided",
		})
		return
	}

	// Validate reminder type
	validType := false
	for _, t := range models.ValidReminderTypes {
		if req.ReminderType == t {
			validType = true
			break
		}
	}
	if !validType {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid reminder type",
			"valid_types": models.ValidReminderTypes,
		})
		return
	}

	// Validate recurrence if provided
	if req.Recurrence != "" {
		validRecurrence := false
		for _, r := range models.ValidRecurrences {
			if req.Recurrence == r {
				validRecurrence = true
				break
			}
		}
		if !validRecurrence {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid recurrence",
				"valid_recurrences": models.ValidRecurrences,
			})
			return
		}
	}

	reminder, err := h.service.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create reminder",
			"details": err.Error(),
		})
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
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
			"details": err.Error(),
		})
		return
	}

	// Validate reminder type if provided
	if req.ReminderType != nil {
		validType := false
		for _, t := range models.ValidReminderTypes {
			if *req.ReminderType == t {
				validType = true
				break
			}
		}
		if !validType {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid reminder type",
				"valid_types": models.ValidReminderTypes,
			})
			return
		}
	}

	// Validate recurrence if provided
	if req.Recurrence != nil {
		validRecurrence := false
		for _, r := range models.ValidRecurrences {
			if *req.Recurrence == r {
				validRecurrence = true
				break
			}
		}
		if !validRecurrence {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid recurrence",
				"valid_recurrences": models.ValidRecurrences,
			})
			return
		}
	}

	// Validate status if provided
	if req.Status != nil {
		validStatus := false
		for _, s := range models.ValidReminderStatuses {
			if *req.Status == s {
				validStatus = true
				break
			}
		}
		if !validStatus {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid status",
				"valid_statuses": models.ValidReminderStatuses,
			})
			return
		}
	}

	reminder, err := h.service.Update(id, req)
	if err != nil {
		if err.Error() == "reminder not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Reminder not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update reminder",
			"details": err.Error(),
		})
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
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Reminder not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete reminder",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Reminder deleted successfully",
	})
}

