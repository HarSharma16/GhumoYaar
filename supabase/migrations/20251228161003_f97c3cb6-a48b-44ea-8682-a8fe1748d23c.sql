-- Add share functionality to trips table
ALTER TABLE public.trips 
ADD COLUMN share_token TEXT UNIQUE,
ADD COLUMN is_shared BOOLEAN NOT NULL DEFAULT false;

-- Create function to generate share token
CREATE OR REPLACE FUNCTION public.generate_share_token()
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT encode(gen_random_bytes(16), 'hex')
$$;

-- Create RLS policy for public access to shared trips
CREATE POLICY "Anyone can view shared trips by token"
ON public.trips
FOR SELECT
USING (is_shared = true AND share_token IS NOT NULL);

-- Create RLS policy for public access to itineraries of shared trips
CREATE POLICY "Anyone can view itineraries of shared trips"
ON public.itineraries
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = itineraries.trip_id 
    AND trips.is_shared = true 
    AND trips.share_token IS NOT NULL
  )
);