import React from 'react';
import { Todo } from '../../components/Todo';

export default function TodoPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '12px', textAlign: 'center' }}>
        Todo App
      </h1>
      <p style={{ marginBottom: '24px', color: '#6b7280', textAlign: 'center' }}>
        Manage your tasks efficiently with this simple todo application.
      </p>
      <Todo />
    </div>
  );
}
