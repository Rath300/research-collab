'use client';

import React, { useState } from 'react';
import { api } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FiPlus, FiTrash2, FiEdit3, FiSave, FiX } from 'react-icons/fi';

interface ProjectNotesProps {
  projectId: string;
}

interface Note {
  id: string;
  title: string;
  content: string;
  created_at?: Date | null;
  updated_at?: Date | null;
  created_by: string;
  last_edited_by: string;
  creator_name?: string;
  last_editor_name?: string;
}

export function ProjectNotes({ projectId }: ProjectNotesProps) {
  const [newNote, setNewNote] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const utils = api.useUtils();

  const { data: notes, isLoading, error } = api.project.listNotes.useQuery({ projectId });

  const createNoteMutation = api.project.createNote.useMutation({
    onSuccess: () => {
      utils.project.listNotes.invalidate({ projectId });
      setNewNote('');
    },
  });

  const updateNoteMutation = api.project.updateNote.useMutation({
    onSuccess: () => {
      utils.project.listNotes.invalidate({ projectId });
      setEditingNoteId(null);
      setEditingContent('');
    },
  });

  const deleteNoteMutation = api.project.deleteNote.useMutation({
    onSuccess: () => {
      utils.project.listNotes.invalidate({ projectId });
    },
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      createNoteMutation.mutate({
        projectId,
        title: newNote.trim().substring(0, 50), // Use first 50 chars as title
        content: newNote.trim(),
      });
    }
  };

  const handleUpdateNote = (noteId: string) => {
    if (editingContent.trim()) {
      updateNoteMutation.mutate({
        projectId,
        noteId,
        content: editingContent.trim(),
      });
    }
  };

  const handleDeleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this note?')) {
      deleteNoteMutation.mutate({ projectId, noteId });
    }
  };

  const startEditing = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingContent(note.content);
  };

  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditingContent('');
  };

  if (isLoading) {
    return (
      <Card className="bg-white border border-border-light shadow-sm">
        <CardHeader>
          <CardTitle className="text-text-primary text-lg font-heading">Project Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-text-secondary">Loading notes...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white border border-border-light shadow-sm">
        <CardHeader>
          <CardTitle className="text-text-primary text-lg font-heading">Project Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">Error loading notes: {error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-border-light shadow-sm">
      <CardHeader>
        <CardTitle className="text-text-primary text-lg font-heading">Project Notes</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Create new note form */}
        <form onSubmit={handleCreateNote} className="mb-6">
          <div className="flex gap-2">
            <Input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a new note..."
              className="flex-1"
              disabled={createNoteMutation.isPending}
            />
            <Button
              type="submit"
              disabled={!newNote.trim() || createNoteMutation.isPending}
              variant="primary"
              size="sm"
              className="flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add
            </Button>
          </div>
        </form>

        {/* Notes list */}
        <div className="space-y-4">
          {notes && notes.length > 0 ? (
            notes.map((note: Note) => (
              <div
                key={note.id}
                className="p-4 bg-surface-primary rounded-lg border border-border-light"
              >
                {editingNoteId === note.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full p-3 bg-white border border-border-light rounded-lg text-text-primary resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleUpdateNote(note.id)}
                        disabled={updateNoteMutation.isPending}
                        variant="primary"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <FiSave className="w-4 h-4" />
                        Save
                      </Button>
                      <Button
                        onClick={cancelEditing}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <FiX className="w-4 h-4" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                                         <div className="flex items-start justify-between mb-2">
                       <div className="text-sm text-text-secondary">
                         {note.creator_name || 'Anonymous'}
                         {' • '}
                         {note.created_at ? new Date(note.created_at).toLocaleDateString() : 'Unknown date'}
                       </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => startEditing(note)}
                          variant="ghost"
                          size="sm"
                          className="text-text-secondary hover:text-text-primary"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteNote(note.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          disabled={deleteNoteMutation.isPending}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-text-primary whitespace-pre-wrap">{note.content}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-text-secondary">
              <p>No notes yet. Add your first note above!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
