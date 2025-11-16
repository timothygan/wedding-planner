import { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useVendors } from '../hooks/useVendors';
import type { Task, TimelinePhase, TaskPriority, TaskStatus } from '../types/task';

export default function TasksPage() {
  const { data: tasks, isLoading, error } = useTasks();
  const { data: vendors } = useVendors();
  const { mutate: createTask } = useCreateTask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    vendor_id: '',
    due_date: '',
    timeline_phase: '' as TimelinePhase | '',
    priority: 'medium' as TaskPriority,
    status: 'todo' as TaskStatus,
    notes: '',
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading tasks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-cinnabar">
          Error loading tasks: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-forest-moss bg-opacity-20 text-forest-moss';
      case 'in_progress':
        return 'bg-old-gold bg-opacity-30 text-graphite';
      case 'waiting':
        return 'bg-old-gold bg-opacity-20 text-forest-moss';
      case 'cancelled':
        return 'bg-cinnabar bg-opacity-20 text-cinnabar';
      default:
        return 'bg-old-gold bg-opacity-10 text-forest-moss';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-cinnabar text-ivory';
      case 'high':
        return 'bg-old-gold bg-opacity-40 text-graphite';
      case 'medium':
        return 'bg-old-gold bg-opacity-20 text-forest-moss';
      default:
        return 'bg-old-gold bg-opacity-10 text-forest-moss';
    }
  };

  // Timeline phases in order
  const timelinePhases: TimelinePhase[] = [
    '12+ months',
    '9-12 months',
    '6-9 months',
    '3-6 months',
    '1-3 months',
    '1 month',
    '1 week',
    'day of',
  ];

  // Group tasks by timeline phase
  const tasksByPhase = tasks?.reduce((acc, task) => {
    const phase = task.timeline_phase || 'unscheduled';
    if (!acc[phase]) {
      acc[phase] = [];
    }
    acc[phase].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const getPhaseOrder = (phase: string): number => {
    const index = timelinePhases.indexOf(phase as TimelinePhase);
    return index >= 0 ? index : 999; // Unscheduled tasks go to the end
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      vendor_id: '',
      due_date: '',
      timeline_phase: '' as TimelinePhase | '',
      priority: 'medium',
      status: 'todo',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      return;
    }

    // Convert date string to ISO format if provided
    let dueDate: string | undefined = undefined;
    if (formData.due_date) {
      // Convert "YYYY-MM-DD" to ISO format "YYYY-MM-DDTHH:mm:ssZ"
      const date = new Date(formData.due_date + 'T00:00:00Z');
      dueDate = date.toISOString();
    }

    const taskData = {
      title: formData.title,
      description: formData.description?.trim() || undefined,
      category: formData.category?.trim() || undefined,
      vendor_id: formData.vendor_id || undefined,
      due_date: dueDate,
      timeline_phase: formData.timeline_phase || undefined,
      priority: formData.priority,
      status: formData.status,
      notes: formData.notes?.trim() || undefined,
    };

    if (editingTask) {
      updateTask(
        {
          id: editingTask.id,
          data: taskData,
        },
        {
          onSuccess: () => {
            setEditingTask(null);
            resetForm();
          },
        }
      );
    } else {
      createTask(taskData, {
        onSuccess: () => {
          setShowCreateForm(false);
          resetForm();
        },
      });
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowCreateForm(false);
    // Convert ISO date to YYYY-MM-DD format for date input
    const dueDate = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '';
    setFormData({
      title: task.title,
      description: task.description || '',
      category: task.category || '',
      vendor_id: task.vendor_id || '',
      due_date: dueDate,
      timeline_phase: task.timeline_phase || ('' as TimelinePhase | ''),
      priority: task.priority,
      status: task.status,
      notes: task.notes || '',
    });
  };

  const handleCancel = () => {
    setEditingTask(null);
    setShowCreateForm(false);
    resetForm();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-graphite">Tasks</h1>
          <p className="text-graphite">Manage your wedding planning tasks</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-forest-moss text-ivory'
                : 'bg-old-gold bg-opacity-20 text-graphite hover:bg-opacity-30'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'timeline'
                ? 'bg-forest-moss text-ivory'
                : 'bg-old-gold bg-opacity-20 text-graphite hover:bg-opacity-30'
            }`}
          >
            Timeline View
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-cinnabar text-ivory rounded-lg hover:opacity-90 transition-all duration-300 shadow-md"
          >
            {showCreateForm ? 'Cancel' : '+ New Task'}
          </button>
        </div>
      </div>

      {(showCreateForm || editingTask) && (
        <div className="mb-8 bg-ivory border border-old-gold rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-graphite">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-graphite mb-1">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-ivory border border-old-gold rounded-lg text-graphite placeholder-forest-moss focus:outline-none focus:ring-2 focus:ring-forest-moss focus:border-forest-moss transition-all"
                placeholder="e.g., Book photographer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-ivory border border-old-gold rounded-lg text-graphite placeholder-forest-moss focus:outline-none focus:ring-2 focus:ring-forest-moss focus:border-forest-moss transition-all resize-none"
                rows={3}
                placeholder="Task details..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite mb-1">
                  Timeline Phase
                </label>
                <select
                  value={formData.timeline_phase}
                  onChange={(e) =>
                    setFormData({ ...formData, timeline_phase: e.target.value as TimelinePhase | '' })
                  }
                  className="w-full px-3 py-2 bg-ivory border border-old-gold rounded-lg text-graphite focus:outline-none focus:ring-2 focus:ring-forest-moss focus:border-forest-moss transition-all"
                >
                  <option value="">Select phase...</option>
                  {timelinePhases.map((phase) => (
                    <option key={phase} value={phase}>
                      {phase}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-1">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as TaskPriority })
                  }
                  className="w-full px-3 py-2 bg-ivory border border-old-gold rounded-lg text-graphite focus:outline-none focus:ring-2 focus:ring-forest-moss focus:border-forest-moss transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-graphite mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as TaskStatus })
                  }
                  className="w-full px-3 py-2 bg-ivory border border-old-gold rounded-lg text-graphite focus:outline-none focus:ring-2 focus:ring-forest-moss focus:border-forest-moss transition-all"
                >
                  <option value="todo">Todo</option>
                  <option value="in_progress">In Progress</option>
                  <option value="waiting">Waiting</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 bg-ivory border border-old-gold rounded-lg text-graphite focus:outline-none focus:ring-2 focus:ring-forest-moss focus:border-forest-moss transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-1">
                Vendor (optional)
              </label>
              <select
                value={formData.vendor_id}
                onChange={(e) => setFormData({ ...formData, vendor_id: e.target.value })}
                className="w-full px-3 py-2 bg-ivory border border-old-gold rounded-lg text-graphite focus:outline-none focus:ring-2 focus:ring-forest-moss focus:border-forest-moss transition-all"
              >
                <option value="">Select a vendor...</option>
                {vendors?.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.name} ({vendor.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-1">
                Category (optional)
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-ivory border border-old-gold rounded-lg text-graphite placeholder-forest-moss focus:outline-none focus:ring-2 focus:ring-forest-moss focus:border-forest-moss transition-all"
                placeholder="e.g., Photography, Venue, Catering"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-graphite mb-1">
                Notes (optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 bg-ivory border border-old-gold rounded-lg text-graphite placeholder-forest-moss focus:outline-none focus:ring-2 focus:ring-forest-moss focus:border-forest-moss transition-all resize-none"
                rows={2}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-cinnabar text-ivory rounded-lg hover:opacity-90 transition-all duration-300 shadow-md"
              >
                {editingTask ? 'Update Task' : 'Create Task'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-old-gold bg-opacity-20 text-graphite rounded-lg hover:bg-opacity-30 transition-all duration-300 border border-old-gold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {tasks && tasks.length === 0 ? (
        <div className="text-center py-12 bg-ivory border border-old-gold rounded-lg">
          <p className="text-graphite text-lg mb-4">No tasks yet</p>
          <p className="text-forest-moss">Add your first task to get started!</p>
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-4">
          {tasks?.map((task) => (
            <div
              key={task.id}
              className="border border-old-gold rounded-lg p-4 bg-ivory hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-graphite">{task.title}</h3>
                  {task.description && (
                    <p className="text-forest-moss text-sm mt-1">{task.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-sm text-forest-moss mt-2">
                {task.timeline_phase && (
                  <span>📅 {task.timeline_phase}</span>
                )}
                {task.due_date && (
                  <span>⏰ {new Date(task.due_date).toLocaleDateString()}</span>
                )}
                {task.estimated_cost && (
                  <span>
                    💰 ${(task.estimated_cost / 100).toFixed(2)}
                  </span>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleEdit(task)}
                  className="px-3 py-1 text-sm bg-old-gold bg-opacity-20 text-graphite rounded hover:bg-opacity-30 transition-all border border-old-gold"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="px-3 py-1 text-sm bg-cinnabar text-ivory rounded hover:opacity-90 transition-all shadow-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(tasksByPhase || {})
            .sort(([phaseA], [phaseB]) => getPhaseOrder(phaseA) - getPhaseOrder(phaseB))
            .map(([phase, phaseTasks]) => (
              <div key={phase} className="border border-old-gold rounded-lg p-6 bg-ivory">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-forest-moss"></div>
                  <h2 className="text-xl font-semibold text-graphite">
                    {phase === 'unscheduled' ? 'Unscheduled' : phase}
                  </h2>
                  <span className="text-sm text-forest-moss">
                    ({phaseTasks.length} {phaseTasks.length === 1 ? 'task' : 'tasks'})
                  </span>
                </div>
                <div className="ml-6 space-y-3">
                  {phaseTasks.map((task) => (
                    <div
                      key={task.id}
                      className="border-l-2 border-forest-moss pl-4 py-2 hover:bg-old-gold hover:bg-opacity-10 rounded-r transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-graphite">{task.title}</h3>
                          {task.description && (
                            <p className="text-forest-moss text-sm mt-1">{task.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              task.status
                            )}`}
                          >
                            {task.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-forest-moss mt-2">
                        {task.due_date && (
                          <span>⏰ {new Date(task.due_date).toLocaleDateString()}</span>
                        )}
                        {task.estimated_cost && (
                          <span>💰 ${(task.estimated_cost / 100).toFixed(2)}</span>
                        )}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => handleEdit(task)}
                          className="px-3 py-1 text-sm bg-old-gold bg-opacity-20 text-graphite rounded hover:bg-opacity-30 transition-all border border-old-gold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="px-3 py-1 text-sm bg-cinnabar bg-opacity-20 text-cinnabar rounded hover:bg-opacity-30 transition-all border border-cinnabar"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-forest-moss">
        Total tasks: {tasks?.length || 0}
      </div>
    </div>
  );
}

