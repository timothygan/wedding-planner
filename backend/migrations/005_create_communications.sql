-- Create communications table for tracking vendor communications
CREATE TABLE IF NOT EXISTS communications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vendor_id INTEGER NOT NULL,
    direction TEXT NOT NULL CHECK(direction IN ('sent', 'received')),
    channel TEXT NOT NULL CHECK(channel IN (
        'email', 'phone', 'text', 'in_person', 'other'
    )),
    subject TEXT,
    message_body TEXT,
    ai_generated BOOLEAN DEFAULT 0,
    communication_type TEXT CHECK(communication_type IN (
        'initial_inquiry', 'follow_up', 'quote_request', 'quote_received',
        'meeting_scheduling', 'decision_notification', 'question', 'answer',
        'contract_discussion', 'payment_discussion', 'other'
    )),
    communicated_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Create index on vendor_id for vendor communication history
CREATE INDEX IF NOT EXISTS idx_communications_vendor_id ON communications(vendor_id);

-- Create index on communicated_at for chronological ordering
CREATE INDEX IF NOT EXISTS idx_communications_communicated_at ON communications(communicated_at);

-- Create index on communication_type for filtering
CREATE INDEX IF NOT EXISTS idx_communications_type ON communications(communication_type);
