'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React from 'react';
import { 
  FiBold, FiItalic, FiList, FiMinus, FiType, FiAlignLeft 
} from 'react-icons/fi';

interface RichTextEditorProps {
  value: string;
  onChange: (richText: string) => void;
  placeholder?: string;
  hasError?: boolean;
}

const editorProseClasses =
  'prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert prose-headings:font-heading prose-p:font-sans prose-li:font-sans min-h-[150px] max-w-full focus:outline-none p-3';

const ToolbarButton = ({ onClick, isActive, title, children }: {
  onClick: () => void;
  isActive?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-2 rounded transition-colors duration-150 
      ${isActive ? 'bg-neutral-700 text-accent-purple' : 'text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100'}`}
  >
    {children}
  </button>
);

export function RichTextEditor({ value, onChange, placeholder, hasError }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        bulletList: {
          HTMLAttributes: { class: 'list-disc pl-6' },
        },
        orderedList: {
          HTMLAttributes: { class: 'list-decimal pl-6' },
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: `${editorProseClasses} ${hasError ? 'border-red-600 focus-within:border-red-500' : 'border-neutral-700 focus-within:border-accent-purple'} bg-neutral-800 rounded-b-md`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={`bg-neutral-800 rounded-md shadow-sm border ${hasError ? 'border-red-600' : 'border-neutral-700'}`}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-neutral-700 bg-neutral-800 rounded-t-md">
        <ToolbarButton title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')}><FiBold size={18} /></ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')}><FiItalic size={18} /></ToolbarButton>
        <ToolbarButton title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')}><FiType size={18} /></ToolbarButton>
        <ToolbarButton title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')}><FiList size={18} /></ToolbarButton>
        <ToolbarButton title="Ordered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')}><FiList style={{ transform: 'scaleY(-1)' }} size={18} /> {/* Rough OL icon */}</ToolbarButton>
        <ToolbarButton title="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()} isActive={editor.isActive('paragraph')}><FiAlignLeft size={18} /></ToolbarButton>
        <ToolbarButton title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}><FiMinus size={18}/></ToolbarButton>
      </div>
      <EditorContent editor={editor} placeholder={placeholder} />
    </div>
  );
} 