import { useTasks, useDeleteTask } from '../hooks/useTasks';
import type { Task } from '../types/task';

export default function TasksPage() {
  const { data: tasks, isLoading, error } = useTasks();
  const { mutate: deleteTask } = useDeleteTask();

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
        <div className="text-red-600">
          Error loading tasks: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tasks</h1>
        <p className="text-gray-600">Manage your wedding planning tasks</p>
      </div>

      {tasks && tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">No tasks yet</p>
          <p className="text-gray-400">Add your first task to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks?.map((task) => (
            <div
              key={task.id}
              className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{task.title}</h3>
                  {task.description && (
                    <p className="text-gray-600 text-sm mt-1">{task.description}</p>
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

              <div className="flex flex-wrap gap-2 text-sm text-gray-600 mt-2">
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
                  onClick={() => deleteTask(task.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-gray-500">
        Total tasks: {tasks?.length || 0}
      </div>
    </div>
  );
}

