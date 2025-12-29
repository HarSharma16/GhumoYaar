-- Add travel_style and pace columns to trips table
ALTER TABLE public.trips 
ADD COLUMN travel_style text DEFAULT 'solo',
ADD COLUMN pace text DEFAULT 'relaxed';

-- Add check constraints for valid values
ALTER TABLE public.trips 
ADD CONSTRAINT trips_travel_style_check CHECK (travel_style IN ('solo', 'couple', 'family', 'friends')),
ADD CONSTRAINT trips_pace_check CHECK (pace IN ('relaxed', 'packed'));