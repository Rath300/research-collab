'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { FiPlus, FiCheck, FiClock, FiUser, FiTrash, FiCalendar, FiLoader, FiEdit3 } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { useAuthStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';

interface TaskManagerProps {
  projectId: string;
  userRole: 'owner' | 'editor' | 'viewer';
  collaborators: Array<{
    id: string;
    user_id: string;
    role: string;
    user: {
      id: string;
      first_name: string | null;
      last_name: string | null;
      avatar_url: string | null;
    } | null;
  }>;
}

interface TaskWithDetails {
  id: string;
  title: string;
  description?: string | null;
  status: 'todo' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: string | null;
  created_by: string;
  due_date?: Date | null;
  created_at?: Date | null;
  assignee_name?: string;
  creator_name?: string;
}

export function TaskManager({ projectId, userRole, collaborators }: TaskManagerProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: '',
  });
  const [activeTab, setActiveTab] = useState<'all' | 'todo' | 'in_progress' | 'completed'>('all');

  const { user } = useAuthStore();
  const utils = api.useUtils();

  const { data: tasks, isLoading } = api.project.listTasks.useQuery({ 
    projectId,
    status: activeTab === 'all' ? undefined : activeTab
  });

  const createTaskMutation = api.project.createTask.useMutation({
    onSuccess: () => {
      setNewTask({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
      setShowCreateForm(false);
      utils.project.listTasks.invalidate({ projectId });
    },
  });

  const updateTaskStatusMutation = api.project.updateTaskStatus.useMutation({
    onSuccess: () => {
      utils.project.listTasks.invalidate({ projectId });
    },
  });

  const deleteTaskMutation = api.project.deleteTask.useMutation({
    onSuccess: () => {
      utils.project.listTasks.invalidate({ projectId });
    },
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    createTaskMutation.mutate({
      projectId,
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      assignedTo: newTask.assignedTo || undefined,
      priority: newTask.priority,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
    });
  };

  const handleStatusChange = (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed') => {
    updateTaskStatusMutation.mutate({
      projectId,
      taskId,
      status: newStatus,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    deleteTaskMutation.mutate({ projectId, taskId });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-900/30';
      case 'in_progress': return 'text-yellow-400 bg-yellow-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/30';
      default: return 'text-green-400 bg-green-900/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <FiCheck className="w-4 h-4" />;
      case 'in_progress': return <FiClock className="w-4 h-4" />;
      default: return <FiEdit3 className="w-4 h-4" />;
    }
  };

  const taskCounts = {
    todo: tasks?.filter(t => t.status === 'todo').length || 0,
    in_progress: tasks?.filter(t => t.status === 'in_progress').length || 0,
    completed: tasks?.filter(t => t.status === 'completed').length || 0,
  };

  if (isLoading) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <FiLoader className="animate-spin text-2xl mr-2" />
            <span>Loading tasks...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-border-light">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <FiCheck className="mr-2" />
            Project Tasks ({tasks?.length || 0})
          </CardTitle>
          {userRole !== 'viewer' && (
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2"
            >
              <FiPlus />
              Add Task
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Task Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border-light">
          {[
            { key: 'all', label: 'All', count: tasks?.length || 0 },
            { key: 'todo', label: 'To Do', count: taskCounts.todo },
            { key: 'in_progress', label: 'In Progress', count: taskCounts.in_progress },
            { key: 'completed', label: 'Completed', count: taskCounts.completed },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-accent-primary text-accent-primary'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Create Task Form */}
        {showCreateForm && userRole !== 'viewer' && (
          <Card className="mb-6 bg-gray-50 border-border-light">
            <CardContent className="p-4">
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <Input
                    placeholder="Task title *"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Task description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-border-light rounded-md text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <select
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Assign to...</option>
                      {collaborators.map((collab) => (
                        <option key={collab.user_id} value={collab.user_id}>
                          {collab.user?.first_name} {collab.user?.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                      className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                    </select>
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={createTaskMutation.isPending}>
                    {createTaskMutation.isPending ? <FiLoader className="animate-spin mr-2" /> : <FiPlus className="mr-2" />}
                    Create Task
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tasks List */}
        {!tasks || tasks.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <FiCheck className="mx-auto text-4xl mb-4" />
            <p>No tasks yet.</p>
            {userRole !== 'viewer' && (
              <p className="text-sm">Create your first task to get started!</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task: TaskWithDetails) => (
              <Card key={task.id} className="bg-neutral-800 border-neutral-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-white truncate">{task.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                          {getStatusIcon(task.status)}
                          <span className="ml-1 capitalize">{task.status.replace('_', ' ')}</span>
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      
                      {task.description && (
                        <p className="text-sm text-neutral-400 mb-2">{task.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span>Created by {task.creator_name}</span>
                        {task.assignee_name && (
                          <span className="flex items-center gap-1">
                            <FiUser className="w-3 h-3" />
                            Assigned to {task.assignee_name}
                          </span>
                        )}
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
                          </span>
                        )}
                        {task.created_at && (
                          <span>
                            Created {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>

                    {userRole !== 'viewer' && (
                      <div className="flex items-center gap-2 ml-4">
                        {task.status !== 'completed' && (
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                            className="px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-xs text-white"
                            disabled={updateTaskStatusMutation.isPending}
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                        )}
                        
                        {(userRole === 'owner' || userRole === 'editor' || task.created_by === user?.id) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={deleteTaskMutation.isPending}
                            className="text-red-400 hover:text-red-300 border-red-600 hover:border-red-500"
                          >
                            {deleteTaskMutation.isPending ? (
                              <FiLoader className="w-3 h-3 animate-spin" />
                            ) : (
                              <FiTrash className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

