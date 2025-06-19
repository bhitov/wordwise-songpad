/**
 * @file The document editor page with TipTap editor and LanguageTool integration.
 * Loads the document from the database and initializes the editor client.
 */

import { notFound } from 'next/navigation';
import { getDocument } from '@/lib/actions/documents';
import { EditorClient } from './editor-client';
import { Toaster } from 'sonner';

/**
 * Editor page props
 */
interface EditorPageProps {
  params: Promise<{
    documentId: string;
  }>;
}

/**
 * Editor page component
 */
export default async function EditorPage({ params }: EditorPageProps) {
  const { documentId } = await params;

  // Fetch the document from the database
  const document = await getDocument(documentId);
  console.log('document received from getDocument');
  console.log(document);

  if (!document) {
    notFound();
  }

  // Transform the document for the client component
  const initialDocument = {
    id: document.id,
    title: document.title,
    content: document.content || '',
    createdAt: document.createdAt.toISOString(),
    updatedAt: document.updatedAt.toISOString(),
  };

  return (
    <>
      <EditorClient initialDocument={initialDocument} />
      <Toaster position="bottom-right" />
    </>
  );
} 