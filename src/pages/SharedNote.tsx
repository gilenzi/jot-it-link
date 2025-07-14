
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Note = Tables<'notes'>;

const SharedNote = () => {
  const { noteId } = useParams();
  const { toast } = useToast();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (noteId) {
      loadNote(noteId);
    }
  }, [noteId]);

  const loadNote = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setNote(data);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error('Error loading note:', error);
      setNotFound(true);
      toast({
        title: 'Error loading note',
        description: 'Failed to load the shared note',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shareNote = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share URL has been copied to your clipboard.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading note...</p>
        </div>
      </div>
    );
  }

  if (notFound || !note) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Notes
              </Button>
            </Link>
          </div>
          
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Note not found
            </h3>
            <p className="text-gray-500">
              The note you're looking for doesn't exist or may have been deleted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Notes
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">Shared Note</h1>
            <p className="text-gray-600">Note ID: {noteId}</p>
          </div>
          <Button 
            onClick={shareNote}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Note Display */}
        <div className="max-w-2xl mx-auto">
          <Card 
            className="shadow-lg border-0"
            style={{ backgroundColor: note.color }}
          >
            <CardContent className="p-8">
              {note.image_url && (
                <img 
                  src={note.image_url} 
                  alt="Note" 
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              {note.content && (
                <p className="text-gray-800 whitespace-pre-wrap text-lg leading-relaxed mb-6">
                  {note.content}
                </p>
              )}
              
              <div className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-300 pt-4">
                <span>Created: {new Date(note.created_at).toLocaleDateString()}</span>
                <span className="text-xs bg-white/50 px-2 py-1 rounded">Shared Note</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-12 text-center">
          <div className="bg-white/60 backdrop-blur rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">About Shared Notes</h3>
            <p className="text-gray-600 text-sm">
              This note was shared with you via a unique URL. You can share notes with others by clicking the share button on any note in your collection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedNote;
