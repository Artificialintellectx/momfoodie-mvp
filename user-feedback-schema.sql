-- User Feedback Table Schema
-- This table stores user feedback and ratings for recipes

CREATE TABLE IF NOT EXISTS user_feedback (
  id SERIAL PRIMARY KEY,
  meal_id VARCHAR(255) NOT NULL,
  meal_name VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_type VARCHAR(100) DEFAULT 'recipe_rating',
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_feedback_meal_id ON user_feedback(meal_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_rating ON user_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(feedback_type);

-- Enable Row Level Security (RLS)
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Allow all users to insert feedback (anonymous feedback)
CREATE POLICY "Allow anonymous feedback insertion" ON user_feedback
  FOR INSERT WITH CHECK (true);

-- Allow all users to read feedback (for analytics)
CREATE POLICY "Allow anonymous feedback reading" ON user_feedback
  FOR SELECT USING (true);

-- Allow updates only for the same user agent (basic user identification)
CREATE POLICY "Allow feedback updates" ON user_feedback
  FOR UPDATE USING (true);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_user_feedback_updated_at
  BEFORE UPDATE ON user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data for testing (optional)
INSERT INTO user_feedback (meal_id, meal_name, rating, feedback_type, user_agent) VALUES
  ('jollof-rice-1', 'Jollof Rice', 5, 'recipe_rating', 'Mozilla/5.0 (test)'),
  ('akara-1', 'Akara', 4, 'recipe_rating', 'Mozilla/5.0 (test)'),
  ('egusi-soup-1', 'Egusi Soup', 5, 'recipe_rating', 'Mozilla/5.0 (test)')
ON CONFLICT DO NOTHING; 