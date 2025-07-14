
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Share2, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Note = Tables<'notes'>;

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteImage, setNewNoteImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#fef3c7');
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const colors = [
    '#fef3c7', // yellow
    '#dcfce7', // green
    '#fce7f3', // pink
    '#e0e7ff', // blue
    '#f3e8ff', // purple
    '#fed7e2', // rose
    '#fef2e2', // orange
    '#f0fdfa', // teal
  ];

  // Load notes on component mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast({
        title: 'Error loading notes',
        description: 'Failed to load notes from the database',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('note-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('note-images')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setNewNoteImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setNewNoteImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const createNote = async () => {
    if (!newNoteContent.trim() && !newNoteImage) return;

    try {
      let imageUrl = null;

      // Upload image if present
      if (newNoteImage && fileInputRef.current?.files?.[0]) {
        imageUrl = await uploadImage(fileInputRef.current.files[0]);
        if (!imageUrl) return; // Upload failed
      }

      const { data, error } = await supabase
        .from('notes')
        .insert({
          content: newNoteContent || null,
          image_url: imageUrl,
          color: selectedColor,
        })
        .select()
        .single();

      if (error) throw error;

      setNotes([data, ...notes]);
      setNewNoteContent('');
      setNewNoteImage(null);
      setSelectedColor('#fef3c7');
      setIsCreating(false);

      toast({
        title: 'Note created!',
        description: 'Your note has been saved successfully.',
      });
    } catch (error) {
      console.error('Error creating note:', error);
      toast({
        title: 'Error creating note',
        description: 'Failed to save note to the database',
        variant: 'destructive',
      });
    }
  };

  const shareNote = (noteId: string) => {
    const shareUrl = `${window.location.origin}/note/${noteId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: 'Link copied!',
      description: 'Share URL has been copied to your clipboard.',
    });
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      setNotes(notes.filter((note) => note.id !== noteId));
      toast({
        title: 'Note deleted',
        description: 'Your note has been removed.',
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error deleting note',
        description: 'Failed to delete note from the database',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Notes</h1>
          <p className="text-gray-600">
            Capture your thoughts, add images, and share with others
          </p>
        </div>

        {/* Create Note Section */}
        <div className="mb-8 max-w-2xl mx-auto">
          {!isCreating ? (
            <Card
              className="cursor-pointer hover:shadow-md transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-amber-400"
              onClick={() => setIsCreating(true)}
            >
              <CardContent className="p-6 text-center">
                <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Click to create a new note...</p>
              </CardContent>
            </Card>
          ) : (
            <Card
              className="shadow-lg border-0"
              style={{ backgroundColor: selectedColor }}
            >
              <CardContent className="p-6">
                <Textarea
                  placeholder="What's on your mind?"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  className="border-0 bg-transparent resize-none min-h-[120px] text-gray-800 placeholder:text-gray-500 focus:ring-0 p-0"
                  autoFocus
                />

                {/* Image Upload Area */}
                <div
                  className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-400 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {newNoteImage ? (
                    <div className="relative">
                      <img
                        src={newNoteImage}
                        alt="Note"
                        className="max-w-full h-48 object-cover rounded-lg mx-auto"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-2 right-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNewNoteImage(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">
                        Drag & drop an image or click to upload
                      </p>
                    </>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {/* Color Picker */}
                <div className="flex gap-2 mt-4 mb-4">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? 'border-gray-800 scale-110'
                          : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setIsCreating(false);
                      setNewNoteContent('');
                      setNewNoteImage(null);
                      setSelectedColor('#fef3c7');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={createNote}
                    disabled={!newNoteContent.trim() && !newNoteImage}
                    className="bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    Save Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Notes Grid */}
        {notes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {notes.map((note) => (
              <Card
                key={note.id}
                className="group hover:shadow-lg transition-all duration-200 border-0 hover:scale-105"
                style={{ backgroundColor: note.color }}
              >
                <CardContent className="p-4">
                  {note.image_url && (
                    <img
                      src={note.image_url}
                      alt="Note"
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}

                  {note.content && (
                    <p className="text-gray-800 whitespace-pre-wrap mb-3 leading-relaxed">
                      {note.content}
                    </p>
                  )}

                  <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                    <span>{new Date(note.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => shareNote(note.id)}
                      className="text-gray-600 hover:text-amber-600"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteNote(note.id)}
                      className="text-gray-600 hover:text-red-600 ml-auto"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {notes.length === 0 && !isCreating && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No notes yet
            </h3>
            <p className="text-gray-500">
              Create your first note to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
