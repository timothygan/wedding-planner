-- Create budget_items table
CREATE TABLE IF NOT EXISTS budget_items (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    vendor_id TEXT,
    estimated_amount INTEGER NOT NULL DEFAULT 0,
    actual_amount INTEGER DEFAULT 0,
    paid_amount INTEGER DEFAULT 0,
    payment_status TEXT DEFAULT 'unpaid' CHECK(payment_status IN (
        'unpaid', 'deposit_paid', 'partially_paid', 'paid'
    )),
    deposit_amount INTEGER,
    deposit_due_date TIMESTAMP,
    final_payment_due_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
);

-- Create index on vendor_id for vendor budget lookups
CREATE INDEX IF NOT EXISTS idx_budget_items_vendor_id ON budget_items(vendor_id);

-- Create index on category for category-based budget analysis
CREATE INDEX IF NOT EXISTS idx_budget_items_category ON budget_items(category);

-- Create index on payment_status for filtering
CREATE INDEX IF NOT EXISTS idx_budget_items_payment_status ON budget_items(payment_status);
