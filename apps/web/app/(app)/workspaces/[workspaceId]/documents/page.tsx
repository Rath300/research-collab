'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/trpc';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { PageContainer } from '@/components/layout/PageContainer';
import { FiFileText, FiPlus, FiLoader, FiAlertTriangle, FiInbox } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Define a type for the document creator if available
interface DocumentCreator {
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
}

// Define the structure of a document based on what listWorkspaceDocuments returns
interface WorkspaceDocumentItem {
  id: string;
  title: string;
  document_type: string;
  updated_at: string; // Assuming it's an ISO string
  created_by: DocumentCreator | null;
}


export default function WorkspaceDocumentsPage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const { 
    data: documents, 
    isLoading, 
    error,
    refetch // Allow refetching documents
  } = api.workspace.listWorkspaceDocuments.useQuery(
    { workspaceId },
    { enabled: !!workspaceId } // Only run query if workspaceId is available
  );

  const { data: workspaceData } = api.workspace.getWorkspaceById.useQuery(
    { workspaceId },
    { enabled: !!workspaceId }
  );
  
  const getIconForDocumentType = (docType: string) => {
    // Add more icons as you define more document types
    // For now, a generic FiFileText for all
    return <FiFileText className="mr-2 h-5 w-5 text-neutral-500" />;
  };

  if (isLoading) {
    return (
      <PageContainer title={workspaceData?.name ? `Documents in ${workspaceData.name}` : "Loading Documents..."} className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <FiLoader className="animate-spin text-3xl text-accent-purple" />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Error Loading Documents" className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <FiAlertTriangle className="text-3xl text-red-500 mb-4" />
        <p className="text-neutral-400">Could not load documents: {error.message}</p>
        <Button onClick={() => refetch()} variant="outline" className="mt-4">Try Again</Button>
      </PageContainer>
    );
  }
  
  const pageTitle = workspaceData?.name ? `Documents in "${workspaceData.name}"` : "Workspace Documents";

  return (
    <PageContainer title={pageTitle}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-neutral-900 border-neutral-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-heading text-neutral-100">{pageTitle}</CardTitle>
              <CardDescription className="text-neutral-400">
                View, create, and manage documents for this workspace.
              </CardDescription>
            </div>
            <Link href={`/workspaces/${workspaceId}/documents/new`}>
              <Button variant="primary" className="bg-accent-purple hover:bg-accent-purple/90 text-white">
                <FiPlus className="mr-2 h-5 w-5" /> Create New Document
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {documents && documents.length > 0 ? (
              <ul className="space-y-3">
                {documents.map((doc: WorkspaceDocumentItem) => (
                  <li key={doc.id} className="border border-neutral-800 bg-neutral-850 rounded-md p-4 hover:bg-neutral-800 transition-colors duration-150 ease-in-out">
                    <Link href={`/workspaces/${workspaceId}/documents/${doc.id}`} className="block">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getIconForDocumentType(doc.document_type)}
                          <div>
                            <h3 className="text-lg font-medium text-neutral-100 hover:text-accent-purple transition-colors">{doc.title}</h3>
                            <p className="text-sm text-neutral-500">Type: {doc.document_type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs text-neutral-500">
                            Updated {formatDistanceToNow(new Date(doc.updated_at), { addSuffix: true })}
                          </p>
                          {doc.created_by && (
                            <p className="text-xs text-neutral-500 mt-1">
                              By: {doc.created_by.first_name || 'User'} {doc.created_by.last_name || ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10">
                <FiInbox className="mx-auto h-12 w-12 text-neutral-600" />
                <h3 className="mt-2 text-lg font-medium text-neutral-300">No documents yet</h3>
                <p className="mt-1 text-sm text-neutral-500">Get started by creating a new document.</p>
                 <Link href={`/workspaces/${workspaceId}/documents/new`} className="mt-6">
                    <Button variant="primary" className="bg-accent-purple hover:bg-accent-purple/90 text-white">
                        <FiPlus className="mr-2 h-4 w-4" /> Create New Document
                    </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </PageContainer>
  );
} 