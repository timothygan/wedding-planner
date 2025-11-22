package integration

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/assert"

	httphandlers "github.com/timgan/wedding-planner/internal/interfaces/http"
)

func TestHealthEndpointIntegration(t *testing.T) {
	// Setup router as in main.go
	r := chi.NewRouter()
	r.Get("/health", httphandlers.HealthHandler)

	// Create request
	req, err := http.NewRequest("GET", "/health", nil)
	assert.NoError(t, err)

	// Record response
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)

	// Assert
	assert.Equal(t, http.StatusOK, rr.Code)
	assert.JSONEq(t, `{"status":"ok"}`, rr.Body.String())
}
