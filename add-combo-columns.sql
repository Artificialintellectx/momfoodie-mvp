-- Add combo columns to meals table
ALTER TABLE meals ADD COLUMN IF NOT EXISTS served_with TEXT[];
ALTER TABLE meals ADD COLUMN IF NOT EXISTS drinks TEXT[];
ALTER TABLE meals ADD COLUMN IF NOT EXISTS sides TEXT[];

-- Add comments to describe the columns
COMMENT ON COLUMN meals.served_with IS 'Array of items that can be served with this meal';
COMMENT ON COLUMN meals.drinks IS 'Array of recommended drinks for this meal';
COMMENT ON COLUMN meals.sides IS 'Array of recommended side dishes for this meal'; 