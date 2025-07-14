
-- Create a table for storing notes
CREATE TABLE public.notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT,
  image_url TEXT,
  color TEXT NOT NULL DEFAULT '#fef3c7',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security (making it public for now since there's no authentication)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read, insert, update, and delete notes
-- (This is appropriate for a public notes app without authentication)
CREATE POLICY "Anyone can manage notes" 
  ON public.notes 
  FOR ALL 
  TO public 
  USING (true) 
  WITH CHECK (true);

-- Create a storage bucket for note images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('note-images', 'note-images', true);

-- Create storage policies to allow public access to note images
CREATE POLICY "Anyone can view note images" 
  ON storage.objects 
  FOR SELECT 
  TO public 
  USING (bucket_id = 'note-images');

CREATE POLICY "Anyone can upload note images" 
  ON storage.objects 
  FOR INSERT 
  TO public 
  WITH CHECK (bucket_id = 'note-images');

CREATE POLICY "Anyone can update note images" 
  ON storage.objects 
  FOR UPDATE 
  TO public 
  USING (bucket_id = 'note-images');

CREATE POLICY "Anyone can delete note images" 
  ON storage.objects 
  FOR DELETE 
  TO public 
  USING (bucket_id = 'note-images');
