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
		respondWithInternalError(c, "retrieve budget items", err)
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
			respondWithNotFound(c, "Budget item")
			return
		}
		respondWithInternalError(c, "retrieve budget item", err)
		return
	}

	c.JSON(http.StatusOK, item)
}

// Create creates a new budget item
// POST /api/budget-items
func (h *BudgetItemHandler) Create(c *gin.Context) {
	var req models.CreateBudgetItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate payment status if provided
	if req.PaymentStatus != "" && !validateEnum(req.PaymentStatus, models.ValidPaymentStatuses) {
		respondWithValidationError(c, "payment_status", models.ValidPaymentStatuses)
		return
	}

	item, err := h.service.Create(req)
	if err != nil {
		respondWithInternalError(c, "create budget item", err)
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
		respondWithError(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate payment status if provided
	if !validateEnumPtr(req.PaymentStatus, models.ValidPaymentStatuses) {
		respondWithValidationError(c, "payment_status", models.ValidPaymentStatuses)
		return
	}

	item, err := h.service.Update(id, req)
	if err != nil {
		if err.Error() == "budget item not found" {
			respondWithNotFound(c, "Budget item")
			return
		}
		respondWithInternalError(c, "update budget item", err)
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
			respondWithNotFound(c, "Budget item")
			return
		}
		respondWithInternalError(c, "delete budget item", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Budget item deleted successfully",
	})
}

