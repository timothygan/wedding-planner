package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"wedding-planner-backend/internal/models"
	"wedding-planner-backend/internal/services"
)

// TaskHandler handles HTTP requests for tasks
type TaskHandler struct {
	service *services.TaskService
}

// NewTaskHandler creates a new task handler
func NewTaskHandler() *TaskHandler {
	return &TaskHandler{
		service: services.NewTaskService(),
	}
}

// GetAll returns all tasks
// GET /api/tasks
func (h *TaskHandler) GetAll(c *gin.Context) {
	tasks, err := h.service.GetAll()
	if err != nil {
		respondWithInternalError(c, "retrieve tasks", err)
		return
	}

	c.JSON(http.StatusOK, tasks)
}

// GetByID returns a specific task by ID
// GET /api/tasks/:id
func (h *TaskHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	task, err := h.service.GetByID(id)
	if err != nil {
		if err.Error() == "task not found" {
			respondWithNotFound(c, "Task")
			return
		}
		respondWithInternalError(c, "retrieve task", err)
		return
	}

	c.JSON(http.StatusOK, task)
}

// Create creates a new task
// POST /api/tasks
func (h *TaskHandler) Create(c *gin.Context) {
	var req models.CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate priority if provided
	if req.Priority != "" && !validateEnum(req.Priority, models.ValidTaskPriorities) {
		respondWithValidationError(c, "priority", models.ValidTaskPriorities)
		return
	}

	// Validate status if provided
	if req.Status != "" && !validateEnum(req.Status, models.ValidTaskStatuses) {
		respondWithValidationError(c, "status", models.ValidTaskStatuses)
		return
	}

	// Validate timeline phase if provided
	if req.TimelinePhase != nil && !validateEnum(*req.TimelinePhase, models.ValidTimelinePhases) {
		respondWithValidationError(c, "timeline_phase", models.ValidTimelinePhases)
		return
	}

	task, err := h.service.Create(req)
	if err != nil {
		respondWithInternalError(c, "create task", err)
		return
	}

	c.JSON(http.StatusCreated, task)
}

// Update updates an existing task
// PUT /api/tasks/:id
func (h *TaskHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate priority if provided
	if !validateEnumPtr(req.Priority, models.ValidTaskPriorities) {
		respondWithValidationError(c, "priority", models.ValidTaskPriorities)
		return
	}

	// Validate status if provided
	if !validateEnumPtr(req.Status, models.ValidTaskStatuses) {
		respondWithValidationError(c, "status", models.ValidTaskStatuses)
		return
	}

	// Validate timeline phase if provided
	if req.TimelinePhase != nil && !validateEnum(*req.TimelinePhase, models.ValidTimelinePhases) {
		respondWithValidationError(c, "timeline_phase", models.ValidTimelinePhases)
		return
	}

	task, err := h.service.Update(id, req)
	if err != nil {
		if err.Error() == "task not found" {
			respondWithNotFound(c, "Task")
			return
		}
		respondWithInternalError(c, "update task", err)
		return
	}

	c.JSON(http.StatusOK, task)
}

// Delete deletes a task
// DELETE /api/tasks/:id
func (h *TaskHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	err := h.service.Delete(id)
	if err != nil {
		if err.Error() == "task not found" {
			respondWithNotFound(c, "Task")
			return
		}
		respondWithInternalError(c, "delete task", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Task deleted successfully",
	})
}

