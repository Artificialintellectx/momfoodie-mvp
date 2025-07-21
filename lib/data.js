// Comprehensive Nigerian meals database based on survey insights
export const fallbackMeals = [
  // BREAKFAST OPTIONS (15 recipes)
  {
    id: 1,
    name: "Akara and Bread",
    description: "Crispy bean fritters served with fresh bread - a Nigerian classic that never gets old",
    meal_type: "breakfast",
    dietary_preference: "any",
    cooking_time: "quick",
    prep_time: "20 mins",
    difficulty: "easy",
    ingredients: ["Black-eyed peas (1 cup)", "Onions (1 medium)", "Scotch bonnet pepper", "Salt to taste", "Fresh bread (4 slices)", "Palm oil for frying"],
    instructions: [
      "Soak black-eyed peas overnight, peel skins",
      "Blend peas with onions and pepper until smooth",
      "Add salt and mix well",
      "Heat palm oil and fry spoonfuls until golden",
      "Serve hot with fresh bread"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 2,
    name: "Moi Moi",
    description: "Steamed bean pudding packed with flavor - perfect for a filling breakfast",
    meal_type: "breakfast",
    dietary_preference: "vegetarian",
    cooking_time: "regular",
    prep_time: "45 mins",
    difficulty: "medium",
    ingredients: ["Black-eyed peas (2 cups)", "Red bell peppers", "Onions", "Palm oil", "Seasoning cubes", "Boiled eggs", "Carrots"],
    instructions: [
      "Blend peeled beans with peppers and onions",
      "Add seasoning cubes and palm oil",
      "Pour into containers with egg and carrot pieces",
      "Steam for 35-40 minutes until firm",
      "Serve hot"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 3,
    name: "Yam and Egg Sauce",
    description: "Boiled yam with scrambled eggs in tomato sauce - simple yet satisfying",
    meal_type: "breakfast",
    dietary_preference: "any",
    cooking_time: "quick",
    prep_time: "25 mins",
    difficulty: "easy",
    ingredients: ["White yam (1 tuber)", "Eggs (4 pieces)", "Tomatoes (3 medium)", "Onions", "Scotch bonnet pepper", "Vegetable oil"],
    instructions: [
      "Peel and boil yam until tender",
      "Blend tomatoes with onions and pepper",
      "Fry tomato mixture until thick",
      "Scramble eggs into the sauce",
      "Serve with boiled yam"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 4,
    name: "Bread and Tea",
    description: "Nigerian-style milk tea with fresh bread - perfect for busy mornings",
    meal_type: "breakfast",
    dietary_preference: "vegetarian",
    cooking_time: "quick",
    prep_time: "10 mins",
    difficulty: "easy",
    ingredients: ["Fresh bread", "Tea bags (Lipton)", "Peak milk", "Sugar", "Ginger", "Cloves"],
    instructions: [
      "Boil water with ginger and cloves",
      "Add tea bags and steep for 3 minutes",
      "Add milk and sugar to taste",
      "Serve hot with buttered bread"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 5,
    name: "Plantain Pancakes",
    description: "Sweet plantain pancakes with a Nigerian twist - kids love these!",
    meal_type: "breakfast",
    dietary_preference: "vegetarian",
    cooking_time: "quick",
    prep_time: "20 mins",
    difficulty: "easy",
    ingredients: ["Ripe plantain (2 pieces)", "Flour (1 cup)", "Eggs (2)", "Milk", "Sugar", "Nutmeg", "Baking powder"],
    instructions: [
      "Mash ripe plantains until smooth",
      "Mix with flour, eggs, and milk",
      "Add sugar, nutmeg, and baking powder",
      "Cook in hot pan like regular pancakes",
      "Serve with honey or syrup"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 6,
    name: "Jollof Rice",
    description: "The crown jewel of Nigerian cuisine - perfectly spiced rice that everyone loves",
    meal_type: "lunch",
    dietary_preference: "any",
    cooking_time: "regular",
    prep_time: "50 mins",
    difficulty: "medium",
    ingredients: ["Basmati rice (3 cups)", "Tomatoes (5 large)", "Red bell peppers", "Onions", "Chicken stock", "Bay leaves", "Thyme", "Curry powder"],
    instructions: [
      "Blend tomatoes and peppers together",
      "Fry blended mixture until thick and oily",
      "Add rice and chicken stock",
      "Season with spices and cook until tender",
      "Let it steam for 10 minutes before serving"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 7,
    name: "Egusi Soup with Pounded Yam",
    description: "Rich melon seed soup with assorted meat - a true comfort meal",
    meal_type: "lunch",
    dietary_preference: "any",
    cooking_time: "elaborate",
    prep_time: "75 mins",
    difficulty: "medium",
    ingredients: ["Ground egusi (2 cups)", "Spinach", "Assorted meat", "Stockfish", "Palm oil", "Onions", "Pounded yam"],
    instructions: [
      "Cook assorted meat with seasoning",
      "Heat palm oil and add ground egusi",
      "Add meat stock gradually",
      "Add vegetables and simmer",
      "Serve with pounded yam"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 8,
    name: "Fried Rice Nigerian Style",
    description: "Colorful rice with mixed vegetables - perfect for special occasions",
    meal_type: "lunch",
    dietary_preference: "any",
    cooking_time: "quick",
    prep_time: "35 mins",
    difficulty: "easy",
    ingredients: ["Rice (3 cups)", "Carrots", "Green beans", "Sweet corn", "Green peas", "Chicken", "Curry powder"],
    instructions: [
      "Parboil rice and set aside",
      "Dice all vegetables into small cubes",
      "Stir-fry vegetables with curry powder",
      "Add rice and mix gently",
      "Serve hot with fried chicken"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 9,
    name: "Pepper Soup",
    description: "Spicy, aromatic soup perfect for dinner - warms the soul",
    meal_type: "dinner",
    dietary_preference: "any",
    cooking_time: "regular",
    prep_time: "50 mins",
    difficulty: "easy",
    ingredients: ["Goat meat (1kg)", "Pepper soup spice", "Onions", "Ginger", "Garlic", "Scent leaves", "Yam"],
    instructions: [
      "Season and cook meat until tender",
      "Add pepper soup spice and aromatics",
      "Add yam pieces and cook until soft",
      "Garnish with scent leaves",
      "Serve hot"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 10,
    name: "Rice and Stew",
    description: "Classic white rice with rich tomato stew - a household favorite",
    meal_type: "dinner",
    dietary_preference: "any",
    cooking_time: "regular",
    prep_time: "60 mins",
    difficulty: "easy",
    ingredients: ["Rice (3 cups)", "Tomatoes (6 large)", "Beef", "Onions", "Red peppers", "Palm oil", "Seasoning cubes"],
    instructions: [
      "Cook rice until fluffy",
      "Blend tomatoes and peppers",
      "Fry beef until brown",
      "Cook tomato stew until thick",
      "Serve rice with stew"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 11,
    name: "Indomie and Egg",
    description: "Quick noodles with fried egg - for those really busy days",
    meal_type: "lunch",
    dietary_preference: "any",
    cooking_time: "quick",
    prep_time: "10 mins",
    difficulty: "easy",
    ingredients: ["Indomie noodles (2 packs)", "Eggs (2)", "Onions", "Tomatoes", "Vegetable oil"],
    instructions: [
      "Boil water and add noodles",
      "Fry eggs separately",
      "Add seasoning to noodles",
      "Serve with fried egg on top"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 12,
    name: "Plantain and Beans",
    description: "Sweet plantain with beans porridge - filling and nutritious",
    meal_type: "dinner",
    dietary_preference: "vegetarian",
    cooking_time: "regular",
    prep_time: "45 mins",
    difficulty: "easy",
    ingredients: ["Ripe plantain", "Brown beans", "Palm oil", "Onions", "Pepper", "Crayfish"],
    instructions: [
      "Cook beans until soft",
      "Add plantain pieces",
      "Season with palm oil and spices",
      "Simmer until plantain is tender",
      "Serve hot"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 13,
    name: "Amala and Ewedu",
    description: "Yam flour with jute leaf soup - a Yoruba classic",
    meal_type: "lunch",
    dietary_preference: "any",
    cooking_time: "regular",
    prep_time: "40 mins",
    difficulty: "medium",
    ingredients: ["Yam flour", "Ewedu leaves", "Locust beans", "Palm oil", "Assorted meat"],
    instructions: [
      "Boil water and gradually add yam flour",
      "Stir continuously to avoid lumps",
      "Blend ewedu leaves until smooth",
      "Cook with locust beans and palm oil",
      "Serve amala with ewedu soup"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 14,
    name: "Okra Soup",
    description: "Nutritious okra soup with assorted meat - sticky and delicious",
    meal_type: "dinner",
    dietary_preference: "any",
    cooking_time: "regular",
    prep_time: "45 mins",
    difficulty: "easy",
    ingredients: ["Fresh okra", "Assorted meat", "Fish", "Palm oil", "Onions", "Seasoning"],
    instructions: [
      "Cook meat until tender",
      "Slice okra into rings",
      "Add okra to meat stock",
      "Season and simmer until thick",
      "Serve with your choice of swallow"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 15,
    name: "Spaghetti Jollof",
    description: "Spaghetti cooked jollof style - a fusion favorite",
    meal_type: "dinner",
    dietary_preference: "any",
    cooking_time: "quick",
    prep_time: "30 mins",
    difficulty: "easy",
    ingredients: ["Spaghetti", "Tomatoes", "Onions", "Curry powder", "Thyme", "Chicken stock"],
    instructions: [
      "Blend tomatoes with onions",
      "Fry tomato mixture until thick",
      "Add spaghetti and chicken stock",
      "Cook until pasta is tender",
      "Serve hot"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 16,
    name: "Vegetable Soup",
    description: "Mixed vegetable soup with assorted meat - healthy and tasty",
    meal_type: "dinner",
    dietary_preference: "any",
    cooking_time: "regular",
    prep_time: "40 mins",
    difficulty: "easy",
    ingredients: ["Spinach", "Waterleaf", "Assorted meat", "Palm oil", "Crayfish", "Seasoning"],
    instructions: [
      "Cook meat with seasoning",
      "Chop vegetables roughly",
      "Add vegetables to meat stock",
      "Season with crayfish and palm oil",
      "Simmer briefly and serve"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 17,
    name: "Beans and Plantain Porridge",
    description: "One-pot meal with beans and plantain - very filling",
    meal_type: "lunch",
    dietary_preference: "vegetarian",
    cooking_time: "elaborate",
    prep_time: "65 mins",
    difficulty: "easy",
    ingredients: ["Brown beans", "Ripe plantain", "Palm oil", "Onions", "Pepper", "Spinach"],
    instructions: [
      "Cook beans until almost soft",
      "Add plantain pieces",
      "Season with palm oil and pepper",
      "Add spinach in the last 5 minutes",
      "Serve hot"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 18,
    name: "Catfish Pepper Soup",
    description: "Spicy catfish soup - perfect for cold evenings",
    meal_type: "dinner",
    dietary_preference: "any",
    cooking_time: "quick",
    prep_time: "35 mins",
    difficulty: "easy",
    ingredients: ["Fresh catfish", "Pepper soup spice", "Ginger", "Garlic", "Scent leaves", "Yam"],
    instructions: [
      "Clean and cut catfish into pieces",
      "Boil with pepper soup spice",
      "Add yam pieces",
      "Season with ginger and garlic",
      "Garnish with scent leaves"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 19,
    name: "White Rice and Chicken Stew",
    description: "Plain rice with rich chicken stew - always a winner",
    meal_type: "lunch",
    dietary_preference: "any",
    cooking_time: "regular",
    prep_time: "55 mins",
    difficulty: "easy",
    ingredients: ["Rice", "Chicken", "Tomatoes", "Onions", "Red peppers", "Palm oil"],
    instructions: [
      "Cook rice until fluffy",
      "Season and cook chicken",
      "Blend tomatoes and peppers",
      "Fry tomato mixture with chicken",
      "Serve rice with chicken stew"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 20,
    name: "Yam Porridge (Asaro)",
    description: "Yam cooked in tomato sauce - comfort food at its best",
    meal_type: "lunch",
    dietary_preference: "any",
    cooking_time: "regular",
    prep_time: "40 mins",
    difficulty: "easy",
    ingredients: ["White yam", "Tomatoes", "Onions", "Palm oil", "Fish", "Spinach"],
    instructions: [
      "Peel and cut yam into cubes",
      "Blend tomatoes with onions",
      "Cook yam with tomato mixture",
      "Add fish and seasonings",
      "Add spinach before serving"
    ],
    cuisine_type: "Nigerian"
  }
];

// Common Nigerian ingredients for ingredient-based suggestions
export const commonIngredients = [
  "Rice", "Plantain", "Yam", "Tomatoes", "Onions", "Pepper",
  "Beans", "Chicken", "Beef", "Fish", "Eggs", "Spinach",
  "Palm oil", "Vegetable oil", "Garlic", "Ginger", "Okra",
  "Sweet potato", "Carrots", "Green beans", "Bread"
];

// Meal type options
export const mealTypes = [
  { value: "breakfast", label: "Breakfast", emoji: "🌅" },
  { value: "lunch", label: "Lunch", emoji: "☀️" },
  { value: "dinner", label: "Dinner", emoji: "🌙" }
];

// Cooking time options
export const cookingTimes = [
  { value: "quick", label: "Quick (Under 30 mins)", emoji: "⚡" },
  { value: "regular", label: "Regular (30-60 mins)", emoji: "⏰" },
  { value: "elaborate", label: "Elaborate (60+ mins)", emoji: "🕐" }
];

// Dietary preferences
export const dietaryPreferences = [
  { value: "any", label: "Any" },
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" }
];
