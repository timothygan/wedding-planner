package vendor

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/timgan/wedding-planner/internal/domain/shared"
)

func TestNewVendorStatus(t *testing.T) {
	tests := []struct {
		name       string
		input      string
		wantStatus VendorStatus
		wantErr    error
	}{
		{
			name:       "valid status - needs research",
			input:      "needs_research",
			wantStatus: StatusNeedsResearch,
			wantErr:    nil,
		},
		{
			name:       "valid status - booked",
			input:      "booked",
			wantStatus: StatusBooked,
			wantErr:    nil,
		},
		{
			name:       "invalid status - empty string",
			input:      "",
			wantStatus: "",
			wantErr:    shared.ErrInvalidInput,
		},
		{
			name:       "invalid status - unknown value",
			input:      "invalid_status",
			wantStatus: "",
			wantErr:    shared.ErrInvalidInput,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotStatus, gotErr := NewVendorStatus(tt.input)

			assert.Equal(t, tt.wantStatus, gotStatus)
			assert.Equal(t, tt.wantErr, gotErr)
		})
	}
}

func TestVendorStatus_IsValid(t *testing.T) {
	tests := []struct {
		name   string
		status VendorStatus
		want   bool
	}{
		{
			name:   "valid - needs research",
			status: StatusNeedsResearch,
			want:   true,
		},
		{
			name:   "valid - booked",
			status: StatusBooked,
			want:   true,
		},
		{
			name:   "invalid - empty",
			status: VendorStatus(""),
			want:   false,
		},
		{
			name:   "invalid - unknown",
			status: VendorStatus("unknown"),
			want:   false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := tt.status.IsValid()
			assert.Equal(t, tt.want, got)
		})
	}
}
