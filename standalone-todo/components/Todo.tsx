import React, { useCallback, useState } from 'react';
import { z } from 'zod';
import { create } from 'zustand';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { clsx } from 'clsx';

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
  addTodo: (text: string) => void;
  removeTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  isLoading: false,
  addTodo: (text: string) => set((state) => ({
    todos: [
      ...state.todos,
      {
        id: Date.now().toString(),
        text,
        completed: false,
        createdAt: new Date().toISOString()
      }
    ]
  })),
  removeTodo: (id: string) => set((state) => ({
    todos: state.todos.filter(todo => todo.id !== id)
  })),
  toggleTodo: (id: string) => set((state) => ({
    todos: state.todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )
  })),
  setLoading: (isLoading: boolean) => set({ isLoading })
}));

// TodoItem component
const TodoItem = ({ todo, onToggle, onRemove }: { 
  todo: Todo; 
  onToggle: () => void; 
  onRemove: () => void 
}) => {
  return (
    <div className="flex items-center justify-between p-2 my-1 bg-gray-100 rounded-md">
      <div className="flex items-center gap-2 flex-1">
        <input 
          type="checkbox" 
          checked={todo.completed}
          onChange={onToggle}
          className="w-4 h-4"
        />
        <span
          className={clsx(
            "text-sm",
            todo.completed && "opacity-50 line-through"
          )}
        >
          {todo.text}
        </span>
      </div>
      <button
        onClick={onRemove}
        className="p-1 rounded-full text-white bg-red-500 hover:bg-red-600"
        aria-label="Delete todo"
      >
        <FiTrash2 size={16} />
      </button>
    </div>
  );
};

// TodoList component
const TodoList = () => {
  const [newTodo, setNewTodo] = useState('');
  const { todos, addTodo, removeTodo, toggleTodo } = useTodoStore();

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
    <div className="p-4 flex flex-col gap-4 w-full">
      <h4 className="text-xl font-bold">Todo List</h4>
      
      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add a new todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button 
          onClick={handleAddTodo}
          className="flex items-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          <FiPlus size={16} />
          Add
        </button>
      </div>
      
      <hr className="my-2" />
      
      <div className="flex flex-col gap-2">
        {todos.length > 0 ? (
          todos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={() => toggleTodo(todo.id)}
              onRemove={() => removeTodo(todo.id)}
            />
          ))
        ) : (
          <p className="text-center opacity-50">
            No todos yet. Add one above!
          </p>
        )}
      </div>
    </div>
  );
};

// Export main component
export function Todo() {
  return (
    <div className="bg-white shadow rounded-lg">
      <TodoList />
    </div>
  );
} 