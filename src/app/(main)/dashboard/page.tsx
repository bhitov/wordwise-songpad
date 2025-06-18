/**
 * @file The user's dashboard page.
 */

import { createDocumentAction, getUserDocuments } from '@/lib/actions/documents';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserButton } from '@clerk/nextjs';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const documents = await getUserDocuments();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">WordWise</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">Your Documents</h2>
          <form action={createDocumentAction}>
            <Button type="submit" className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              New Document
            </Button>
          </form>
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven't created any documents yet.
            </p>
            <form action={createDocumentAction}>
              <Button type="submit" className="flex items-center gap-2">
                <PlusIcon className="h-4 w-4" />
                Create Your First Document
              </Button>
            </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((document) => (
              <Link key={document.id} href={`/editor/${document.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{document.title}</CardTitle>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 