package models

import (
	"time"
)

// Vendor represents a wedding vendor
type Vendor struct {
	ID                    string     `json:"id"`
	Name                  string     `json:"name" binding:"required"`
	Category              string     `json:"category" binding:"required"`
	Email                 *string    `json:"email,omitempty"`
	Phone                 *string    `json:"phone,omitempty"`
	Website               *string    `json:"website,omitempty"`
	City                  *string    `json:"city,omitempty"`
	State                 *string    `json:"state,omitempty"`
	StartingPrice         *float64   `json:"starting_price,omitempty"`
	Status                string     `json:"status"`
	Notes                 *string    `json:"notes,omitempty"`
	AIDiscoverySource     *string    `json:"ai_discovery_source,omitempty"`
	LastCommunicationAt   *time.Time `json:"last_communication_at,omitempty"`
	LastCommunicationType *string    `json:"last_communication_type,omitempty"`
	CreatedAt             time.Time  `json:"created_at"`
	UpdatedAt             time.Time  `json:"updated_at"`
}

// CreateVendorRequest represents the request body for creating a vendor
type CreateVendorRequest struct {
	Name              string   `json:"name" binding:"required"`
	Category          string   `json:"category" binding:"required"`
	Email             *string  `json:"email"`
	Phone             *string  `json:"phone"`
	Website           *string  `json:"website"`
	City              *string  `json:"city"`
	State             *string  `json:"state"`
	StartingPrice     *float64 `json:"starting_price"`
	Status            string   `json:"status"`
	Notes             *string  `json:"notes"`
	AIDiscoverySource *string  `json:"ai_discovery_source"`
}

// UpdateVendorRequest represents the request body for updating a vendor
type UpdateVendorRequest struct {
	Name              *string  `json:"name"`
	Category          *string  `json:"category"`
	Email             *string  `json:"email"`
	Phone             *string  `json:"phone"`
	Website           *string  `json:"website"`
	City              *string  `json:"city"`
	State             *string  `json:"state"`
	StartingPrice     *float64 `json:"starting_price"`
	Status            *string  `json:"status"`
	Notes             *string  `json:"notes"`
	AIDiscoverySource *string  `json:"ai_discovery_source"`
}

// ValidCategories defines valid vendor categories
var ValidCategories = []string{
	"photographer", "venue", "caterer", "florist", "dj",
	"videographer", "planner", "baker", "designer", "rentals",
}

// ValidStatuses defines valid vendor statuses
var ValidStatuses = []string{
	"considering", "booked", "rejected",
}
