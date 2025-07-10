
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const SharedNote = () => {
  const { noteId } = useParams();
  const { toast } = useToast();

  // In a real app, you'd fetch the note from a database using the noteId
  // For demo purposes, we'll show a sample note
  const sampleNote = {
    id: noteId,
    content: "This is a shared note! 🎉\n\nYou can view notes shared by others through unique URLs. In a real application, this would fetch the actual note content from a database.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center",
    createdAt: new Date(),
    color: '#dcfce7'
  };

  const shareNote = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share URL has been copied to your clipboard.",
    });
  };

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
            style={{ backgroundColor: sampleNote.color }}
          >
            <CardContent className="p-8">
              {sampleNote.image && (
                <img 
                  src={sampleNote.image} 
                  alt="Note" 
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              {sampleNote.content && (
                <p className="text-gray-800 whitespace-pre-wrap text-lg leading-relaxed mb-6">
                  {sampleNote.content}
                </p>
              )}
              
              <div className="flex justify-between items-center text-sm text-gray-600 border-t border-gray-300 pt-4">
                <span>Created: {sampleNote.createdAt.toLocaleDateString()}</span>
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
