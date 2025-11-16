-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN (
        'photographer', 'venue', 'caterer', 'florist', 'dj',
        'videographer', 'planner', 'baker', 'designer', 'rentals'
    )),
    email TEXT,
    phone TEXT,
    website TEXT,
    city TEXT,
    state TEXT,
    starting_price INTEGER,
    status TEXT NOT NULL DEFAULT 'considering' CHECK(status IN (
        'considering', 'booked', 'rejected'
    )),
    notes TEXT,
    ai_discovery_source TEXT,
    last_communication_at TIMESTAMP,
    last_communication_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);

-- Create index on city for location-based searches
CREATE INDEX IF NOT EXISTS idx_vendors_city ON vendors(city);
