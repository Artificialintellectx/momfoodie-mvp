-- Fix User Feedback Table with View Dependency Handling
-- This script handles the meal_stats view dependency issue

-- First, let's see what views depend on the user_feedback table
SELECT 
    v.viewname,
    v.definition
FROM pg_views v 
WHERE v.definition LIKE '%user_feedback%';

-- Show the current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_feedback' 
ORDER BY ordinal_position;

-- Step 1: Drop the dependent view (meal_stats)
DROP VIEW IF EXISTS meal_stats;

-- Step 2: Fix the table structure
DO $$ 
BEGIN
    -- Fix meal_id column type if it's INTEGER (should be VARCHAR)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_feedback' 
        AND column_name = 'meal_id' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE user_feedback ALTER COLUMN meal_id TYPE VARCHAR(255) USING meal_id::VARCHAR(255);
        RAISE NOTICE 'Fixed meal_id column type from INTEGER to VARCHAR';
    END IF;

    -- Add meal_name column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_feedback' AND column_name = 'meal_name'
    ) THEN
        ALTER TABLE user_feedback ADD COLUMN meal_name VARCHAR(255) NOT NULL DEFAULT 'Unknown Meal';
        RAISE NOTICE 'Added meal_name column';
    END IF;

    -- Add rating column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_feedback' AND column_name = 'rating'
    ) THEN
        ALTER TABLE user_feedback ADD COLUMN rating INTEGER NOT NULL DEFAULT 5;
        RAISE NOTICE 'Added rating column';
    END IF;

    -- Add feedback_type column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_feedback' AND column_name = 'feedback_type'
    ) THEN
        ALTER TABLE user_feedback ADD COLUMN feedback_type VARCHAR(100) DEFAULT 'recipe_rating';
        RAISE NOTICE 'Added feedback_type column';
    END IF;

    -- Add user_agent column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_feedback' AND column_name = 'user_agent'
    ) THEN
        ALTER TABLE user_feedback ADD COLUMN user_agent TEXT;
        RAISE NOTICE 'Added user_agent column';
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_feedback' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE user_feedback ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_feedback' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE user_feedback ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    END IF;

END $$;

-- Step 3: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_user_feedback_meal_id ON user_feedback(meal_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_rating ON user_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_user_feedback_created_at ON user_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON user_feedback(feedback_type);

-- Step 4: Enable Row Level Security (RLS) if not already enabled
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow anonymous feedback insertion" ON user_feedback;
DROP POLICY IF EXISTS "Allow anonymous feedback reading" ON user_feedback;
DROP POLICY IF EXISTS "Allow feedback updates" ON user_feedback;

-- Step 6: Create RLS policies
CREATE POLICY "Allow anonymous feedback insertion" ON user_feedback
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous feedback reading" ON user_feedback
  FOR SELECT USING (true);

CREATE POLICY "Allow feedback updates" ON user_feedback
  FOR UPDATE USING (true);

-- Step 7: Create or replace the update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 8: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_user_feedback_updated_at ON user_feedback;

-- Step 9: Create trigger to automatically update updated_at
CREATE TRIGGER update_user_feedback_updated_at
  BEFORE UPDATE ON user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Step 10: Recreate the meal_stats view with correct column types
CREATE OR REPLACE VIEW meal_stats AS
SELECT 
    m.id,
    m.name,
    m.meal_type,
    m.dietary_preference,
    m.cooking_time,
    m.difficulty_level,
    COALESCE(feedback_stats.avg_rating, 0) as avg_rating,
    COALESCE(feedback_stats.total_ratings, 0) as total_ratings,
    COALESCE(feedback_stats.rating_distribution, '{}'::jsonb) as rating_distribution
FROM meals m
LEFT JOIN (
    SELECT 
        meal_id,
        ROUND(AVG(rating)::numeric, 1) as avg_rating,
        COUNT(*) as total_ratings,
        jsonb_object_agg(rating, count) as rating_distribution
    FROM (
        SELECT 
            meal_id,
            rating,
            COUNT(*) as count
        FROM user_feedback 
        WHERE feedback_type = 'recipe_rating'
        GROUP BY meal_id, rating
    ) rating_counts
    GROUP BY meal_id
) feedback_stats ON m.id = feedback_stats.meal_id
ORDER BY m.name;

-- Show the final table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_feedback' 
ORDER BY ordinal_position;

-- Test the table with sample data (now with correct data types)
INSERT INTO user_feedback (meal_id, meal_name, rating, feedback_type, user_agent) VALUES
  ('jollof-rice-1', 'Jollof Rice', 5, 'recipe_rating', 'Mozilla/5.0 (test)'),
  ('akara-1', 'Akara', 4, 'recipe_rating', 'Mozilla/5.0 (test)'),
  ('egusi-soup-1', 'Egusi Soup', 5, 'recipe_rating', 'Mozilla/5.0 (test)')
ON CONFLICT DO NOTHING;

-- Show the test data
SELECT * FROM user_feedback ORDER BY created_at DESC LIMIT 5;

-- Verify the meal_stats view works
SELECT * FROM meal_stats LIMIT 3; 