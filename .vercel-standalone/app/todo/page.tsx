import React from 'react';
import { Todo } from '../components/Todo';

export default function TodoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Todo App</h1>
      <Todo />
    </div>
  );
} 