
import React, { useState, useRef } from 'react';
import { Plus, Share2, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Note {
  id: string;
  content: string;
  image?: string;
  createdAt: Date;
  color: string;
}

const Index = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteImage, setNewNoteImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState('#fef3c7');
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

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
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
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive"
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

  const createNote = () => {
    if (!newNoteContent.trim() && !newNoteImage) return;

    const newNote: Note = {
      id: generateId(),
      content: newNoteContent,
      image: newNoteImage || undefined,
      createdAt: new Date(),
      color: selectedColor
    };

    setNotes([newNote, ...notes]);
    setNewNoteContent('');
    setNewNoteImage(null);
    setSelectedColor('#fef3c7');
    setIsCreating(false);
    
    toast({
      title: "Note created!",
      description: "Your note has been saved successfully.",
    });
  };

  const shareNote = (noteId: string) => {
    const shareUrl = `${window.location.origin}/note/${noteId}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Share URL has been copied to your clipboard.",
    });
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    toast({
      title: "Note deleted",
      description: "Your note has been removed.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Notes</h1>
          <p className="text-gray-600">Capture your thoughts, add images, and share with others</p>
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
            <Card className="shadow-lg border-0" style={{ backgroundColor: selectedColor }}>
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
                      <img src={newNoteImage} alt="Note" className="max-w-full h-48 object-cover rounded-lg mx-auto" />
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
                      <p className="text-gray-500">Drag & drop an image or click to upload</p>
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
                        selectedColor === color ? 'border-gray-800 scale-110' : 'border-gray-300'
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
                  {note.image && (
                    <img 
                      src={note.image} 
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
                    <span>{note.createdAt.toLocaleDateString()}</span>
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
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No notes yet</h3>
            <p className="text-gray-500">Create your first note to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
