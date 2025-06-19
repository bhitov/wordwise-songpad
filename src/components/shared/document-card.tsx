/**
 * Document Card Component
 * 
 * Displays a document card with title, content preview, and delete functionality.
 * Includes a confirmation dialog before deletion.
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Document interface
 */
interface Document {
  id: string;
  title: string;
  content: string | null;
  updatedAt: Date;
}

/**
 * Document card props
 */
interface DocumentCardProps {
  document: Document;
  onDelete?: () => void;
}

/**
 * Confirmation dialog component
 */
interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  documentTitle: string;
  isDeleting: boolean;
}

function ConfirmDeleteDialog({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  documentTitle, 
  isDeleting 
}: ConfirmDeleteDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border rounded-lg p-6 max-w-md w-full mx-4 shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Delete Document</h3>
        <p className="text-muted-foreground mb-2">
          Are you sure you want to delete "{documentTitle}"?
        </p>
        <p className="text-sm text-destructive mb-6">
          This action cannot be undone. Any songs created for this document will also be deleted.
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Document card component with delete functionality
 */
export function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Handle delete button click
   */
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/documents/${document.id}/delete`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete document');
      }

      toast.success('Document deleted successfully');
      setShowDeleteDialog(false);
      
      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete();
      }
      
      // Refresh the page to update the document list
      window.location.reload();
      
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to delete document'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Handle delete cancellation
   */
  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  return (
    <>
      <div className="relative group">
        <Link href={`/editor/${document.id}`}>
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="line-clamp-1 pr-8">{document.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {document.content || 'Empty document'}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Last updated: {new Date(document.updatedAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </Link>
        
        {/* Delete button */}
        <Button
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleDeleteClick}
          title="Delete document"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Confirmation dialog */}
      <ConfirmDeleteDialog
        isOpen={showDeleteDialog}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        documentTitle={document.title}
        isDeleting={isDeleting}
      />
    </>
  );
} 