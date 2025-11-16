# Code Patterns & Examples

**Purpose:** Reference guide for consistent code patterns across the project.
**When to use:** Reference this when implementing new features or need pattern examples.

---

## Table of Contents

- [Go Backend Patterns](#go-backend-patterns)
- [React Frontend Patterns](#react-frontend-patterns)
- [API Design Patterns](#api-design-patterns)
- [Database Patterns](#database-patterns)
- [AI Integration Patterns](#ai-integration-patterns)

---

## Go Backend Patterns

### Handler Pattern (Standard CRUD)

```go
// backend/internal/handlers/vendors.go

// GET /api/vendors
func GetVendors(c *gin.Context) {
    vendors, err := services.GetAllVendors()
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    c.JSON(http.StatusOK, vendors)
}

// GET /api/vendors/:id
func GetVendor(c *gin.Context) {
    id := c.Param("id")

    vendor, err := services.GetVendorByID(id)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Vendor not found"})
        return
    }

    c.JSON(http.StatusOK, vendor)
}

// POST /api/vendors
func CreateVendor(c *gin.Context) {
    var vendor models.Vendor

    // 1. Bind and validate
    if err := c.ShouldBindJSON(&vendor); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // 2. Additional validation
    if vendor.Name == "" || vendor.Category == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "name and category required"})
        return
    }

    // 3. Business logic
    created, err := services.CreateVendor(&vendor)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    // 4. Return response
    c.JSON(http.StatusCreated, created)
}

// PUT /api/vendors/:id
func UpdateVendor(c *gin.Context) {
    id := c.Param("id")
    var vendor models.Vendor

    if err := c.ShouldBindJSON(&vendor); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    vendor.ID = id
    updated, err := services.UpdateVendor(&vendor)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, updated)
}

// DELETE /api/vendors/:id
func DeleteVendor(c *gin.Context) {
    id := c.Param("id")

    if err := services.DeleteVendor(id); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusNoContent, nil)
}
```

### Service Layer Pattern

```go
// backend/internal/services/vendor_service.go
package services

import (
    "database/sql"
    "fmt"
    "github.com/google/uuid"
    "time"
)

func GetAllVendors() ([]models.Vendor, error) {
    rows, err := db.Query("SELECT * FROM vendors ORDER BY created_at DESC")
    if err != nil {
        return nil, fmt.Errorf("failed to query vendors: %w", err)
    }
    defer rows.Close()

    var vendors []models.Vendor
    for rows.Next() {
        var v models.Vendor
        if err := rows.Scan(&v.ID, &v.Name, /* ... */); err != nil {
            return nil, fmt.Errorf("failed to scan vendor: %w", err)
        }
        vendors = append(vendors, v)
    }

    return vendors, nil
}

func CreateVendor(vendor *models.Vendor) (*models.Vendor, error) {
    // Generate ID
    vendor.ID = uuid.New().String()
    vendor.CreatedAt = time.Now()
    vendor.UpdatedAt = time.Now()

    // Insert into database
    query := `
        INSERT INTO vendors (id, name, category, email, phone, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    _, err := db.Exec(query,
        vendor.ID,
        vendor.Name,
        vendor.Category,
        vendor.Email,
        vendor.Phone,
        vendor.CreatedAt,
        vendor.UpdatedAt,
    )

    if err != nil {
        return nil, fmt.Errorf("failed to insert vendor: %w", err)
    }

    return vendor, nil
}
```

### Model Pattern

```go
// backend/internal/models/vendor.go
package models

import "time"

type Vendor struct {
    ID                  string    `json:"id" db:"id"`
    Name                string    `json:"name" db:"name" binding:"required"`
    Category            string    `json:"category" db:"category" binding:"required"`
    Email               *string   `json:"email,omitempty" db:"email"`
    Phone               *string   `json:"phone,omitempty" db:"phone"`
    Website             *string   `json:"website,omitempty" db:"website"`
    City                *string   `json:"city,omitempty" db:"city"`
    State               *string   `json:"state,omitempty" db:"state"`
    StartingPrice       *float64  `json:"starting_price,omitempty" db:"starting_price"`
    StyleTags           []string  `json:"style_tags,omitempty" db:"style_tags"`
    ServicesOffered     []string  `json:"services_offered,omitempty" db:"services_offered"`
    Status              string    `json:"status" db:"status"`
    Notes               *string   `json:"notes,omitempty" db:"notes"`
    AIDiscoverySource   *string   `json:"ai_discovery_source,omitempty" db:"ai_discovery_source"`
    CreatedAt           time.Time `json:"created_at" db:"created_at"`
    UpdatedAt           time.Time `json:"updated_at" db:"updated_at"`
}

// Custom JSON marshaling for SQLite JSON fields
func (v *Vendor) MarshalStyleTags() (string, error) {
    if len(v.StyleTags) == 0 {
        return "[]", nil
    }
    data, err := json.Marshal(v.StyleTags)
    return string(data), err
}
```

### Middleware Pattern

```go
// backend/internal/middleware/cors.go
package middleware

import "github.com/gin-gonic/gin"

func CORS() gin.HandlerFunc {
    return func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }

        c.Next()
    }
}
```

### Database Connection Pattern

```go
// backend/internal/db/connection.go
package db

import (
    "database/sql"
    _ "github.com/mattn/go-sqlite3"
)

var DB *sql.DB

func InitDB(dbPath string) error {
    var err error
    DB, err = sql.Open("sqlite3", dbPath)
    if err != nil {
        return err
    }

    // CRITICAL: Configure SQLite for production
    pragmas := []string{
        "PRAGMA journal_mode = WAL;",
        "PRAGMA synchronous = NORMAL;",
        "PRAGMA cache_size = 1000000;",
        "PRAGMA temp_store = MEMORY;",
        "PRAGMA foreign_keys = ON;",
    }

    for _, pragma := range pragmas {
        if _, err := DB.Exec(pragma); err != nil {
            return err
        }
    }

    // Single connection for SQLite
    DB.SetMaxOpenConns(1)

    return nil
}
```

---

## React Frontend Patterns

### Page Component Pattern

```typescript
// frontend/src/pages/VendorsPage.tsx
import { useVendors } from '../hooks/useVendors';
import { VendorCard } from '../components/VendorCard';

export function VendorsPage() {
  const { data: vendors, isLoading, error } = useVendors();

  if (isLoading) return <div>Loading vendors...</div>;
  if (error) return <div>Error loading vendors: {error.message}</div>;

  return (
    <div className="vendors-page">
      <h1>Vendors</h1>

      <div className="vendor-grid">
        {vendors?.map(vendor => (
          <VendorCard key={vendor.id} vendor={vendor} />
        ))}
      </div>
    </div>
  );
}
```

### Component Pattern with Props

```typescript
// frontend/src/components/VendorCard.tsx
import { Vendor } from '../types/vendor';
import { useUpdateVendor } from '../hooks/useVendors';

interface VendorCardProps {
  vendor: Vendor;
  onUpdate?: (vendor: Vendor) => void;
  onDelete?: (id: string) => void;
}

export function VendorCard({ vendor, onUpdate, onDelete }: VendorCardProps) {
  const { mutate: updateVendor, isPending } = useUpdateVendor();

  const handleStatusChange = (newStatus: string) => {
    updateVendor(
      { ...vendor, status: newStatus },
      {
        onSuccess: (updated) => {
          onUpdate?.(updated);
        },
        onError: (error) => {
          console.error('Failed to update vendor:', error);
        },
      }
    );
  };

  return (
    <div className="vendor-card">
      <h3>{vendor.name}</h3>
      <p>{vendor.category}</p>
      <select
        value={vendor.status}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isPending}
      >
        <option value="discovered">Discovered</option>
        <option value="contacted">Contacted</option>
        <option value="booked">Booked</option>
      </select>
    </div>
  );
}
```

### React Query Hook Pattern

```typescript
// frontend/src/hooks/useVendors.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorService } from '../services/vendors';
import { Vendor } from '../types/vendor';

// Fetch all vendors
export function useVendors() {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: vendorService.getAll,
  });
}

