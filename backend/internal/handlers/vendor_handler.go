package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"wedding-planner-backend/internal/models"
	"wedding-planner-backend/internal/services"
)

// VendorHandler handles HTTP requests for vendors
type VendorHandler struct {
	service *services.VendorService
}

// NewVendorHandler creates a new vendor handler
func NewVendorHandler() *VendorHandler {
	return &VendorHandler{
		service: services.NewVendorService(),
	}
}

// GetAll returns all vendors with optional filtering
// GET /api/vendors?category=photographer&status=considering&search=name
func (h *VendorHandler) GetAll(c *gin.Context) {
	category := c.Query("category")
	status := c.Query("status")
	search := c.Query("search")

	vendors, err := h.service.GetAll(category, status, search)
	if err != nil {
		respondWithInternalError(c, "retrieve vendors", err)
		return
	}

	c.JSON(http.StatusOK, vendors)
}

// GetByID returns a specific vendor by ID
// GET /api/vendors/:id
func (h *VendorHandler) GetByID(c *gin.Context) {
	id := c.Param("id")

	vendor, err := h.service.GetByID(id)
	if err != nil {
		if err.Error() == "vendor not found" {
			respondWithNotFound(c, "Vendor")
			return
		}
		respondWithInternalError(c, "retrieve vendor", err)
		return
	}

	c.JSON(http.StatusOK, vendor)
}

// Create creates a new vendor
// POST /api/vendors
func (h *VendorHandler) Create(c *gin.Context) {
	var req models.CreateVendorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate category
	if !validateEnum(req.Category, models.ValidCategories) {
		respondWithValidationError(c, "category", models.ValidCategories)
		return
	}

	// Validate status if provided
	if req.Status != "" && !validateEnum(req.Status, models.ValidStatuses) {
		respondWithValidationError(c, "status", models.ValidStatuses)
		return
	}

	vendor, err := h.service.Create(req)
	if err != nil {
		respondWithInternalError(c, "create vendor", err)
		return
	}

	c.JSON(http.StatusCreated, vendor)
}

// Update updates an existing vendor
// PUT /api/vendors/:id
func (h *VendorHandler) Update(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateVendorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		respondWithError(c, http.StatusBadRequest, "Invalid request body", err.Error())
		return
	}

	// Validate category if provided
	if !validateEnumPtr(req.Category, models.ValidCategories) {
		respondWithValidationError(c, "category", models.ValidCategories)
		return
	}

	// Validate status if provided
	if !validateEnumPtr(req.Status, models.ValidStatuses) {
		respondWithValidationError(c, "status", models.ValidStatuses)
		return
	}

	vendor, err := h.service.Update(id, req)
	if err != nil {
		if err.Error() == "vendor not found" {
			respondWithNotFound(c, "Vendor")
			return
		}
		respondWithInternalError(c, "update vendor", err)
		return
	}

	c.JSON(http.StatusOK, vendor)
}

// Delete deletes a vendor
// DELETE /api/vendors/:id
func (h *VendorHandler) Delete(c *gin.Context) {
	id := c.Param("id")

	err := h.service.Delete(id)
	if err != nil {
		if err.Error() == "vendor not found" {
			respondWithNotFound(c, "Vendor")
			return
		}
		respondWithInternalError(c, "delete vendor", err)
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Vendor deleted successfully",
	})
}
