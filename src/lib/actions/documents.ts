/**
 * @file Server actions for document management.
 */

'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { documents, users } from '@/lib/db/schema';

/**
 * Ensure the current user exists in our database.
 * Creates the user if they don't exist.
 */
async function ensureUserExists(userId: string) {
  // Check if user already exists
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (existingUser.length > 0) {
    return; // User already exists
  }

  // Get user details from Clerk
  const clerkUser = await currentUser();
  if (!clerkUser) {
    throw new Error('Unable to get user details');
  }

  // Create user in our database
  await db.insert(users).values({
    id: userId,
    email: clerkUser.emailAddresses[0]?.emailAddress || '',
    name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
  });
}

/**
 * Fetch all documents belonging to the current user.
 */
export async function getUserDocuments() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  await ensureUserExists(userId);

  const userDocuments = await db
    .select()
    .from(documents)
    .where(eq(documents.userId, userId))
    .orderBy(documents.updatedAt);

  return userDocuments;
}

/**
 * Create a new document for the current user.
 */
export async function createDocument(title: string = 'Untitled Document') {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  // Ensure user exists in our database
  await ensureUserExists(userId);

  const [newDocument] = await db
    .insert(documents)
    .values({
      id: crypto.randomUUID(),
      userId,
      title,
      content: '',
    })
    .returning();

  revalidatePath('/dashboard');
  redirect(`/editor/${newDocument.id}`);
}

/**
 * Create a new document from form submission.
 */
export async function createDocumentAction() {
  await createDocument();
}

/**
 * Update a document's content.
 */
export async function updateDocument(documentId: string, content: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  await ensureUserExists(userId);

  // Verify the user owns this document
  const document = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document[0] || document[0].userId !== userId) {
    throw new Error('Document not found or access denied');
  }

  await db
    .update(documents)
    .set({
      content,
      updatedAt: new Date(),
    })
    .where(eq(documents.id, documentId));

  revalidatePath(`/editor/${documentId}`);
}

/**
 * Get a specific document by ID (with ownership check).
 */
export async function getDocument(documentId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  await ensureUserExists(userId);

  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document || document.userId !== userId) {
    throw new Error('Document not found or access denied');
  }

  return document;
}

/**
 * Delete a document and all associated songs (with ownership check).
 */
export async function deleteDocument(documentId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  await ensureUserExists(userId);

  // Verify the user owns this document
  const [document] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId))
    .limit(1);

  if (!document || document.userId !== userId) {
    throw new Error('Document not found or access denied');
  }

  // Delete the document (songs will be cascade deleted automatically)
  await db
    .delete(documents)
    .where(eq(documents.id, documentId));

  revalidatePath('/dashboard');
} 