// Fetch single vendor
export function useVendor(id: string) {
  return useQuery({
    queryKey: ['vendors', id],
    queryFn: () => vendorService.getById(id),
    enabled: !!id,
  });
}

// Create vendor mutation
export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorService.create,
    onSuccess: () => {
      // Invalidate and refetch vendors list
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

// Update vendor mutation
export function useUpdateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vendor: Vendor) => vendorService.update(vendor.id, vendor),
    onSuccess: (updated) => {
      // Update cache
      queryClient.setQueryData(['vendors', updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}

// Delete vendor mutation
export function useDeleteVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vendorService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
  });
}
```

### API Service Pattern

```typescript
// frontend/src/services/vendors.ts
import axios from './api';
import { Vendor } from '../types/vendor';

export const vendorService = {
  async getAll(): Promise<Vendor[]> {
    const response = await axios.get('/vendors');
    return response.data;
  },

  async getById(id: string): Promise<Vendor> {
    const response = await axios.get(`/vendors/${id}`);
    return response.data;
  },

  async create(vendor: Partial<Vendor>): Promise<Vendor> {
    const response = await axios.post('/vendors', vendor);
    return response.data;
  },

  async update(id: string, vendor: Partial<Vendor>): Promise<Vendor> {
    const response = await axios.put(`/vendors/${id}`, vendor);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await axios.delete(`/vendors/${id}`);
  },
};
```

### Axios Instance Pattern

```typescript
// frontend/src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (e.g., for auth tokens)
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (e.g., for error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      console.error('Unauthorized');
    }
    return Promise.reject(error);
  }
);

