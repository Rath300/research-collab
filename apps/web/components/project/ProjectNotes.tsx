'use client';

import { useState } from 'react';
import { api } from '@/lib/trpc';
import { FiBookOpen, FiPlus, FiEdit3, FiTrash, FiSave, FiX, FiLoader, FiTag, FiFolder } from 'react-icons/fi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/lib/store';
import { formatDistanceToNow } from 'date-fns';

interface ProjectNotesProps {
  projectId: string;
  userRole: 'owner' | 'editor' | 'viewer';
}

interface NoteWithDetails {
  id: string;
  title: string;
  content: string;
  section?: string | null;
  tags?: string[] | null;
  created_by: string;
  last_edited_by: string;
  created_at?: Date | null;
  updated_at?: Date | null;
  creator_name?: string;
  last_editor_name?: string;
}

export function ProjectNotes({ projectId, userRole }: ProjectNotesProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    section: '',
    tags: [] as string[],
    tagInput: '',
  });
  const [editNote, setEditNote] = useState({
    title: '',
    content: '',
    section: '',
    tags: [] as string[],
    tagInput: '',
  });

  const { user } = useAuthStore();
  const utils = api.useUtils();

  const { data: notes, isLoading } = api.project.listNotes.useQuery({ 
    projectId,
    section: selectedSection || undefined
  });

  const createNoteMutation = api.project.createNote.useMutation({
    onSuccess: () => {
      setNewNote({ title: '', content: '', section: '', tags: [], tagInput: '' });
      setShowCreateForm(false);
      utils.project.listNotes.invalidate({ projectId });
    },
  });

  const updateNoteMutation = api.project.updateNote.useMutation({
    onSuccess: () => {
      setEditingNote(null);
      utils.project.listNotes.invalidate({ projectId });
    },
  });

  const deleteNoteMutation = api.project.deleteNote.useMutation({
    onSuccess: () => {
      utils.project.listNotes.invalidate({ projectId });
    },
  });

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    createNoteMutation.mutate({
      projectId,
      title: newNote.title.trim(),
      content: newNote.content.trim(),
      section: newNote.section.trim() || undefined,
      tags: newNote.tags.length > 0 ? newNote.tags : undefined,
    });
  };

  const handleUpdateNote = (noteId: string) => {
    if (!editNote.title.trim() || !editNote.content.trim()) return;

    updateNoteMutation.mutate({
      projectId,
      noteId,
      title: editNote.title.trim(),
      content: editNote.content.trim(),
      section: editNote.section.trim() || undefined,
      tags: editNote.tags.length > 0 ? editNote.tags : undefined,
    });
  };

  const handleDeleteNote = (noteId: string) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    deleteNoteMutation.mutate({ projectId, noteId });
  };

  const startEditing = (note: NoteWithDetails) => {
    setEditingNote(note.id);
    setEditNote({
      title: note.title,
      content: note.content,
      section: note.section || '',
      tags: note.tags || [],
      tagInput: '',
    });
  };

  const addTag = (isNewNote: boolean) => {
    const tagInput = isNewNote ? newNote.tagInput : editNote.tagInput;
    if (!tagInput.trim()) return;

    if (isNewNote) {
      if (!newNote.tags.includes(tagInput.trim())) {
        setNewNote({
          ...newNote,
          tags: [...newNote.tags, tagInput.trim()],
          tagInput: '',
        });
      }
    } else {
      if (!editNote.tags.includes(tagInput.trim())) {
        setEditNote({
          ...editNote,
          tags: [...editNote.tags, tagInput.trim()],
          tagInput: '',
        });
      }
    }
  };

  const removeTag = (tagToRemove: string, isNewNote: boolean) => {
    if (isNewNote) {
      setNewNote({
        ...newNote,
        tags: newNote.tags.filter(tag => tag !== tagToRemove),
      });
    } else {
      setEditNote({
        ...editNote,
        tags: editNote.tags.filter(tag => tag !== tagToRemove),
      });
    }
  };

  // Get unique sections for filtering
  const sections = [...new Set(notes?.map(note => note.section).filter(Boolean) || [])];

  if (isLoading) {
    return (
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <FiLoader className="animate-spin text-2xl mr-2" />
            <span>Loading notes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-neutral-900 border-neutral-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center">
            <FiBookOpen className="mr-2" />
            Research Notes & Wiki ({notes?.length || 0})
          </CardTitle>
          {userRole !== 'viewer' && (
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="flex items-center gap-2"
            >
              <FiPlus />
              Add Note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Section Filter */}
        {sections.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedSection === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedSection('')}
              >
                <FiFolder className="w-3 h-3 mr-1" />
                All Sections
              </Button>
              {sections.map((section) => (
                <Button
                  key={section}
                  variant={selectedSection === section ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedSection(section!)}
                >
                  {section}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Create Note Form */}
        {showCreateForm && userRole !== 'viewer' && (
          <Card className="mb-6 bg-neutral-800 border-neutral-700">
            <CardContent className="p-4">
              <form onSubmit={handleCreateNote} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Note title *"
                    value={newNote.title}
                    onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                    required
                  />
                  <Input
                    placeholder="Section (e.g., methodology, findings)"
                    value={newNote.section}
                    onChange={(e) => setNewNote({ ...newNote, section: e.target.value })}
                  />
                </div>
                
                <textarea
                  placeholder="Note content *"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  required
                />

                {/* Tags Input */}
                <div>
                  <div className="flex gap-2 mb-2">
                    <Input
                      placeholder="Add tags..."
                      value={newNote.tagInput}
                      onChange={(e) => setNewNote({ ...newNote, tagInput: e.target.value })}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(true))}
                      className="flex-1"
                    />
                    <Button type="button" onClick={() => addTag(true)} size="sm">
                      <FiTag className="w-3 h-3" />
                    </Button>
                  </div>
                  {newNote.tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {newNote.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full flex items-center gap-1"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag, true)}
                            className="hover:text-red-300"
                          >
                            <FiX className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createNoteMutation.isPending}>
                    {createNoteMutation.isPending ? <FiLoader className="animate-spin mr-2" /> : <FiSave className="mr-2" />}
                    Save Note
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

        {/* Notes List */}
        {!notes || notes.length === 0 ? (
          <div className="text-center py-8 text-neutral-400">
            <FiBookOpen className="mx-auto text-4xl mb-4" />
            <p>No notes yet.</p>
            {userRole !== 'viewer' && (
              <p className="text-sm">Create your first note to start documenting your research!</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note: NoteWithDetails) => (
              <Card key={note.id} className="bg-neutral-800 border-neutral-700">
                <CardContent className="p-4">
                  {editingNote === note.id ? (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          value={editNote.title}
                          onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                        />
                        <Input
                          placeholder="Section"
                          value={editNote.section}
                          onChange={(e) => setEditNote({ ...editNote, section: e.target.value })}
                        />
                      </div>
                      
                      <textarea
                        value={editNote.content}
                        onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-700 border border-neutral-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={6}
                      />

                      {/* Tags Input for Edit */}
                      <div>
                        <div className="flex gap-2 mb-2">
                          <Input
                            placeholder="Add tags..."
                            value={editNote.tagInput}
                            onChange={(e) => setEditNote({ ...editNote, tagInput: e.target.value })}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(false))}
                            className="flex-1"
                          />
                          <Button type="button" onClick={() => addTag(false)} size="sm">
                            <FiTag className="w-3 h-3" />
                          </Button>
                        </div>
                        {editNote.tags.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {editNote.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full flex items-center gap-1"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag(tag, false)}
                                  className="hover:text-red-300"
                                >
                                  <FiX className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={() => handleUpdateNote(note.id)} disabled={updateNoteMutation.isPending}>
                          {updateNoteMutation.isPending ? <FiLoader className="animate-spin mr-2" /> : <FiSave className="mr-2" />}
                          Save
                        </Button>
                        <Button variant="outline" onClick={() => setEditingNote(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium text-white text-lg">{note.title}</h4>
                            {note.section && (
                              <span className="px-2 py-1 bg-neutral-600 text-neutral-200 text-xs rounded-full">
                                {note.section}
                              </span>
                            )}
                          </div>
                          
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap mb-2">
                              {note.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {userRole !== 'viewer' && (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEditing(note)}
                            >
                              <FiEdit3 className="w-3 h-3" />
                            </Button>
                            
                            {(userRole === 'owner' || userRole === 'editor' || note.created_by === user?.id) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteNote(note.id)}
                                disabled={deleteNoteMutation.isPending}
                                className="text-red-400 hover:text-red-300 border-red-600 hover:border-red-500"
                              >
                                {deleteNoteMutation.isPending ? (
                                  <FiLoader className="w-3 h-3 animate-spin" />
                                ) : (
                                  <FiTrash className="w-3 h-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="prose prose-invert max-w-none mb-4">
                        <div className="whitespace-pre-wrap text-neutral-200">{note.content}</div>
                      </div>

                      <div className="text-xs text-neutral-500 flex items-center justify-between">
                        <span>
                          Created by {note.creator_name} 
                          {note.created_at && ` ${formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}`}
                        </span>
                        {note.last_editor_name !== note.creator_name && (
                          <span>
                            Last edited by {note.last_editor_name}
                            {note.updated_at && ` ${formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}`}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}