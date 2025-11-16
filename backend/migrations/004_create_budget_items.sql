-- Create budget_items table
CREATE TABLE IF NOT EXISTS budget_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    vendor_id INTEGER,
    estimated_amount REAL NOT NULL DEFAULT 0,
    actual_amount REAL DEFAULT 0,
    paid_amount REAL DEFAULT 0,
    payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN (
        'pending', 'deposit_paid', 'partially_paid', 'fully_paid'
    )),
    deposit_amount REAL,
    deposit_due_date DATETIME,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
);

-- Create index on vendor_id for vendor budget lookups
CREATE INDEX IF NOT EXISTS idx_budget_items_vendor_id ON budget_items(vendor_id);

-- Create index on category for category-based budget analysis
CREATE INDEX IF NOT EXISTS idx_budget_items_category ON budget_items(category);

-- Create index on payment_status for filtering
CREATE INDEX IF NOT EXISTS idx_budget_items_payment_status ON budget_items(payment_status);
