package shared

import "errors"

var (
	// ErrNotFound indicates a requested resource was not found
	ErrNotFound = errors.New("resource not found")

	// ErrInvalidInput indicates invalid input was provided
	ErrInvalidInput = errors.New("invalid input")
)
