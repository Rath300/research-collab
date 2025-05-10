"use client";

import React, { useCallback, useState } from 'react';
import { z } from 'zod';
import { create } from 'zustand';
import { FiPlus, FiTrash2, FiCheckCircle, FiCircle } from 'react-icons/fi';
import { twMerge } from 'tailwind-merge';

// Define Todo schema with Zod
const todoSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Todo text is required'),
  completed: z.boolean(),
  createdAt: z.string().datetime()
});

export type Todo = z.infer<typeof todoSchema>;

// Define Todo store using Zustand
interface TodoState {
  todos: Todo[];
  isLoading: boolean;
  error: string | null;
  addTodo: (text: string) => void;
  removeTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  isLoading: false,
  error: null,
  addTodo: (text: string) => {
    try {
      // Validate input
      if (!text.trim()) {
        set({ error: 'Todo text cannot be empty' });
        return;
      }
      
      set((state) => ({
        todos: [
          ...state.todos,
          {
            id: Date.now().toString(),
            text,
            completed: false,
            createdAt: new Date().toISOString()
          }
        ],
        error: null
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to add todo' });
    }
  },
  removeTodo: (id: string) => {
    try {
      set((state) => ({
        todos: state.todos.filter(todo => todo.id !== id),
        error: null
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to remove todo' });
    }
  },
  toggleTodo: (id: string) => {
    try {
      set((state) => ({
        todos: state.todos.map(todo => 
          todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ),
        error: null
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update todo' });
    }
  },
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setError: (error: string | null) => set({ error })
}));

// TodoItem component
interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onRemove: () => void;
}

function TodoItem({ todo, onToggle, onRemove }: TodoItemProps) {
  return (
    <div className="flex items-center justify-between p-3 my-1 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow transition-all duration-200">
      <div className="flex items-center gap-3 flex-1">
        <button 
          onClick={onToggle}
          className="text-blue-500 hover:text-blue-700 focus:outline-none"
          aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
        >
          {todo.completed ? 
            <FiCheckCircle size={20} className="text-green-500" /> : 
            <FiCircle size={20} className="text-gray-400" />
          }
        </button>
        <span
          className={twMerge(
            "text-sm font-medium",
            todo.completed && "opacity-50 line-through text-gray-500"
          )}
        >
          {todo.text}
        </span>
      </div>
      <button
        onClick={onRemove}
        className="p-1.5 rounded-full text-white bg-red-500 hover:bg-red-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
        aria-label="Delete todo"
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  );
}

// TodoList component
function TodoList() {
  const [newTodo, setNewTodo] = useState('');
  const { todos, addTodo, removeTodo, toggleTodo, error, isLoading } = useTodoStore();

  const handleAddTodo = useCallback(() => {
    if (newTodo.trim()) {
      addTodo(newTodo);
      setNewTodo('');
    }
  }, [newTodo, addTodo]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTodo();
    }
  };

  return (
    <div className="p-6 flex flex-col gap-4 w-full">
      <h4 className="text-xl font-bold text-gray-800">Todo List</h4>
      
      <div className="flex gap-2">
        <input
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Add a new todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <button 
          onClick={handleAddTodo}
          disabled={isLoading}
          className="flex items-center gap-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiPlus size={18} />
          Add
        </button>
      </div>
      
      {error && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-md">
          {error}
        </div>
      )}
      
      <div className="h-px bg-gray-200 my-3" />
      
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading todos...</p>
          </div>
        ) : todos.length > 0 ? (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={() => toggleTodo(todo.id)}
              onRemove={() => removeTodo(todo.id)}
            />
          ))
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">
              No todos yet. Add one above!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// Export main component
export function Todo() {
  return (
    <div className="bg-white shadow-md rounded-lg border border-gray-200 overflow-hidden">
      <TodoList />
    </div>
  );
}
