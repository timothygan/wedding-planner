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
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve tasks",
			"details": err.Error(),
		})
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
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Task not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve task",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, task)
}

// Create creates a new task
// POST /api/tasks
func (h *TaskHandler) Create(c *gin.Context) {
	var req models.CreateTaskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
			"details": err.Error(),
		})
		return
	}

	// Validate priority if provided
	if req.Priority != "" {
		validPriority := false
		for _, p := range models.ValidTaskPriorities {
			if req.Priority == p {
				validPriority = true
				break
			}
		}
		if !validPriority {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid priority",
				"valid_priorities": models.ValidTaskPriorities,
			})
			return
		}
	}

	// Validate status if provided
	if req.Status != "" {
		validStatus := false
		for _, s := range models.ValidTaskStatuses {
			if req.Status == s {
				validStatus = true
				break
			}
		}
		if !validStatus {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid status",
				"valid_statuses": models.ValidTaskStatuses,
			})
			return
		}
	}

	// Validate timeline phase if provided
	if req.TimelinePhase != nil {
		validPhase := false
		for _, p := range models.ValidTimelinePhases {
			if *req.TimelinePhase == p {
				validPhase = true
				break
			}
		}
		if !validPhase {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid timeline phase",
				"valid_phases": models.ValidTimelinePhases,
			})
			return
		}
	}

	task, err := h.service.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create task",
			"details": err.Error(),
		})
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
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
			"details": err.Error(),
		})
		return
	}

	// Validate priority if provided
	if req.Priority != nil {
		validPriority := false
		for _, p := range models.ValidTaskPriorities {
			if *req.Priority == p {
				validPriority = true
				break
			}
		}
		if !validPriority {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid priority",
				"valid_priorities": models.ValidTaskPriorities,
			})
			return
		}
	}

	// Validate status if provided
	if req.Status != nil {
		validStatus := false
		for _, s := range models.ValidTaskStatuses {
			if *req.Status == s {
				validStatus = true
				break
			}
		}
		if !validStatus {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid status",
				"valid_statuses": models.ValidTaskStatuses,
			})
			return
		}
	}

	// Validate timeline phase if provided
	if req.TimelinePhase != nil {
		validPhase := false
		for _, p := range models.ValidTimelinePhases {
			if *req.TimelinePhase == p {
				validPhase = true
				break
			}
		}
		if !validPhase {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid timeline phase",
				"valid_phases": models.ValidTimelinePhases,
			})
			return
		}
	}

	task, err := h.service.Update(id, req)
	if err != nil {
		if err.Error() == "task not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Task not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update task",
			"details": err.Error(),
		})
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
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Task not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete task",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Task deleted successfully",
	})
}

