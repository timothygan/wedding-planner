# AI Message Generation Feature Design

**Prompt:** "I'm reviewing the schema we have for this project - everything looks pretty good, but another thing that would be nice to have is an ai auto-generated message based on the follow up or the decision that I need to make. This may require context gathered from an email if the vendor responds"

**Follow-up Changes:**
1. Removed `inspiration_items` table - images are for vendor search only, not mood boards
2. Removed `vendors.style_tags` field - unnecessary for single-user use case, users can view portfolios directly
3. Removed `vendors.services_offered` field - can be tracked in free-form notes field instead
4. Simplified `vendors.status` ENUM to 3 values: 'considering', 'booked', 'rejected'
5. Clarified `vendors.status` and `vendors.category` as ENUMs with CHECK constraints

**Date:** 2025-11-15 16:12

---

## Table of Contents
- [Feature Overview](#feature-overview)
- [Schema Design](#schema-design)
- [AI Integration Strategy](#ai-integration-strategy)
- [API Design](#api-design)
- [Implementation Approach](#implementation-approach)
- [Cost Considerations](#cost-considerations)
- [Next Steps](#next-steps)

---

## Feature Overview

### Goal
Auto-generate contextual messages for vendor communications using AI, based on:
- Previous email threads with the vendor
- Current vendor status and details
- User's intent (follow-up, decision notification, question, etc.)
- Any emails received from vendors

### User Flow
1. User views vendor details or communication history
2. User clicks "Generate Message" and selects message type:
   - Follow-up after initial contact
   - Request for quote
   - Scheduling meeting
   - Notification of decision (booked/rejected)
   - Answer to vendor's question
   - Custom (user provides context)
3. If responding to email, user can paste email content or upload it
4. AI generates message with appropriate tone and context
5. User edits message if needed
6. User copies message or sends directly (future enhancement)

### Value Proposition
- **Saves time:** No need to write from scratch
- **Professional tone:** AI ensures polite, clear communication
- **Context-aware:** Uses vendor details and history
- **Decision support:** Helps formulate responses to vendor emails

---

## Schema Design

### New Table: `communications`

Track communication history with vendors for context in AI message generation.

```sql
CREATE TABLE communications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL,

    -- Communication metadata
    direction TEXT NOT NULL CHECK(direction IN ('sent', 'received')),
    channel TEXT NOT NULL CHECK(channel IN ('email', 'phone', 'text', 'in_person', 'other')),
    subject TEXT,

    -- Content
    message_body TEXT NOT NULL,
    ai_generated BOOLEAN DEFAULT FALSE,

    -- Context for AI
    communication_type TEXT CHECK(communication_type IN (
        'initial_inquiry',
        'follow_up',
        'quote_request',
        'quote_received',
        'meeting_scheduling',
        'decision_notification',
        'question',
        'answer',
        'contract_discussion',
        'payment_discussion',
        'other'
    )),

    -- Tracking
    communicated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Relationships
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

CREATE INDEX idx_communications_vendor_id ON communications(vendor_id);
CREATE INDEX idx_communications_communicated_at ON communications(communicated_at);
```

**Rationale:**
- **direction:** Track whether we sent or received the message
- **channel:** Different channels may require different message styles
- **ai_generated:** Flag to track which messages were AI-generated
- **communication_type:** Helps AI understand context and generate appropriate follow-ups
- **communicated_at:** Separate from created_at to allow retroactive logging

### Schema Update: `vendors` Table

Add quick reference to last communication:

```sql
-- Migration to add to vendors table
ALTER TABLE vendors ADD COLUMN last_communication_at TIMESTAMP;
ALTER TABLE vendors ADD COLUMN last_communication_type TEXT;
```

**Rationale:** Avoid JOIN queries when showing "last contacted" in vendor list view

---

## AI Integration Strategy

### Approach: Structured Tool Calling + Prompt Caching

**Pattern:**
1. User provides intent and any vendor email content
2. Backend retrieves vendor details + communication history
3. Construct Claude API request with:
   - Cached system prompt (message generation rules)
   - Vendor context (name, category, status, notes)
   - Communication history (last 5-10 messages)
   - User intent and any email to respond to
4. Claude generates message with appropriate tone
5. Return to user for editing

### Prompt Design

**System Prompt (cached):**
```
You are a professional wedding planning assistant helping compose vendor communications.

TONE GUIDELINES:
- Professional but warm and friendly
- Clear and concise
- Enthusiastic about the wedding but not overly casual
- Polite and respectful of vendor's time
- Include specific details when available

MESSAGE TYPES:
1. initial_inquiry: Express interest, ask about availability and pricing
2. follow_up: Gentle reminder if no response, or check-in after initial contact
3. quote_request: Request detailed pricing and package information
4. meeting_scheduling: Propose times or confirm meeting details
5. decision_notification: Accept/decline vendor professionally
6. question: Ask specific questions about services
7. answer: Respond to vendor's questions with context

STRUCTURE:
- Greeting with vendor name if known
- Brief context (e.g., "We spoke last week about...")
- Clear purpose of message
- Specific questions or action items
- Closing with next steps
- Professional signature

OUTPUT FORMAT:
Return the message as plain text, ready to copy/paste into email.
Do not include subject line unless specifically requested.
```

**User Message Template:**
```
VENDOR CONTEXT:
- Name: {vendor.name}
- Category: {vendor.category}
- Status: {vendor.status}
- Notes: {vendor.notes}
- Website: {vendor.website}

COMMUNICATION HISTORY:
{last 5 communications with timestamps and message bodies}

MESSAGE TO GENERATE:
Type: {message_type}
User Intent: {user_provided_context}

{if responding to email}
VENDOR'S EMAIL:
{email_content}
{endif}

Generate an appropriate message for this vendor.
```

### Cost Optimization

**Prompt Caching Strategy:**
- Cache system prompt (message generation rules) → ~90% savings
- Cache vendor context if generating multiple messages → Additional savings
- Estimated tokens per request:
  - System prompt: ~400 tokens (cached after first use)
  - Vendor context: ~200-300 tokens
  - Communication history: ~500-1000 tokens (5 messages)
  - Generated message: ~150-300 tokens output

**Monthly Cost Estimate:**
- Assume 20 messages generated per month
- With caching: ~$0.20-0.40/month
- Without caching: ~$2-3/month
- **Recommendation:** Use prompt caching

---

## API Design

### Endpoint: `POST /api/vendors/{vendor_id}/generate-message`

**Request Body:**
```json
{
  "message_type": "follow_up",
  "user_context": "We emailed them last week but haven't heard back. Want to check if they're still available for our date.",
  "vendor_email": "Hi! Thanks for reaching out. We'd love to discuss your wedding. What date are you looking at? - Sarah",
  "include_history": true,
  "max_history_messages": 5
}
```

**Response:**
```json
{
  "success": true,
  "generated_message": "Hi Sarah,\n\nThank you so much for getting back to us! We're excited to learn more about your photography services.\n\nWe're planning our wedding for [date from user profile/task data]. Based on your portfolio, we love your vintage style and attention to detail.\n\nWould you have availability for that date? We'd also appreciate information about your packages and pricing.\n\nLooking forward to hearing from you!\n\nBest,\n[User Name]",
  "tokens_used": 450,
  "cost": 0.0023,
  "cached_tokens": 380
}
```

### Endpoint: `POST /api/communications`

Save communication to history:

**Request Body:**
```json
{
  "vendor_id": 123,
  "direction": "sent",
  "channel": "email",
  "subject": "Wedding Photography Inquiry",
  "message_body": "Hi Sarah...",
  "communication_type": "follow_up",
  "communicated_at": "2025-11-15T10:30:00Z",
  "ai_generated": true
}
```

**Response:**
```json
{
  "success": true,
  "communication": {
    "id": 456,
    "vendor_id": 123,
    "direction": "sent",
    "created_at": "2025-11-15T16:12:00Z"
  }
}
```

### Endpoint: `GET /api/vendors/{vendor_id}/communications`

Retrieve communication history:

**Response:**
```json
{
  "success": true,
  "communications": [
    {
      "id": 456,
      "direction": "received",
      "channel": "email",
      "subject": "Re: Wedding Photography",
      "message_body": "Hi! Thanks for reaching out...",
      "communication_type": "answer",
      "communicated_at": "2025-11-15T09:00:00Z",
      "ai_generated": false
    },
    {
      "id": 455,
      "direction": "sent",
      "channel": "email",
      "message_body": "Hello, we're interested in your services...",
      "communication_type": "initial_inquiry",
      "communicated_at": "2025-11-08T14:30:00Z",
      "ai_generated": false
    }
  ],
  "total": 2
}
```

---

## Implementation Approach

### Phase 1: Database Schema (30 min)
**Files to create/modify:**

1. `backend/migrations/003_create_communications_table.sql`
```sql
-- Migration up
CREATE TABLE communications (
    -- See schema design above
);

-- Migration down
DROP TABLE IF EXISTS communications;
```

2. `backend/migrations/004_add_vendor_communication_fields.sql`
```sql
-- Migration up
ALTER TABLE vendors ADD COLUMN last_communication_at TIMESTAMP;
ALTER TABLE vendors ADD COLUMN last_communication_type TEXT;

-- Migration down
ALTER TABLE vendors DROP COLUMN last_communication_at;
ALTER TABLE vendors DROP COLUMN last_communication_type;
```

### Phase 2: Go Backend Models & Services (1 hour)

**Files to create:**

1. `backend/internal/models/communication.go`
```go
package models

import "time"

type Communication struct {
    ID                 int       `json:"id" db:"id"`
    VendorID           int       `json:"vendor_id" db:"vendor_id"`
    Direction          string    `json:"direction" db:"direction"` // sent, received
    Channel            string    `json:"channel" db:"channel"` // email, phone, etc
    Subject            string    `json:"subject,omitempty" db:"subject"`
    MessageBody        string    `json:"message_body" db:"message_body"`
    AIGenerated        bool      `json:"ai_generated" db:"ai_generated"`
    CommunicationType  string    `json:"communication_type,omitempty" db:"communication_type"`
    CommunicatedAt     time.Time `json:"communicated_at" db:"communicated_at"`
    CreatedAt          time.Time `json:"created_at" db:"created_at"`
    UpdatedAt          time.Time `json:"updated_at" db:"updated_at"`
}

type CreateCommunicationRequest struct {
    VendorID          int       `json:"vendor_id" binding:"required"`
    Direction         string    `json:"direction" binding:"required"`
    Channel           string    `json:"channel" binding:"required"`
    Subject           string    `json:"subject"`
    MessageBody       string    `json:"message_body" binding:"required"`
    CommunicationType string    `json:"communication_type"`
    CommunicatedAt    time.Time `json:"communicated_at" binding:"required"`
    AIGenerated       bool      `json:"ai_generated"`
}

type GenerateMessageRequest struct {
    MessageType       string `json:"message_type" binding:"required"`
    UserContext       string `json:"user_context"`
    VendorEmail       string `json:"vendor_email"`
    IncludeHistory    bool   `json:"include_history"`
    MaxHistoryMessages int   `json:"max_history_messages"`
}

type GenerateMessageResponse struct {
    Success        bool    `json:"success"`
    GeneratedMessage string `json:"generated_message"`
    TokensUsed     int     `json:"tokens_used"`
    Cost           float64 `json:"cost"`
    CachedTokens   int     `json:"cached_tokens"`
}
```

2. `backend/internal/services/communication_service.go`
```go
package services

import (
    "database/sql"
    "wedding-planner/internal/models"
)

type CommunicationService struct {
    db *sql.DB
}

func NewCommunicationService(db *sql.DB) *CommunicationService {
    return &CommunicationService{db: db}
}

func (s *CommunicationService) CreateCommunication(req models.CreateCommunicationRequest) (*models.Communication, error) {
    // Insert into communications table
    // Update vendors.last_communication_at and last_communication_type
    // Return created communication
}

func (s *CommunicationService) GetVendorCommunications(vendorID int, limit int) ([]models.Communication, error) {
    // Query communications by vendor_id
    // Order by communicated_at DESC
    // Limit to N most recent
}

func (s *CommunicationService) GetCommunicationByID(id int) (*models.Communication, error) {
    // Query single communication
}
```

3. `backend/internal/services/message_generator_service.go`
```go
package services

import (
    "context"
    "fmt"
    "strings"
    "wedding-planner/internal/ai"
    "wedding-planner/internal/models"
)

type MessageGeneratorService struct {
    aiClient         *ai.ClaudeClient
    vendorService    *VendorService
    commService      *CommunicationService
}

func NewMessageGeneratorService(
    aiClient *ai.ClaudeClient,
    vendorService *VendorService,
    commService *CommunicationService,
) *MessageGeneratorService {
    return &MessageGeneratorService{
        aiClient:      aiClient,
        vendorService: vendorService,
        commService:   commService,
    }
}

func (s *MessageGeneratorService) GenerateMessage(
    ctx context.Context,
    vendorID int,
    req models.GenerateMessageRequest,
) (*models.GenerateMessageResponse, error) {
    // 1. Get vendor details
    vendor, err := s.vendorService.GetVendorByID(vendorID)
    if err != nil {
        return nil, err
    }

    // 2. Get communication history if requested
    var history []models.Communication
    if req.IncludeHistory {
        limit := req.MaxHistoryMessages
        if limit == 0 {
            limit = 5
        }
        history, _ = s.commService.GetVendorCommunications(vendorID, limit)
    }

    // 3. Build prompt
    prompt := s.buildMessagePrompt(vendor, history, req)

    // 4. Call Claude API with caching
    response, err := s.aiClient.GenerateMessage(ctx, prompt)
    if err != nil {
        return nil, err
    }

    // 5. Return response
    return &models.GenerateMessageResponse{
        Success:          true,
        GeneratedMessage: response.Message,
        TokensUsed:       response.TokensUsed,
        Cost:             response.Cost,
        CachedTokens:     response.CachedTokens,
    }, nil
}

func (s *MessageGeneratorService) buildMessagePrompt(
    vendor *models.Vendor,
    history []models.Communication,
    req models.GenerateMessageRequest,
) string {
    var sb strings.Builder

    sb.WriteString("VENDOR CONTEXT:\n")
    sb.WriteString(fmt.Sprintf("- Name: %s\n", vendor.Name))
    sb.WriteString(fmt.Sprintf("- Category: %s\n", vendor.Category))
    sb.WriteString(fmt.Sprintf("- Status: %s\n", vendor.Status))
    if vendor.Notes != "" {
        sb.WriteString(fmt.Sprintf("- Notes: %s\n", vendor.Notes))
    }
    if vendor.Website != "" {
        sb.WriteString(fmt.Sprintf("- Website: %s\n", vendor.Website))
    }

    if len(history) > 0 {
        sb.WriteString("\nCOMMUNICATION HISTORY (most recent first):\n")
        for _, comm := range history {
            sb.WriteString(fmt.Sprintf("\n[%s - %s via %s]\n%s\n",
                comm.CommunicatedAt.Format("2006-01-02 15:04"),
                comm.Direction,
                comm.Channel,
                comm.MessageBody,
            ))
        }
    }

    sb.WriteString("\nMESSAGE TO GENERATE:\n")
    sb.WriteString(fmt.Sprintf("Type: %s\n", req.MessageType))

    if req.UserContext != "" {
        sb.WriteString(fmt.Sprintf("User Intent: %s\n", req.UserContext))
    }

    if req.VendorEmail != "" {
        sb.WriteString(fmt.Sprintf("\nVENDOR'S EMAIL:\n%s\n", req.VendorEmail))
    }

    sb.WriteString("\nGenerate an appropriate message for this vendor.")

    return sb.String()
}
```

4. `backend/internal/ai/message_generation.go`
```go
package ai

import (
    "context"
)

const messageGenerationSystemPrompt = `You are a professional wedding planning assistant helping compose vendor communications.

TONE GUIDELINES:
- Professional but warm and friendly
- Clear and concise
- Enthusiastic about the wedding but not overly casual
- Polite and respectful of vendor's time
- Include specific details when available

MESSAGE TYPES:
1. initial_inquiry: Express interest, ask about availability and pricing
2. follow_up: Gentle reminder if no response, or check-in after initial contact
3. quote_request: Request detailed pricing and package information
4. meeting_scheduling: Propose times or confirm meeting details
5. decision_notification: Accept/decline vendor professionally
6. question: Ask specific questions about services
7. answer: Respond to vendor's questions with context

STRUCTURE:
- Greeting with vendor name if known
- Brief context (e.g., "We spoke last week about...")
- Clear purpose of message
- Specific questions or action items
- Closing with next steps
- Professional signature

OUTPUT FORMAT:
Return the message as plain text, ready to copy/paste into email.
Do not include subject line unless specifically requested.`

type MessageGenerationResponse struct {
    Message      string
    TokensUsed   int
    Cost         float64
    CachedTokens int
}

func (c *ClaudeClient) GenerateMessage(
    ctx context.Context,
    userPrompt string,
) (*MessageGenerationResponse, error) {
    // Build request with prompt caching
    // System prompt should be cached
    // Call Anthropic API
    // Parse response
    // Calculate cost
    // Return MessageGenerationResponse
}
```

### Phase 3: API Handlers (30 min)

**File:** `backend/internal/handlers/communication_handler.go`

```go
package handlers

import (
    "net/http"
    "strconv"
    "wedding-planner/internal/models"
    "wedding-planner/internal/services"

    "github.com/gin-gonic/gin"
)

type CommunicationHandler struct {
    commService      *services.CommunicationService
    messageGenService *services.MessageGeneratorService
}

func NewCommunicationHandler(
    commService *services.CommunicationService,
    messageGenService *services.MessageGeneratorService,
) *CommunicationHandler {
    return &CommunicationHandler{
        commService:      commService,
        messageGenService: messageGenService,
    }
}

// POST /api/communications
func (h *CommunicationHandler) CreateCommunication(c *gin.Context) {
    var req models.CreateCommunicationRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    communication, err := h.commService.CreateCommunication(req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{
        "success": true,
        "communication": communication,
    })
}

// GET /api/vendors/:id/communications
func (h *CommunicationHandler) GetVendorCommunications(c *gin.Context) {
    vendorID, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid vendor ID"})
        return
    }

    limit := 10 // Default
    if limitStr := c.Query("limit"); limitStr != "" {
        if parsedLimit, err := strconv.Atoi(limitStr); err == nil {
            limit = parsedLimit
        }
    }

    communications, err := h.commService.GetVendorCommunications(vendorID, limit)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "communications": communications,
        "total": len(communications),
    })
}

// POST /api/vendors/:id/generate-message
func (h *CommunicationHandler) GenerateMessage(c *gin.Context) {
    vendorID, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid vendor ID"})
        return
    }

    var req models.GenerateMessageRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    response, err := h.messageGenService.GenerateMessage(c.Request.Context(), vendorID, req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, response)
}
```

**Register routes in:** `backend/cmd/api/main.go`
```go
// Add to route setup
commHandler := handlers.NewCommunicationHandler(commService, messageGenService)

api.POST("/communications", commHandler.CreateCommunication)
api.GET("/vendors/:id/communications", commHandler.GetVendorCommunications)
api.POST("/vendors/:id/generate-message", commHandler.GenerateMessage)
```

### Phase 4: Frontend Implementation (1-2 hours)

**Files to create:**

1. `frontend/src/types/communication.ts`
```typescript
export interface Communication {
  id: number;
  vendor_id: number;
  direction: 'sent' | 'received';
  channel: 'email' | 'phone' | 'text' | 'in_person' | 'other';
  subject?: string;
  message_body: string;
  ai_generated: boolean;
  communication_type?: string;
  communicated_at: string;
  created_at: string;
  updated_at: string;
}

export interface GenerateMessageRequest {
  message_type: string;
  user_context?: string;
  vendor_email?: string;
  include_history?: boolean;
  max_history_messages?: number;
}

export interface GenerateMessageResponse {
  success: boolean;
  generated_message: string;
  tokens_used: number;
  cost: number;
  cached_tokens: number;
}
```

2. `frontend/src/services/communicationService.ts`
```typescript
import axios from 'axios';
import { Communication, GenerateMessageRequest, GenerateMessageResponse } from '../types/communication';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const communicationService = {
  getVendorCommunications: async (vendorId: number, limit = 10): Promise<Communication[]> => {
    const response = await axios.get(`${API_URL}/api/vendors/${vendorId}/communications?limit=${limit}`);
    return response.data.communications;
  },

  createCommunication: async (data: Partial<Communication>): Promise<Communication> => {
    const response = await axios.post(`${API_URL}/api/communications`, data);
    return response.data.communication;
  },

  generateMessage: async (vendorId: number, request: GenerateMessageRequest): Promise<GenerateMessageResponse> => {
    const response = await axios.post(`${API_URL}/api/vendors/${vendorId}/generate-message`, request);
    return response.data;
  },
};
```

3. `frontend/src/components/MessageGenerator.tsx`
```typescript
import React, { useState } from 'react';
import { communicationService } from '../services/communicationService';
import { GenerateMessageRequest } from '../types/communication';

interface MessageGeneratorProps {
  vendorId: number;
  vendorName: string;
  onMessageGenerated?: (message: string) => void;
}

export const MessageGenerator: React.FC<MessageGeneratorProps> = ({
  vendorId,
  vendorName,
  onMessageGenerated
}) => {
  const [messageType, setMessageType] = useState('follow_up');
  const [userContext, setUserContext] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [includeHistory, setIncludeHistory] = useState(true);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [cost, setCost] = useState(0);

  const messageTypes = [
    { value: 'initial_inquiry', label: 'Initial Inquiry' },
    { value: 'follow_up', label: 'Follow-up' },
    { value: 'quote_request', label: 'Quote Request' },
    { value: 'meeting_scheduling', label: 'Schedule Meeting' },
    { value: 'decision_notification', label: 'Decision Notification' },
    { value: 'question', label: 'Ask Question' },
    { value: 'answer', label: 'Answer Question' },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const request: GenerateMessageRequest = {
        message_type: messageType,
        user_context: userContext,
        vendor_email: vendorEmail,
        include_history: includeHistory,
        max_history_messages: 5,
      };

      const response = await communicationService.generateMessage(vendorId, request);
      setGeneratedMessage(response.generated_message);
      setCost(response.cost);

      if (onMessageGenerated) {
        onMessageGenerated(response.generated_message);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate message');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedMessage);
    // Could show toast notification
  };

  return (
    <div className="message-generator">
      <h3>Generate Message for {vendorName}</h3>

      <div className="form-group">
        <label>Message Type:</label>
        <select value={messageType} onChange={(e) => setMessageType(e.target.value)}>
          {messageTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Additional Context (optional):</label>
        <textarea
          value={userContext}
          onChange={(e) => setUserContext(e.target.value)}
          placeholder="E.g., 'We emailed last week but haven't heard back' or 'Mention we loved their vintage style'"
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>Vendor's Email (if responding):</label>
        <textarea
          value={vendorEmail}
          onChange={(e) => setVendorEmail(e.target.value)}
          placeholder="Paste vendor's email here if you're responding to one"
          rows={4}
        />
      </div>

      <div className="form-group">
        <label>
          <input
            type="checkbox"
            checked={includeHistory}
            onChange={(e) => setIncludeHistory(e.target.checked)}
          />
          Include previous communication history
        </label>
      </div>

      <button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate Message'}
      </button>

      {error && <div className="error">{error}</div>}

      {generatedMessage && (
        <div className="generated-message">
          <div className="message-header">
            <h4>Generated Message</h4>
            <span className="cost">Cost: ${cost.toFixed(4)}</span>
          </div>

          <textarea
            value={generatedMessage}
            onChange={(e) => setGeneratedMessage(e.target.value)}
            rows={10}
            className="message-content"
          />

          <div className="message-actions">
            <button onClick={handleCopy}>Copy to Clipboard</button>
            {/* Future: Send directly button */}
          </div>
        </div>
      )}
    </div>
  );
};
```

4. `frontend/src/components/CommunicationHistory.tsx`
```typescript
import React, { useEffect, useState } from 'react';
import { communicationService } from '../services/communicationService';
import { Communication } from '../types/communication';

interface CommunicationHistoryProps {
  vendorId: number;
}

export const CommunicationHistory: React.FC<CommunicationHistoryProps> = ({ vendorId }) => {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCommunications();
  }, [vendorId]);

  const loadCommunications = async () => {
    try {
      const data = await communicationService.getVendorCommunications(vendorId);
      setCommunications(data);
    } catch (error) {
      console.error('Failed to load communications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="communication-history">
      <h3>Communication History</h3>

      {communications.length === 0 ? (
        <p>No communications recorded yet.</p>
      ) : (
        <div className="communications-list">
          {communications.map((comm) => (
            <div key={comm.id} className={`communication ${comm.direction}`}>
              <div className="comm-header">
                <span className="direction">{comm.direction === 'sent' ? '→' : '←'}</span>
                <span className="channel">{comm.channel}</span>
                <span className="date">{new Date(comm.communicated_at).toLocaleDateString()}</span>
                {comm.ai_generated && <span className="ai-badge">AI</span>}
              </div>

              {comm.subject && <div className="subject">{comm.subject}</div>}

              <div className="message-body">{comm.message_body}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

5. Integrate into vendor detail page: `frontend/src/pages/VendorDetail.tsx`
```typescript
// Add imports
import { MessageGenerator } from '../components/MessageGenerator';
import { CommunicationHistory } from '../components/CommunicationHistory';

// Add to component render
<div className="vendor-communications">
  <MessageGenerator
    vendorId={vendor.id}
    vendorName={vendor.name}
    onMessageGenerated={(message) => {
      // Could auto-populate a send form
      console.log('Generated:', message);
    }}
  />

  <CommunicationHistory vendorId={vendor.id} />
</div>
```

---

## Cost Considerations

### Token Usage Breakdown

**Per message generation:**
- System prompt: ~400 tokens (cached → ~40 token cost after first use)
- Vendor context: ~150 tokens
- Communication history (5 messages): ~800 tokens
- User prompt: ~100 tokens
- Generated message: ~200 tokens output

**Total per request:**
- First request: ~1,650 tokens (~$0.025)
- Cached requests: ~1,290 tokens (~$0.015)
- Average: ~$0.018 per message

**Monthly estimate (20 messages):**
- ~$0.30-0.40/month with caching
- ~$0.50/month without caching

**Recommendation:** Very affordable, especially with prompt caching enabled.

---

## Next Steps

### Immediate Implementation (MVP)
1. ✅ Schema design complete
2. ⏭ Create database migrations
3. ⏭ Implement Go models and services
4. ⏭ Create API handlers and routes
5. ⏭ Implement AI message generation with caching
6. ⏭ Build frontend components
7. ⏭ Test end-to-end flow

### Future Enhancements
- **Direct email sending:** Integrate with SendGrid or similar
- **Email parsing:** Auto-import emails from Gmail/Outlook
- **Templates:** Save and reuse common message patterns
- **Tone customization:** Let user choose formal/casual tone
- **Multi-language:** Generate messages in different languages
- **Attachments:** Handle file attachments in communications
- **Calendar integration:** Auto-schedule meetings from messages

### Testing Strategy
- Unit tests for message generation service
- Integration tests for API endpoints
- Manual testing with real vendor scenarios
- Cost monitoring dashboard to track AI usage

---

## Decision Log

### Why separate `communications` table instead of embedding in vendors?
- **Scalability:** Support multiple communications per vendor
- **Context:** AI needs historical context for better message generation
- **Audit trail:** Track all interactions chronologically
- **Features:** Enables future features like email sync, analytics

### Why store AI-generated messages?
- **Learning:** Track what works/doesn't work
- **Context:** Future messages can reference past AI-generated ones
- **Transparency:** User knows which messages were AI vs manual
- **Cost tracking:** Monitor AI usage and costs

### Why use prompt caching?
- **Cost:** 90% savings on repeated system prompt
- **Performance:** Faster response times
- **Scale:** Allows more message generations within budget

### Why not integrate direct email sending in MVP?
- **Complexity:** OAuth setup, email provider configuration
- **Flexibility:** User may prefer their own email client
- **Privacy:** Avoids storing email credentials
- **Scope:** Focus on message generation first, add sending later

---

## References

- **Claude API Docs:** https://docs.anthropic.com/claude/docs/intro-to-claude
- **Prompt Caching:** https://docs.anthropic.com/claude/docs/prompt-caching
- **Go Email Libraries:** github.com/go-mail/mail (for future direct sending)
- **Frontend Email Libraries:** EmailJS, SendGrid (for future integration)

---

**Estimated Implementation Time:** 3-4 hours for full MVP

**Estimated Monthly Cost:** $0.30-0.50 (AI message generation only)
