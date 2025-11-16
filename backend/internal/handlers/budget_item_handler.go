package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"wedding-planner-backend/internal/models"
	"wedding-planner-backend/internal/services"
)

// BudgetItemHandler handles HTTP requests for budget items
type BudgetItemHandler struct {
	service *services.BudgetItemService
}

// NewBudgetItemHandler creates a new budget item handler
func NewBudgetItemHandler() *BudgetItemHandler {
	return &BudgetItemHandler{
		service: services.NewBudgetItemService(),
	}
}

// GetAll returns all budget items
// GET /api/budget-items
func (h *BudgetItemHandler) GetAll(c *gin.Context) {
	items, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve budget items",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, items)
}

// GetByID returns a specific budget item by ID
// GET /api/budget-items/:id
func (h *BudgetItemHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	item, err := h.service.GetByID(id)
	if err != nil {
		if err.Error() == "budget item not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Budget item not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve budget item",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, item)
}

// Create creates a new budget item
// POST /api/budget-items
func (h *BudgetItemHandler) Create(c *gin.Context) {
	var req models.CreateBudgetItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
			"details": err.Error(),
		})
		return
	}

	// Validate payment status if provided
	if req.PaymentStatus != "" {
		validStatus := false
		for _, s := range models.ValidPaymentStatuses {
			if req.PaymentStatus == s {
				validStatus = true
				break
			}
		}
		if !validStatus {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid payment status",
				"valid_statuses": models.ValidPaymentStatuses,
			})
			return
		}
	}

	item, err := h.service.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create budget item",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, item)
}

// Update updates an existing budget item
// PUT /api/budget-items/:id
func (h *BudgetItemHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateBudgetItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
			"details": err.Error(),
		})
		return
	}

	// Validate payment status if provided
	if req.PaymentStatus != nil {
		validStatus := false
		for _, s := range models.ValidPaymentStatuses {
			if *req.PaymentStatus == s {
				validStatus = true
				break
			}
		}
		if !validStatus {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid payment status",
				"valid_statuses": models.ValidPaymentStatuses,
			})
			return
		}
	}

	item, err := h.service.Update(id, req)
	if err != nil {
		if err.Error() == "budget item not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Budget item not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update budget item",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, item)
}

// Delete deletes a budget item
// DELETE /api/budget-items/:id
func (h *BudgetItemHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	err := h.service.Delete(id)
	if err != nil {
		if err.Error() == "budget item not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Budget item not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete budget item",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Budget item deleted successfully",
	})
}

