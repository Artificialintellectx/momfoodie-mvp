-- MomFoodie MVP Database Schema
-- Run this SQL in your Supabase SQL Editor

-- Create the main meals table
CREATE TABLE meals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    meal_type VARCHAR(20) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
    dietary_preference VARCHAR(20) NOT NULL CHECK (dietary_preference IN ('any', 'vegetarian', 'vegan', 'halal', 'pescatarian', 'lacto_vegetarian', 'gluten_free', 'low_sodium', 'diabetic_friendly', 'low_fat', 'high_protein', 'soft_foods', 'high_fiber', 'traditional', 'rice_based', 'swallow_based')),
    cooking_time VARCHAR(20) NOT NULL CHECK (cooking_time IN ('quick', 'regular', 'elaborate')),
    prep_time VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    ingredients TEXT[] NOT NULL,
    instructions TEXT[] NOT NULL,
    cuisine_type VARCHAR(50) DEFAULT 'Nigerian',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create user feedback table
CREATE TABLE user_feedback (
    id SERIAL PRIMARY KEY,
    meal_id INTEGER REFERENCES meals(id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample meals based on validation data
INSERT INTO meals (name, description, meal_type, dietary_preference, cooking_time, prep_time, difficulty, ingredients, instructions) VALUES

-- Quick Breakfast Options
('Akara and Bread', 'Crispy bean fritters served with fresh bread - a Nigerian classic', 'breakfast', 'any', 'quick', '20 mins', 'easy', 
 ARRAY['Black-eyed peas (1 cup)', 'Onions (1 medium)', 'Scotch bonnet pepper', 'Salt to taste', 'Fresh bread (4 slices)', 'Palm oil for frying'],
 ARRAY['Soak black-eyed peas overnight, peel skins', 'Blend peas with onions and pepper until smooth', 'Add salt and mix well', 'Heat palm oil and fry spoonfuls until golden', 'Serve hot with fresh bread']),

('Bread and Tea', 'Nigerian-style milk tea with fresh bread - perfect for busy mornings', 'breakfast', 'vegetarian', 'quick', '10 mins', 'easy',
 ARRAY['Fresh bread', 'Tea bags (Lipton)', 'Peak milk', 'Sugar', 'Ginger', 'Cloves'],
 ARRAY['Boil water with ginger and cloves', 'Add tea bags and steep for 3 minutes', 'Add milk and sugar to taste', 'Serve hot with buttered bread']),

-- Regular Breakfast Options  
('Moi Moi', 'Steamed bean pudding packed with flavor - perfect for filling breakfast', 'breakfast', 'vegetarian', 'regular', '45 mins', 'medium',
 ARRAY['Black-eyed peas (2 cups)', 'Red bell peppers', 'Onions', 'Palm oil', 'Seasoning cubes', 'Boiled eggs', 'Carrots'],
 ARRAY['Blend peeled beans with peppers and onions', 'Add seasoning cubes and palm oil', 'Pour into containers with egg and carrot pieces', 'Steam for 35-40 minutes until firm', 'Serve hot']),

('Yam and Egg Sauce', 'Boiled yam with scrambled eggs in tomato sauce - simple yet satisfying', 'breakfast', 'any', 'quick', '25 mins', 'easy',
 ARRAY['White yam (1 tuber)', 'Eggs (4 pieces)', 'Tomatoes (3 medium)', 'Onions', 'Scotch bonnet pepper', 'Vegetable oil'],
 ARRAY['Peel and boil yam until tender', 'Blend tomatoes with onions and pepper', 'Fry tomato mixture until thick', 'Scramble eggs into the sauce', 'Serve with boiled yam']),

-- Quick Lunch Options
('Indomie and Egg', 'Quick noodles with fried egg - for those really busy days', 'lunch', 'any', 'quick', '10 mins', 'easy',
 ARRAY['Indomie noodles (2 packs)', 'Eggs (2)', 'Onions', 'Tomatoes', 'Vegetable oil'],
 ARRAY['Boil water and add noodles', 'Fry eggs separately', 'Add seasoning to noodles', 'Serve with fried egg on top']),

('Fried Rice Nigerian Style', 'Colorful rice with mixed vegetables - perfect for special occasions', 'lunch', 'any', 'quick', '35 mins', 'easy',
 ARRAY['Rice (3 cups)', 'Carrots', 'Green beans', 'Sweet corn', 'Green peas', 'Chicken', 'Curry powder'],
 ARRAY['Parboil rice and set aside', 'Dice all vegetables into small cubes', 'Stir-fry vegetables with curry powder', 'Add rice and mix gently', 'Serve hot with fried chicken']),

-- Regular Lunch Options
('Jollof Rice', 'The crown jewel of Nigerian cuisine - perfectly spiced rice', 'lunch', 'any', 'regular', '50 mins', 'medium',
 ARRAY['Basmati rice (3 cups)', 'Tomatoes (5 large)', 'Red bell peppers', 'Onions', 'Chicken stock', 'Bay leaves', 'Thyme', 'Curry powder'],
 ARRAY['Blend tomatoes and peppers together', 'Fry blended mixture until thick and oily', 'Add rice and chicken stock', 'Season with spices and cook until tender', 'Let it steam for 10 minutes before serving']),

('Vegetable Jollof Rice', 'Classic jollof rice loaded with mixed vegetables', 'lunch', 'vegetarian', 'regular', '45 mins', 'medium',
 ARRAY['Rice', 'Tomatoes', 'Carrots', 'Green beans', 'Sweet peas', 'Vegetable stock', 'Bell peppers', 'Onions'],
 ARRAY['Blend tomatoes and peppers', 'Fry tomato base until thick', 'Add rice and vegetable stock', 'Add diced vegetables', 'Cook until rice is tender']),

-- Elaborate Lunch Options
('Egusi Soup with Pounded Yam', 'Rich melon seed soup with assorted meat - a true comfort meal', 'lunch', 'any', 'elaborate', '75 mins', 'medium',
 ARRAY['Ground egusi (2 cups)', 'Spinach', 'Assorted meat', 'Stockfish', 'Palm oil', 'Onions', 'Pounded yam'],
 ARRAY['Cook assorted meat with seasoning', 'Heat palm oil and add ground egusi', 'Add meat stock gradually', 'Add vegetables and simmer', 'Serve with pounded yam']),

-- Quick Dinner Options
('Spaghetti Jollof', 'Spaghetti cooked jollof style - a fusion favorite', 'dinner', 'any', 'quick', '30 mins', 'easy',
 ARRAY['Spaghetti', 'Tomatoes', 'Onions', 'Curry powder', 'Thyme', 'Chicken stock'],
 ARRAY['Blend tomatoes with onions', 'Fry tomato mixture until thick', 'Add spaghetti and chicken stock', 'Cook until pasta is tender', 'Serve hot']),

('Catfish Pepper Soup', 'Spicy catfish soup - perfect for cold evenings', 'dinner', 'any', 'quick', '35 mins', 'easy',
 ARRAY['Fresh catfish', 'Pepper soup spice', 'Ginger', 'Garlic', 'Scent leaves', 'Yam'],
 ARRAY['Clean and cut catfish into pieces', 'Boil with pepper soup spice', 'Add yam pieces', 'Season with ginger and garlic', 'Garnish with scent leaves']),

-- Regular Dinner Options
('Pepper Soup', 'Spicy, aromatic soup perfect for dinner - warms the soul', 'dinner', 'any', 'regular', '50 mins', 'easy',
 ARRAY['Goat meat (1kg)', 'Pepper soup spice', 'Onions', 'Ginger', 'Garlic', 'Scent leaves', 'Yam'],
 ARRAY['Season and cook meat until tender', 'Add pepper soup spice and aromatics', 'Add yam pieces and cook until soft', 'Garnish with scent leaves', 'Serve hot']),

('Rice and Stew', 'Classic white rice with rich tomato stew - a household favorite', 'dinner', 'any', 'regular', '60 mins', 'easy',
 ARRAY['Rice (3 cups)', 'Tomatoes (6 large)', 'Beef', 'Onions', 'Red peppers', 'Palm oil', 'Seasoning cubes'],
 ARRAY['Cook rice until fluffy', 'Blend tomatoes and peppers', 'Fry beef until brown', 'Cook tomato stew until thick', 'Serve rice with stew']),

('Plantain and Beans', 'Sweet plantain with beans porridge - filling and nutritious', 'dinner', 'vegetarian', 'regular', '45 mins', 'easy',
 ARRAY['Ripe plantain', 'Brown beans', 'Palm oil', 'Onions', 'Pepper', 'Crayfish'],
 ARRAY['Cook beans until soft', 'Add plantain pieces', 'Season with palm oil and spices', 'Simmer until plantain is tender', 'Serve hot']),

('Okra Soup', 'Nutritious okra soup with assorted meat - sticky and delicious', 'dinner', 'any', 'regular', '45 mins', 'easy',
 ARRAY['Fresh okra', 'Assorted meat', 'Fish', 'Palm oil', 'Onions', 'Seasoning'],
 ARRAY['Cook meat until tender', 'Slice okra into rings', 'Add okra to meat stock', 'Season and simmer until thick', 'Serve with your choice of swallow']),

-- Vegetarian Options
('Vegetable Soup', 'Mixed vegetable soup with rich flavors', 'dinner', 'vegetarian', 'regular', '40 mins', 'easy',
 ARRAY['Spinach', 'Waterleaf', 'Palm oil', 'Crayfish', 'Seasoning', 'Onions'],
 ARRAY['Chop vegetables roughly', 'Heat palm oil in pot', 'Add vegetables and seasonings', 'Season with crayfish and seasoning cubes', 'Simmer briefly and serve']),

('Beans and Plantain Porridge', 'One-pot meal with beans and plantain - very filling', 'lunch', 'vegetarian', 'elaborate', '65 mins', 'easy',
 ARRAY['Brown beans', 'Ripe plantain', 'Palm oil', 'Onions', 'Pepper', 'Spinach'],
 ARRAY['Cook beans until almost soft', 'Add plantain pieces', 'Season with palm oil and pepper', 'Add spinach in the last 5 minutes', 'Serve hot']),

-- Vegan Options
('Vegan Jollof Rice', 'Plant-based version of the classic jollof rice', 'lunch', 'vegan', 'regular', '45 mins', 'medium',
 ARRAY['Rice', 'Tomatoes', 'Onions', 'Vegetable oil', 'Vegetable stock', 'Mixed vegetables'],
 ARRAY['Blend tomatoes with onions and peppers', 'Fry tomato mixture in vegetable oil', 'Add rice and vegetable stock', 'Add mixed vegetables', 'Cook until rice is tender']),

('Vegan Beans Porridge', 'Plant-based beans porridge with coconut oil', 'dinner', 'vegan', 'elaborate', '65 mins', 'easy',
 ARRAY['Brown beans', 'Plantain', 'Spinach', 'Coconut oil', 'Onions', 'Pepper'],
 ARRAY['Cook beans until soft', 'Add plantain pieces', 'Season with coconut oil and spices', 'Add spinach before serving', 'Serve hot']);

-- Create indexes for better performance
CREATE INDEX idx_meals_meal_type ON meals(meal_type);
CREATE INDEX idx_meals_cooking_time ON meals(cooking_time);
CREATE INDEX idx_meals_dietary_preference ON meals(dietary_preference);
CREATE INDEX idx_feedback_meal_id ON user_feedback(meal_id);

-- Enable Row Level Security (optional)
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Anyone can read meals" ON meals
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert feedback" ON user_feedback
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can read feedback" ON user_feedback
    FOR SELECT USING (true);

-- Create a view for meal statistics (optional)
CREATE VIEW meal_stats AS
SELECT 
    meal_type,
    cooking_time,
    dietary_preference,
    COUNT(*) as total_meals,
    AVG(CASE WHEN uf.rating IS NOT NULL THEN uf.rating END) as avg_rating
FROM meals m
LEFT JOIN user_feedback uf ON m.id = uf.meal_id
GROUP BY meal_type, cooking_time, dietary_preference
ORDER BY meal_type, cooking_time;
