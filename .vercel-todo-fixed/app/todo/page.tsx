import React from 'react';
import { Todo } from '../../components/Todo';

export default function TodoPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Todo App</h1>
      <p className="text-gray-600 mb-6">Manage your tasks efficiently with this simple todo application.</p>
      <Todo />
    </div>
  );
}