export default api;
```

### TypeScript Types Pattern

```typescript
// frontend/src/types/vendor.ts
export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  state?: string;
  starting_price?: number;
  style_tags?: string[];
  services_offered?: string[];
  status: VendorStatus;
  notes?: string;
  ai_discovery_source?: string;
  created_at: string;
  updated_at: string;
}

export type VendorCategory =
  | 'photographer'
  | 'venue'
  | 'caterer'
  | 'florist'
  | 'dj'
  | 'videographer'
  | 'planner'
  | 'baker'
  | 'designer'
  | 'rentals';

export type VendorStatus =
  | 'discovered'
  | 'contacted'
  | 'quoted'
  | 'meeting_scheduled'
  | 'booked'
  | 'rejected'
  | 'backup';
```

---

## API Design Patterns

### Endpoint Structure

```
GET    /api/vendors              # List all vendors
POST   /api/vendors              # Create vendor
GET    /api/vendors/:id          # Get vendor by ID
PUT    /api/vendors/:id          # Update vendor
DELETE /api/vendors/:id          # Delete vendor

GET    /api/tasks                # List tasks
POST   /api/tasks                # Create task
GET    /api/tasks/:id            # Get task
PUT    /api/tasks/:id            # Update task
DELETE /api/tasks/:id            # Delete task

POST   /api/ai/search-text       # AI text-based search
POST   /api/ai/analyze-image     # AI image analysis
POST   /api/ai/recommend         # AI recommendations
```

### Response Format

**Success Response:**
```json
{
  "id": "uuid-here",
  "name": "Vintage Photography Co",
  "category": "photographer",
  "status": "discovered",
  "created_at": "2025-11-15T15:29:00Z"
}
```

**Error Response:**
```json
{
  "error": "Vendor not found",
  "code": "NOT_FOUND"
}
```

### HTTP Status Codes

- **200 OK** - Successful GET/PUT
- **201 Created** - Successful POST
- **204 No Content** - Successful DELETE
- **400 Bad Request** - Validation error
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

---

## Database Patterns

### Migration Pattern

```sql
-- backend/migrations/001_create_vendors.sql
CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN (
        'photographer', 'venue', 'caterer', 'florist',
        'dj', 'videographer', 'planner', 'baker',
        'designer', 'rentals'
    )),
    email TEXT,
    phone TEXT,
    website TEXT,
    city TEXT,
    state TEXT,
    starting_price REAL,
    style_tags TEXT,  -- JSON array
    services_offered TEXT,  -- JSON array
    status TEXT DEFAULT 'discovered' CHECK(status IN (
        'discovered', 'contacted', 'quoted',
        'meeting_scheduled', 'booked', 'rejected', 'backup'
    )),
    notes TEXT,
    ai_discovery_source TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_created_at ON vendors(created_at);
