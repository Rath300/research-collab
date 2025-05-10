"use client";

import React, { useState } from 'react';

// Basic Todo type
const initialTodos = [
  { id: 1, text: "Learn Next.js", completed: true },
  { id: 2, text: "Build a Todo app", completed: false },
  { id: 3, text: "Deploy to Vercel", completed: false }
];

export function Todo() {
  const [todos, setTodos] = useState(initialTodos);
  const [newTodo, setNewTodo] = useState("");

  const addTodo = () => {
    if (newTodo.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: newTodo,
          completed: false
        }
      ]);
      setNewTodo("");
    }
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const removeTodo = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  };

  return (
    <div style={{ 
      background: 'white', 
      borderRadius: '8px', 
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)', 
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '16px'
    }}>
      <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Todo List</h2>
      
      <div style={{ display: 'flex', marginBottom: '16px' }}>
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a new todo..."
          style={{ 
            flex: 1, 
            padding: '8px 12px', 
            border: '1px solid #ddd', 
            borderRadius: '4px',
            marginRight: '8px'
          }}
        />
        <button 
          onClick={addTodo}
          style={{ 
            padding: '8px 16px', 
            background: '#3b82f6', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Add
        </button>
      </div>
      
      <div>
        {todos.length > 0 ? (
          todos.map((todo) => (
            <div 
              key={todo.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '12px',
                borderBottom: '1px solid #eee',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input 
                  type="checkbox" 
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  style={{ marginRight: '12px' }}
                />
                <span style={{ 
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? '#9ca3af' : '#000'
                }}>
                  {todo.text}
                </span>
              </div>
              <button 
                onClick={() => removeTodo(todo.id)}
                style={{ 
                  background: '#ef4444', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  padding: '4px 8px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '24px', 
            color: '#6b7280', 
            background: '#f9fafb',
            borderRadius: '4px',
            border: '1px dashed #d1d5db'
          }}>
            No todos yet. Add one above!
          </div>
        )}
      </div>
    </div>
  );
}
