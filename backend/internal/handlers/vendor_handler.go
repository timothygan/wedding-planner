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

// GetAll returns all vendors
// GET /api/vendors
func (h *VendorHandler) GetAll(c *gin.Context) {
	vendors, err := h.service.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve vendors",
			"details": err.Error(),
		})
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
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Vendor not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve vendor",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, vendor)
}

// Create creates a new vendor
// POST /api/vendors
func (h *VendorHandler) Create(c *gin.Context) {
	var req models.CreateVendorRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
			"details": err.Error(),
		})
		return
	}

	// Validate category
	validCategory := false
	for _, cat := range models.ValidCategories {
		if req.Category == cat {
			validCategory = true
			break
		}
	}
	if !validCategory {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid category",
			"valid_categories": models.ValidCategories,
		})
		return
	}

	// Validate status if provided
	if req.Status != "" {
		validStatus := false
		for _, status := range models.ValidStatuses {
			if req.Status == status {
				validStatus = true
				break
			}
		}
		if !validStatus {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid status",
				"valid_statuses": models.ValidStatuses,
			})
			return
		}
	}

	vendor, err := h.service.Create(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create vendor",
			"details": err.Error(),
		})
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
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
			"details": err.Error(),
		})
		return
	}

	// Validate category if provided
	if req.Category != nil {
		validCategory := false
		for _, cat := range models.ValidCategories {
			if *req.Category == cat {
				validCategory = true
				break
			}
		}
		if !validCategory {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid category",
				"valid_categories": models.ValidCategories,
			})
			return
		}
	}

	// Validate status if provided
	if req.Status != nil {
		validStatus := false
		for _, status := range models.ValidStatuses {
			if *req.Status == status {
				validStatus = true
				break
			}
		}
		if !validStatus {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid status",
				"valid_statuses": models.ValidStatuses,
			})
			return
		}
	}

	vendor, err := h.service.Update(id, req)
	if err != nil {
		if err.Error() == "vendor not found" {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Vendor not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to update vendor",
			"details": err.Error(),
		})
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
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Vendor not found",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to delete vendor",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Vendor deleted successfully",
	})
}
