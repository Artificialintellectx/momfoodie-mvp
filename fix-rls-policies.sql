-- Fix Row Level Security Policies for MomFudy Admin
-- Run this SQL in your Supabase SQL Editor to fix the RLS policy issue

-- Drop existing policies first (if they exist)
DROP POLICY IF EXISTS "Anyone can read meals" ON meals;
DROP POLICY IF EXISTS "Anyone can insert meals" ON meals;
DROP POLICY IF EXISTS "Anyone can update meals" ON meals;
DROP POLICY IF EXISTS "Anyone can delete meals" ON meals;

-- Create comprehensive policies for the meals table
-- Allow public read access
CREATE POLICY "Public read access to meals" ON meals
    FOR SELECT USING (true);

-- Allow public insert access (for admin dashboard)
CREATE POLICY "Public insert access to meals" ON meals
    FOR INSERT WITH CHECK (true);

-- Allow public update access (for admin dashboard)
CREATE POLICY "Public update access to meals" ON meals
    FOR UPDATE USING (true);

-- Allow public delete access (for admin dashboard)
CREATE POLICY "Public delete access to meals" ON meals
    FOR DELETE USING (true);

-- Also fix the user_feedback table policies
DROP POLICY IF EXISTS "Anyone can insert feedback" ON user_feedback;
DROP POLICY IF EXISTS "Anyone can read feedback" ON user_feedback;

CREATE POLICY "Public read access to feedback" ON user_feedback
    FOR SELECT USING (true);

CREATE POLICY "Public insert access to feedback" ON user_feedback
    FOR INSERT WITH CHECK (true);

-- Verify the policies are working
-- You can test by running: SELECT * FROM pg_policies WHERE tablename = 'meals'; 