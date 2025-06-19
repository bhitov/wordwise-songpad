/**
 * API route for deleting documents
 * DELETE /api/documents/[documentId]/delete
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { deleteDocument } from '@/lib/actions/documents';

/**
 * Handle DELETE requests for document deletion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ documentId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { documentId } = await params;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Delete the document using the server action
    await deleteDocument(documentId);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Document and associated songs deleted successfully' 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting document:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete document';
    
    // Handle specific error cases
    if (errorMessage.includes('not found') || errorMessage.includes('access denied')) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 