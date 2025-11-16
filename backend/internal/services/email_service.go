package services

import (
	"fmt"
	"os"

	"github.com/resend/resend-go/v2"
)

// EmailService handles email notifications
type EmailService struct {
	client *resend.Client
	fromEmail string
}

// NewEmailService creates a new email service
func NewEmailService() *EmailService {
	apiKey := os.Getenv("RESEND_API_KEY")
	fromEmail := os.Getenv("RESEND_FROM_EMAIL")
	if fromEmail == "" {
		fromEmail = "wedding-planner@example.com" // Default, should be set in env
	}

	var client *resend.Client
	if apiKey != "" {
		client = resend.NewClient(apiKey)
	}

	return &EmailService{
		client: client,
		fromEmail: fromEmail,
	}
}

// SendReminderEmail sends a reminder email
func (s *EmailService) SendReminderEmail(toEmail, title, message string) error {
	if s.client == nil {
		// Email service not configured, log but don't fail
		fmt.Printf("Email service not configured. Would send to %s: %s - %s\n", toEmail, title, message)
		return nil
	}

	params := &resend.SendEmailRequest{
		From:    s.fromEmail,
		To:      []string{toEmail},
		Subject: fmt.Sprintf("Wedding Reminder: %s", title),
		Html:    fmt.Sprintf("<h2>%s</h2><p>%s</p>", title, message),
	}

	_, err := s.client.Emails.Send(params)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

