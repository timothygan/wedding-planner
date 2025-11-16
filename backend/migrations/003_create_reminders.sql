-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id TEXT PRIMARY KEY,
    task_id TEXT,
    vendor_id TEXT,
    title TEXT NOT NULL,
    message TEXT,
    reminder_type TEXT NOT NULL CHECK(reminder_type IN (
        'follow_up', 'payment_due', 'meeting', 'deadline', 'custom'
    )),
    remind_at TIMESTAMP NOT NULL,
    recurrence TEXT CHECK(recurrence IN (
        'none', 'daily', 'weekly', 'monthly'
    )) DEFAULT 'none',
    notification_channels TEXT NOT NULL, -- JSON array: ["browser", "email"]
    status TEXT DEFAULT 'pending' CHECK(status IN (
        'pending', 'sent', 'dismissed', 'snoozed'
    )),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (task_id IS NOT NULL OR vendor_id IS NOT NULL),
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Create index on remind_at for efficient reminder queries
CREATE INDEX IF NOT EXISTS idx_reminders_remind_at ON reminders(remind_at);

-- Create index on status for filtering active reminders
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);

-- Create index on task_id for task-related reminders
CREATE INDEX IF NOT EXISTS idx_reminders_task_id ON reminders(task_id);

-- Create index on vendor_id for vendor-related reminders
CREATE INDEX IF NOT EXISTS idx_reminders_vendor_id ON reminders(vendor_id);
