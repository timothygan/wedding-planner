-- Create reminders table
CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER,
    vendor_id INTEGER,
    title TEXT NOT NULL,
    message TEXT,
    reminder_type TEXT NOT NULL CHECK(reminder_type IN (
        'task_due', 'vendor_follow_up', 'payment_due', 'custom'
    )),
    remind_at DATETIME NOT NULL,
    recurrence TEXT CHECK(recurrence IN (
        'none', 'daily', 'weekly', 'monthly'
    )) DEFAULT 'none',
    notification_channels TEXT NOT NULL, -- JSON array: ["browser", "email"]
    status TEXT DEFAULT 'pending' CHECK(status IN (
        'pending', 'sent', 'dismissed'
    )),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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
