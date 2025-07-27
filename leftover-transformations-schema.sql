-- Leftover Transformations Database Schema
-- This table stores transformation suggestions for leftover meals

CREATE TABLE IF NOT EXISTS leftover_transformations (
  id SERIAL PRIMARY KEY,
  original_leftover VARCHAR(255) NOT NULL, -- e.g., "Leftover Jollof Rice"
  transformation_name VARCHAR(255) NOT NULL, -- e.g., "Jollof Rice Pancakes"
  description TEXT NOT NULL, -- Detailed description of the transformation
  difficulty_level VARCHAR(50) NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  prep_time VARCHAR(50) NOT NULL, -- e.g., "15 mins", "30 mins"
  cooking_time VARCHAR(50) NOT NULL, -- e.g., "10 mins", "20 mins"
  total_time VARCHAR(50) NOT NULL, -- e.g., "25 mins"

  -- Ingredients needed for transformation (in addition to leftover)
  additional_ingredients TEXT[] NOT NULL, -- Array of ingredients needed
  required_ingredients TEXT[] NOT NULL, -- Must-have ingredients for transformation
  optional_ingredients TEXT[] DEFAULT '{}', -- Optional ingredients

  -- Transformation instructions
  transformation_steps TEXT[] NOT NULL, -- Step-by-step instructions
  tips TEXT, -- Helpful tips for the transformation

  -- Categorization
  meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  cuisine_type VARCHAR(100) DEFAULT 'Nigerian',

  -- Nutritional and dietary info
  dietary_tags TEXT[] DEFAULT '{}', -- e.g., ['vegetarian', 'quick', 'budget-friendly']
  estimated_cost VARCHAR(50) DEFAULT 'Low', -- Low, Medium, High

  -- User experience
  popularity_score INTEGER DEFAULT 0, -- For future ranking
  success_rate DECIMAL(3,2) DEFAULT 0.00, -- Success rate based on user feedback

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_prep_time CHECK (prep_time ~ '^\d+\s*mins?$|^\d+\s*hours?$'),
  CONSTRAINT valid_cooking_time CHECK (cooking_time ~ '^\d+\s*mins?$|^\d+\s*hours?$'),
  CONSTRAINT valid_total_time CHECK (total_time ~ '^\d+\s*mins?$|^\d+\s*hours?$')
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_leftover_transformations_original ON leftover_transformations(original_leftover);
CREATE INDEX IF NOT EXISTS idx_leftover_transformations_meal_type ON leftover_transformations(meal_type);
CREATE INDEX IF NOT EXISTS idx_leftover_transformations_difficulty ON leftover_transformations(difficulty_level);

-- Enable Row Level Security
ALTER TABLE leftover_transformations ENABLE ROW LEVEL SECURITY;

-- RLS Policy for read access (public)
CREATE POLICY "Allow public read access to leftover transformations" ON leftover_transformations
  FOR SELECT USING (true);

-- RLS Policy for admin write access (you'll need to adjust based on your auth setup)
CREATE POLICY "Allow admin write access to leftover transformations" ON leftover_transformations
  FOR ALL USING (auth.role() = 'authenticated');

-- Sample data for testing
INSERT INTO leftover_transformations (
  original_leftover,
  transformation_name,
  description,
  difficulty_level,
  prep_time,
  cooking_time,
  total_time,
  additional_ingredients,
  required_ingredients,
  transformation_steps,
  tips,
  meal_type,
  dietary_tags
) VALUES
(
  'Leftover Jollof Rice',
  'Jollof Rice Pancakes',
  'Transform your leftover jollof rice into delicious savory pancakes. Perfect for breakfast or a quick snack!',
  'easy',
  '10 mins',
  '15 mins',
  '25 mins',
  ARRAY['Eggs (2 pieces)', 'Flour (1/2 cup)', 'Baking powder (1/2 tsp)', 'Salt (1/4 tsp)', 'Vegetable oil (2 tbsp)'],
  ARRAY['Eggs', 'Flour'],
  ARRAY[
    'Break up the leftover jollof rice with a fork to separate grains',
    'In a bowl, whisk together eggs, flour, baking powder, and salt',
    'Add the broken-up jollof rice to the mixture and stir well',
    'Heat oil in a non-stick pan over medium heat',
    'Drop spoonfuls of the mixture into the pan',
    'Cook for 3-4 minutes until golden brown on one side',
    'Flip and cook for another 2-3 minutes',
    'Serve hot with ketchup or pepper sauce'
  ],
  'Make sure the rice is not too wet. If it is, add a bit more flour to the mixture.',
  'breakfast',
  ARRAY['vegetarian', 'quick', 'budget-friendly', 'kid-friendly']
),
(
  'Leftover White Rice and Stew',
  'Fried Rice with Stew',
  'Transform your plain rice and stew into a flavorful fried rice dish with a Nigerian twist.',
  'easy',
  '15 mins',
  '10 mins',
  '25 mins',
  ARRAY['Vegetable oil (3 tbsp)', 'Onions (1 medium, diced)', 'Carrots (1 medium, diced)', 'Green beans (1/2 cup)', 'Seasoning cube (1 piece)'],
  ARRAY['Vegetable oil', 'Onions'],
  ARRAY[
    'Heat oil in a large wok or deep pan over high heat',
    'Add diced onions and stir-fry for 2 minutes until translucent',
    'Add diced carrots and green beans, stir-fry for 3 minutes',
    'Add the leftover rice and break it up with a spatula',
    'Add the leftover stew and mix thoroughly',
    'Add crushed seasoning cube and stir well',
    'Cook for 5-7 minutes, stirring occasionally',
    'Serve hot with additional stew on the side'
  ],
  'Use high heat for authentic fried rice texture. Don''t overcrowd the pan.',
  'lunch',
  ARRAY['quick', 'budget-friendly', 'one-pot']
),
(
  'Leftover Beans',
  'Beans and Plantain Porridge',
  'Transform leftover beans into a hearty porridge with ripe plantains for a comforting meal.',
  'medium',
  '20 mins',
  '25 mins',
  '45 mins',
  ARRAY['Ripe plantains (2 medium, sliced)', 'Palm oil (1/4 cup)', 'Onions (1 medium, diced)', 'Pepper (2 pieces)', 'Seasoning cubes (2 pieces)'],
  ARRAY['Ripe plantains', 'Palm oil'],
  ARRAY[
    'Heat palm oil in a pot over medium heat',
    'Add diced onions and fry until golden brown',
    'Add the leftover beans and stir well',
    'Add sliced plantains and mix gently',
    'Add crushed seasoning cubes and pepper',
    'Add water (about 1 cup) and bring to a boil',
    'Reduce heat and simmer for 20-25 minutes',
    'Stir occasionally to prevent sticking',
    'Serve hot with additional palm oil on top'
  ],
  'Use ripe plantains for natural sweetness. Don''t stir too much to keep plantains intact.',
  'dinner',
  ARRAY['vegetarian', 'hearty', 'traditional']
);

-- Create a view for easier querying
CREATE OR REPLACE VIEW leftover_transformations_view AS
SELECT
  id,
  original_leftover,
  transformation_name,
  description,
  difficulty_level,
  prep_time,
  cooking_time,
  total_time,
  additional_ingredients,
  required_ingredients,
  optional_ingredients,
  transformation_steps,
  tips,
  meal_type,
  cuisine_type,
  dietary_tags,
  estimated_cost,
  popularity_score,
  success_rate,
  created_at,
  updated_at
FROM leftover_transformations
ORDER BY popularity_score DESC, created_at DESC; 