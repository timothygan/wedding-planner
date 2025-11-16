package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// validateEnum checks if a value is in a list of valid values
// Returns true if valid, false otherwise
func validateEnum(value string, validValues []string) bool {
	for _, v := range validValues {
		if value == v {
			return true
		}
	}
	return false
}

// validateEnumPtr checks if a pointer value is in a list of valid values
// Returns true if valid or nil, false if invalid
func validateEnumPtr(value *string, validValues []string) bool {
	if value == nil {
		return true // nil is valid for optional fields
	}
	return validateEnum(*value, validValues)
}

// respondWithValidationError sends a 400 Bad Request with validation error details
func respondWithValidationError(c *gin.Context, fieldName string, validValues []string) {
	c.JSON(http.StatusBadRequest, gin.H{
		"error":           "Invalid " + fieldName,
		"valid_" + fieldName + "s": validValues,
	})
}

// respondWithError sends an error response
func respondWithError(c *gin.Context, statusCode int, errorMsg string, details ...string) {
	response := gin.H{"error": errorMsg}
	if len(details) > 0 {
		response["details"] = details[0]
	}
	c.JSON(statusCode, response)
}

// respondWithNotFound sends a 404 Not Found response
func respondWithNotFound(c *gin.Context, resourceName string) {
	c.JSON(http.StatusNotFound, gin.H{
		"error": resourceName + " not found",
	})
}

// respondWithInternalError sends a 500 Internal Server Error response
func respondWithInternalError(c *gin.Context, operation string, err error) {
	c.JSON(http.StatusInternalServerError, gin.H{
		"error":   "Failed to " + operation,
		"details": err.Error(),
	})
}

