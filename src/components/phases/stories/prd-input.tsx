'use client';

import { useState } from 'react';
import { useBlueprintStore } from '@/store/blueprint-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Sparkles, 
  FileText, 
  Wand2,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export function PrdInput() {
  const { blueprint, setRawPrd, setStories, setAiProcessing, isAiProcessing } = useBlueprintStore();
  const [localPrd, setLocalPrd] = useState(blueprint.rawPrd);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setLocalPrd(text);
    setRawPrd(text);
    toast.success('PRD file loaded', {
      description: `Loaded ${file.name} (${Math.round(text.length / 1024)}KB)`,
    });
  };

  const handleExtractStories = async () => {
    if (!localPrd.trim()) {
      toast.error('No PRD content', {
        description: 'Please paste or upload a PRD first.',
      });
      return;
    }

    setAiProcessing(true);
    setRawPrd(localPrd);

    try {
      const response = await fetch('/api/extract-stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prd: localPrd }),
      });

      if (!response.ok) {
        throw new Error('Failed to extract stories');
      }

      const data = await response.json();
      setStories(data.stories);
      
      toast.success('Stories extracted!', {
        description: `Found ${data.stories.length} user stories from your PRD.`,
      });
    } catch (error) {
      console.error('Error extracting stories:', error);
      toast.error('Extraction failed', {
        description: 'Could not extract stories. Check your API configuration.',
      });
    } finally {
      setAiProcessing(false);
    }
  };

  const wordCount = localPrd.trim().split(/\s+/).filter(Boolean).length;

  return (
    <Card className="flex flex-col h-full border-0 bg-transparent">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-[var(--va-blue)]" />
              PRD Document
            </CardTitle>
            <CardDescription className="mt-1">
              Paste your Product Requirements Document or upload a file
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {wordCount.toLocaleString()} words
            </Badge>
            {blueprint.stories.length > 0 && (
              <Badge className="bg-[var(--va-green)]/20 text-[var(--va-green)] border-[var(--va-green)]/30">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {blueprint.stories.length} stories
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col gap-4 min-h-0">
        <div className="relative flex-1 min-h-0">
          <Textarea
            value={localPrd}
            onChange={(e) => setLocalPrd(e.target.value)}
            placeholder="Paste your PRD content here...

Example:
# Product Overview
This application allows users to...

## User Flows
1. User registration and onboarding
2. Dashboard with key metrics
..."
            className="h-full min-h-0 resize-none bg-secondary/30 border-secondary font-mono text-sm leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <input
              type="file"
              id="prd-upload"
              accept=".md,.txt,.pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('prd-upload')?.click()}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload File
            </Button>
            <span className="text-xs text-muted-foreground">
              .md, .txt supported
            </span>
          </div>

          <Button
            onClick={handleExtractStories}
            disabled={isAiProcessing || !localPrd.trim()}
            className="gap-2 bg-gradient-to-r from-[var(--va-blue)] to-[var(--va-purple)] hover:opacity-90 glow-blue"
          >
            {isAiProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Extract Stories with AI
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
