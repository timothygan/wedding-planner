-- Create ai_searches table for tracking AI vendor search history and costs
CREATE TABLE IF NOT EXISTS ai_searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    query_text TEXT,
    query_type TEXT NOT NULL CHECK(query_type IN (
        'text_search', 'image_analysis', 'vendor_extraction'
    )),
    search_parameters TEXT, -- JSON object with search criteria
    image_url TEXT,
    results_count INTEGER DEFAULT 0,
    vendors_created TEXT, -- JSON array of vendor IDs created from this search
    ai_model TEXT NOT NULL, -- e.g., "claude-sonnet-4"
    tokens_used INTEGER DEFAULT 0,
    cost REAL DEFAULT 0, -- Cost in dollars
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index on query_type for search analytics
CREATE INDEX IF NOT EXISTS idx_ai_searches_query_type ON ai_searches(query_type);

-- Create index on created_at for chronological analysis
CREATE INDEX IF NOT EXISTS idx_ai_searches_created_at ON ai_searches(created_at);
