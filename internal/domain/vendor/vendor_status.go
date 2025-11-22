package vendor

import (
	"github.com/timgan/wedding-planner/internal/domain/shared"
)

// VendorStatus represents the current status of a vendor in the workflow
type VendorStatus string

const (
	StatusNeedsResearch    VendorStatus = "needs_research"
	StatusNeedToContact    VendorStatus = "need_to_contact"
	StatusInDiscussion     VendorStatus = "in_discussion"
	StatusMovingForward    VendorStatus = "moving_forward"
	StatusNotMovingForward VendorStatus = "not_moving_forward"
	StatusBooked           VendorStatus = "booked"
)

// NewVendorStatus creates a validated VendorStatus
func NewVendorStatus(status string) (VendorStatus, error) {
	vs := VendorStatus(status)
	if !vs.IsValid() {
		return "", shared.ErrInvalidInput
	}
	return vs, nil
}

// IsValid checks if the status is a recognized value
func (vs VendorStatus) IsValid() bool {
	switch vs {
	case StatusNeedsResearch, StatusNeedToContact, StatusInDiscussion,
		StatusMovingForward, StatusNotMovingForward, StatusBooked:
		return true
	default:
		return false
	}
}

// String returns the string representation
func (vs VendorStatus) String() string {
	return string(vs)
}
