export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: string;
  vendor_id?: string;
  due_date?: string;
  timeline_phase?: TimelinePhase;
  priority: TaskPriority;
  status: TaskStatus;
  estimated_cost?: number; // in cents
  actual_cost?: number; // in cents
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'waiting' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TimelinePhase =
  | '12+ months'
  | '9-12 months'
  | '6-9 months'
  | '3-6 months'
  | '1-3 months'
  | '1 month'
  | '1 week'
  | 'day of';

export interface CreateTaskRequest {
  title: string;
  description?: string;
  category?: string;
  vendor_id?: string;
  due_date?: string;
  timeline_phase?: TimelinePhase;
  priority?: TaskPriority;
  status?: TaskStatus;
  estimated_cost?: number;
  actual_cost?: number;
  notes?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  category?: string;
  vendor_id?: string;
  due_date?: string;
  timeline_phase?: TimelinePhase;
  priority?: TaskPriority;
  status?: TaskStatus;
  estimated_cost?: number;
  actual_cost?: number;
  notes?: string;
}