```

### Query Pattern with Parameterization

```go
// GOOD - Parameterized query (prevents SQL injection)
func GetVendorsByCategory(category string) ([]Vendor, error) {
    query := "SELECT * FROM vendors WHERE category = ? ORDER BY created_at DESC"
    rows, err := db.Query(query, category)
    // ... rest of implementation
}

// BAD - String concatenation (vulnerable to SQL injection)
func GetVendorsByCategoryBad(category string) ([]Vendor, error) {
    query := "SELECT * FROM vendors WHERE category = '" + category + "'"
    rows, err := db.Query(query)  // NEVER DO THIS
}
```

---

## AI Integration Patterns

### Claude API Tool Calling Pattern

```go
// backend/internal/ai/search.go
package ai

import (
    "context"
    "github.com/anthropics/anthropic-sdk-go"
)

// Define vendor extraction schema
var vendorExtractionTool = anthropic.Tool{
    Name:        "create_vendor_entries",
    Description: "Extract vendor information and create structured entries",
    InputSchema: map[string]interface{}{
        "type": "object",
        "properties": map[string]interface{}{
            "vendors": map[string]interface{}{
                "type": "array",
                "items": map[string]interface{}{
                    "type": "object",
                    "properties": map[string]interface{}{
                        "name":            map[string]string{"type": "string"},
                        "category":        map[string]interface{}{
                            "type": "string",
                            "enum": []string{"photographer", "venue", "caterer"},
                        },
                        "email":           map[string]string{"type": "string"},
                        "city":            map[string]string{"type": "string"},
                        "starting_price":  map[string]string{"type": "number"},
                    },
                    "required": []string{"name", "category"},
                },
            },
        },
    },
}

func SearchVendors(query string) ([]models.Vendor, error) {
    client := anthropic.NewClient()

    resp, err := client.Messages.Create(context.Background(), &anthropic.MessageCreateParams{
        Model:     "claude-sonnet-4-20250514",
        MaxTokens: 4096,
        Tools:     []anthropic.Tool{vendorExtractionTool},
        Messages: []anthropic.Message{
            {
                Role:    "user",
                Content: fmt.Sprintf("Search for vendors: %s", query),
            },
        },
    })

    if err != nil {
        return nil, err
    }

    // Extract vendors from tool use response
    vendors := parseVendorsFromResponse(resp)
    return vendors, nil
}
```

### Prompt Caching Pattern

```go
// Cache system prompts for 90% cost reduction
resp, err := client.Messages.Create(ctx, &anthropic.MessageCreateParams{
    Model:     "claude-sonnet-4-20250514",
    MaxTokens: 4096,
    System: []anthropic.SystemMessage{
        {
            Type: "text",
            Text: vendorSchemaDefinition,
            CacheControl: &anthropic.CacheControl{Type: "ephemeral"},
        },
    },
    Messages: messages,
})
```

---

## Environment Variables Pattern

### Backend (.env)
```bash
DATABASE_PATH=./wedding-planner.db
ANTHROPIC_API_KEY=sk-ant-...
RESEND_API_KEY=re_...
PORT=8080
ALLOWED_ORIGINS=http://localhost:5173,https://yourapp.vercel.app
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:8080/api
```

### Loading Environment Variables (Go)

```go
// backend/cmd/api/main.go
package main

import (
    "os"
    "github.com/joho/godotenv"
)

func main() {
    // Load .env file
    godotenv.Load()

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    dbPath := os.Getenv("DATABASE_PATH")
    if dbPath == "" {
        dbPath = "./wedding-planner.db"
    }

    // ... rest of setup
}
```

---

## Error Handling Patterns

### Go Error Handling

```go
// ALWAYS check errors
vendor, err := services.GetVendorByID(id)
if err != nil {
    return fmt.Errorf("failed to get vendor: %w", err)
}

// Use error wrapping for context
if err := db.Exec(query); err != nil {
    return fmt.Errorf("failed to execute query for vendor %s: %w", id, err)
}
```

### React Error Handling

```typescript
// Error boundaries for component errors
export class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }
    return this.props.children;
  }
}

// Async error handling with React Query
const { data, error } = useVendors();
if (error) {
  return <div>Error: {error.message}</div>;
}
```

---

**Last Updated:** 2025-11-15
