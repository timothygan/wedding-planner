-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    vendor_id TEXT,
    due_date TIMESTAMP,
    timeline_phase TEXT CHECK(timeline_phase IN (
        '12+ months', '9-12 months', '6-9 months', '3-6 months',
        '1-3 months', '1 month', '1 week', 'day of'
    )),
    priority TEXT DEFAULT 'medium' CHECK(priority IN (
        'low', 'medium', 'high', 'urgent'
    )),
    status TEXT DEFAULT 'todo' CHECK(status IN (
        'todo', 'in_progress', 'waiting', 'completed', 'cancelled'
    )),
    estimated_cost INTEGER,
    actual_cost INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
);

-- Create index on vendor_id for faster vendor-related queries
CREATE INDEX IF NOT EXISTS idx_tasks_vendor_id ON tasks(vendor_id);

-- Create index on due_date for timeline views
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Create index on timeline_phase for phase-based filtering
CREATE INDEX IF NOT EXISTS idx_tasks_timeline_phase ON tasks(timeline_phase);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
