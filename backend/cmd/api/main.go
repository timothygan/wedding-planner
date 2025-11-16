package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"

	"wedding-planner-backend/internal/db"
	"wedding-planner-backend/internal/handlers"
	"wedding-planner-backend/internal/middleware"
)

func main() {
	// Get port from environment or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Get database path from environment or default to ./data/wedding-planner.db
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./data/wedding-planner.db"
	}

	// Initialize database
	log.Println("Initializing database...")
	if err := db.InitDB(dbPath); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Run migrations
	log.Println("Running database migrations...")
	migrationsDir := "./migrations"
	if err := db.RunMigrations(migrationsDir); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Set Gin mode (release for production)
	ginMode := os.Getenv("GIN_MODE")
	if ginMode == "" {
		ginMode = "debug"
	}
	gin.SetMode(ginMode)

	// Create Gin router
	router := gin.Default()

	// Setup CORS middleware
	router.Use(middleware.SetupCORS())

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
			"service": "wedding-planner-api",
		})
	})

	// API v1 routes
	api := router.Group("/api")
	{
		// Vendor routes
		vendorHandler := handlers.NewVendorHandler()
		vendors := api.Group("/vendors")
		{
			vendors.GET("", vendorHandler.GetAll)
			vendors.GET("/:id", vendorHandler.GetByID)
			vendors.POST("", vendorHandler.Create)
			vendors.PUT("/:id", vendorHandler.Update)
			vendors.DELETE("/:id", vendorHandler.Delete)
		}
	}

	// Start server
	log.Printf("Starting server on port %s...", port)
	log.Printf("Database: %s", dbPath)
	log.Printf("Migrations: %s", migrationsDir)
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
