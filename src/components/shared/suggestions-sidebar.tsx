/**
 * @file Suggestions sidebar component for displaying grammar and spelling corrections.
 * Integrates with the Zustand editor store to show and apply corrections.
 */

'use client';

import { useEditorStore } from '@/lib/store/editor-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  BookOpen, 
  Palette,
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import type { SimplifiedCorrection } from '@/lib/core/checker';

/**
 * Props for the suggestions sidebar
 */
interface SuggestionsSidebarProps {
  className?: string;
}

/**
 * Get icon for correction type
 */
function getCorrectionIcon(type: SimplifiedCorrection['type']) {
  switch (type) {
    case 'grammar':
      return <BookOpen className="h-4 w-4" />;
    case 'spelling':
      return <AlertCircle className="h-4 w-4" />;
    case 'style':
      return <Palette className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
}

/**
 * Get color scheme for correction type
 */
function getCorrectionColors(type: SimplifiedCorrection['type']) {
  switch (type) {
    case 'grammar':
      return {
        badge: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
        border: 'border-blue-200',
        icon: 'text-blue-600',
      };
    case 'spelling':
      return {
        badge: 'bg-red-100 text-red-800 hover:bg-red-200',
        border: 'border-red-200',
        icon: 'text-red-600',
      };
    case 'style':
      return {
        badge: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
        border: 'border-purple-200',
        icon: 'text-purple-600',
      };
    default:
      return {
        badge: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
        border: 'border-gray-200',
        icon: 'text-gray-600',
      };
  }
}

/**
 * Individual suggestion card component
 */
interface SuggestionCardProps {
  correction: SimplifiedCorrection;
  isSelected: boolean;
  onSelect: () => void;
  onApply: (suggestion: string) => void;
  onDismiss: () => void;
}

function SuggestionCard({
  correction,
  isSelected,
  onSelect,
  onApply,
  onDismiss,
}: SuggestionCardProps) {
  const colors = getCorrectionColors(correction.type);
  const icon = getCorrectionIcon(correction.type);

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 ${
        isSelected 
          ? `ring-2 ring-blue-500 ${colors.border}` 
          : `hover:shadow-md ${colors.border}`
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={colors.icon}>
              {icon}
            </div>
            <Badge variant="secondary" className={colors.badge}>
              {correction.type}
            </Badge>
          </div>
          <ChevronRight 
            className={`h-4 w-4 transition-transform ${
              isSelected ? 'rotate-90' : ''
            }`} 
          />
        </div>
        <CardTitle className="text-sm font-medium">
          {correction.shortMessage}
        </CardTitle>
        {correction.message !== correction.shortMessage && (
          <CardDescription className="text-xs">
            {correction.message}
          </CardDescription>
        )}
      </CardHeader>

      {isSelected && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Original text */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Original:
              </p>
              <p className="text-sm bg-red-50 px-2 py-1 rounded border-l-2 border-red-200">
                "{correction.originalText}"
              </p>
            </div>

            {/* Suggestions */}
            {correction.suggestions.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Suggestions:
                </p>
                <div className="space-y-1">
                  {correction.suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApply(suggestion);
                      }}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-2 text-green-600" />
                      <span className="flex-1">"{suggestion}"</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Category info */}
            <div className="text-xs text-muted-foreground">
              Category: {correction.category}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onDismiss();
                }}
              >
                <XCircle className="h-3 w-3 mr-1" />
                Dismiss
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Main suggestions sidebar component
 */
export function SuggestionsSidebar({ className = '' }: SuggestionsSidebarProps) {
  const {
    corrections,
    isCheckingGrammar,
    hasPerformedInitialCheck,
    selectedCorrectionId,
    sidebarOpen,
    selectCorrection,
    applyCorrectionById,
    dismissCorrectionById,
    toggleSidebar,
  } = useEditorStore();

  // Group corrections by type
  const groupedCorrections = corrections.reduce((acc, correction) => {
    if (!acc[correction.type]) {
      acc[correction.type] = [];
    }
    acc[correction.type].push(correction);
    return acc;
  }, {} as Record<string, SimplifiedCorrection[]>);

  const handleApplyCorrection = (correctionId: string, suggestion: string) => {
    applyCorrectionById(correctionId, suggestion);
  };

  const handleDismissCorrection = (correctionId: string) => {
    dismissCorrectionById(correctionId);
  };

  if (!sidebarOpen) {
    return (
      <div className={`w-12 border-l bg-background ${className}`}>
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-80 border-l bg-background flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-lg">Suggestions</h2>
            <p className="text-sm text-muted-foreground">
              {corrections.length} {corrections.length === 1 ? 'issue' : 'issues'} found
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </div>

        {isCheckingGrammar && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            Checking for issues...
          </div>
        )}
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {corrections.length === 0 && !isCheckingGrammar && hasPerformedInitialCheck ? (
            <div className="text-center py-8">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-medium text-lg mb-1">All good!</h3>
              <p className="text-sm text-muted-foreground">
                No grammar or spelling issues found.
              </p>
            </div>
          ) : corrections.length === 0 && !hasPerformedInitialCheck ? (
            <div className="text-center py-8">
              <div className="h-12 w-12 mx-auto mb-3 flex items-center justify-center">
                <div className="h-6 w-6 rounded-full bg-blue-500 animate-pulse" />
              </div>
              <h3 className="font-medium text-lg mb-1">Checking document...</h3>
              <p className="text-sm text-muted-foreground">
                Please wait while we analyze your text.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedCorrections).map(([type, typeCorrections]) => (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={getCorrectionColors(type as SimplifiedCorrection['type']).icon}>
                      {getCorrectionIcon(type as SimplifiedCorrection['type'])}
                    </div>
                    <h3 className="font-medium capitalize">
                      {type} ({typeCorrections.length})
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {typeCorrections.map((correction) => (
                      <SuggestionCard
                        key={correction.id}
                        correction={correction}
                        isSelected={selectedCorrectionId === correction.id}
                        onSelect={() => selectCorrection(correction.id)}
                        onApply={(suggestion) => handleApplyCorrection(correction.id, suggestion)}
                        onDismiss={() => handleDismissCorrection(correction.id)}
                      />
                    ))}
                  </div>

                  {Object.keys(groupedCorrections).indexOf(type) < Object.keys(groupedCorrections).length - 1 && (
                    <Separator className="mt-6" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export default SuggestionsSidebar; 