// Comprehensive Nigerian meals database with improved recipes
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
    ingredients: [
      "Black-eyed peas (1 cup, soaked overnight)",
      "Onions (1 medium, roughly chopped)",
      "Scotch bonnet pepper (1-2 pieces, to taste)",
      "Salt (1/2 teaspoon)",
      "Fresh bread (4 slices)",
      "Palm oil (1/2 cup for frying)",
      "Water (1/4 cup for blending)"
    ],
    instructions: [
      "Soak black-eyed peas overnight, then peel off the skins by rubbing between your hands",
      "Rinse peeled beans and drain well",
      "Blend beans with onions, pepper, and water until smooth (not too watery)",
      "Add salt and mix well with a wooden spoon",
      "Heat palm oil in a deep pan until hot (test with a drop of batter)",
      "Drop spoonfuls of batter into hot oil and fry until golden brown on both sides",
      "Remove and drain on paper towels",
      "Serve hot with fresh bread and optional pepper sauce"
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
    ingredients: [
      "Black-eyed peas (2 cups, soaked overnight)",
      "Red bell peppers (2 medium, roughly chopped)",
      "Onions (1 large, roughly chopped)",
      "Palm oil (1/3 cup)",
      "Seasoning cubes (2 pieces, crushed)",
      "Boiled eggs (4 pieces, peeled and halved)",
      "Carrots (1 medium, diced)",
      "Salt (1 teaspoon)",
      "Water (1/2 cup for blending)"
    ],
    instructions: [
      "Soak black-eyed peas overnight, then peel off the skins",
      "Blend peeled beans with peppers, onions, and water until very smooth",
      "Transfer to a large bowl and add palm oil, crushed seasoning cubes, and salt",
      "Mix thoroughly with a wooden spoon until well combined",
      "Prepare containers (aluminum foil, banana leaves, or ramekins)",
      "Pour mixture into containers, add egg and carrot pieces",
      "Cover containers tightly with foil",
      "Steam in a large pot for 35-40 minutes until firm and cooked through",
      "Let cool for 5 minutes before serving"
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
    ingredients: [
      "White yam (1 medium tuber, peeled and cut into chunks)",
      "Eggs (4 pieces)",
      "Tomatoes (3 medium, roughly chopped)",
      "Onions (1 medium, diced)",
      "Scotch bonnet pepper (1 piece, chopped)",
      "Vegetable oil (3 tablespoons)",
      "Salt (1/2 teaspoon)",
      "Seasoning cube (1 piece, crushed)",
      "Water (for boiling yam)"
    ],
    instructions: [
      "Peel and cut yam into medium chunks, rinse well",
      "Boil yam in salted water until tender (about 15-20 minutes)",
      "While yam cooks, blend tomatoes with onions and pepper until smooth",
      "Heat oil in a pan and fry tomato mixture until thick and oily (about 8-10 minutes)",
      "Add crushed seasoning cube and salt, stir well",
      "Crack eggs into the sauce and scramble gently until just set",
      "Drain yam and serve hot with the egg sauce",
      "Optional: serve with fried plantains or bread"
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
    ingredients: [
      "Fresh bread (4-6 slices)",
      "Tea bags (2 Lipton or similar)",
      "Peak milk (1/2 cup)",
      "Sugar (2-3 tablespoons, to taste)",
      "Ginger (1/2 inch, peeled and sliced)",
      "Cloves (3-4 pieces)",
      "Water (2 cups)",
      "Butter (for bread, optional)"
    ],
    instructions: [
      "Bring water to boil in a kettle or pot",
      "Add ginger slices and cloves to boiling water",
      "Add tea bags and steep for 3-4 minutes",
      "Remove tea bags and add milk",
      "Add sugar to taste and stir well",
      "Let it simmer for 1 minute",
      "Strain into cups to remove ginger and cloves",
      "Serve hot with buttered bread or toast"
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
    ingredients: [
      "Ripe plantain (2 medium pieces, peeled and mashed)",
      "Flour (1 cup)",
      "Eggs (2 pieces)",
      "Milk (1/2 cup)",
      "Sugar (2 tablespoons)",
      "Nutmeg (1/4 teaspoon)",
      "Baking powder (1 teaspoon)",
      "Salt (1/4 teaspoon)",
      "Vegetable oil (for frying)",
      "Honey or syrup (for serving)"
    ],
    instructions: [
      "Mash ripe plantains until smooth in a large bowl",
      "Add eggs and milk, whisk until well combined",
      "In a separate bowl, mix flour, sugar, nutmeg, baking powder, and salt",
      "Gradually add dry ingredients to wet mixture, stirring gently",
      "Heat a non-stick pan over medium heat with a little oil",
      "Pour 1/4 cup batter for each pancake",
      "Cook until bubbles form on top (about 2-3 minutes)",
      "Flip and cook other side until golden (about 1-2 minutes)",
      "Serve hot with honey, syrup, or fresh fruit"
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
    ingredients: [
      "Basmati rice (3 cups, washed and drained)",
      "Tomatoes (5 large, roughly chopped)",
      "Red bell peppers (2 medium, roughly chopped)",
      "Onions (1 large, roughly chopped)",
      "Scotch bonnet pepper (1-2 pieces, to taste)",
      "Chicken stock (4 cups)",
      "Bay leaves (2 pieces)",
      "Thyme (1 teaspoon)",
      "Curry powder (2 tablespoons)",
      "Palm oil (1/2 cup)",
      "Seasoning cubes (2 pieces, crushed)",
      "Salt (1 teaspoon)",
      "Garlic (3 cloves, minced)",
      "Ginger (1 inch, minced)"
    ],
    instructions: [
      "Blend tomatoes, peppers, onions, and scotch bonnet until smooth",
      "Heat palm oil in a large pot until hot",
      "Add minced garlic and ginger, fry for 1 minute",
      "Pour in blended mixture and fry until thick and oily (about 15-20 minutes)",
      "Add crushed seasoning cubes, salt, thyme, curry powder, and bay leaves",
      "Stir well and add chicken stock",
      "Bring to boil and add washed rice",
      "Reduce heat to low, cover and cook for 20-25 minutes",
      "Check rice is tender, then let it steam for 10 minutes",
      "Fluff with fork and serve hot with grilled chicken or fish"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 7,
    name: "Boiled Yam with Palm Oil",
    description: "Simple and nutritious boiled yam served with palm oil and onions",
    meal_type: "breakfast",
    dietary_preference: "vegan",
    cooking_time: "quick",
    prep_time: "25 mins",
    difficulty: "easy",
    ingredients: [
      "Yam (2-3 medium tubers, peeled and cut into chunks)",
      "Palm oil (3 tablespoons)",
      "Salt (1 teaspoon)",
      "Onion (1 medium, chopped)",
      "Water (for boiling)"
    ],
    instructions: [
      "Peel and cut yam into medium chunks",
      "Boil water with salt in a pot",
      "Add yam pieces and cook for 15-20 minutes until tender",
      "Drain water and serve hot",
      "Drizzle palm oil over yam and sprinkle chopped onions"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 8,
    name: "Cereals with Milk",
    description: "Quick and easy breakfast with cornflakes or Golden Morn cereal",
    meal_type: "breakfast",
    dietary_preference: "lacto-vegetarian",
    cooking_time: "quick",
    prep_time: "3 mins",
    difficulty: "easy",
    ingredients: [
      "Cornflakes or Golden Morn cereal (1 cup)",
      "Cold milk (1 cup)",
      "Sugar (1-2 tablespoons, optional)",
      "Fresh fruits (optional)"
    ],
    instructions: [
      "Pour cereal into a bowl",
      "Add cold milk",
      "Add sugar if desired",
      "Top with fresh fruits if available",
      "Serve immediately"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 9,
    name: "Fried Plantain and Egg",
    description: "Delicious combination of fried plantains with scrambled eggs",
    meal_type: "breakfast",
    dietary_preference: "lacto-vegetarian",
    cooking_time: "quick",
    prep_time: "20 mins",
    difficulty: "easy",
    ingredients: [
      "Ripe plantains (2 pieces, peeled and sliced)",
      "Eggs (3-4 pieces)",
      "Vegetable oil (3 tablespoons)",
      "Salt and pepper (to taste)",
      "Onion (1 small, chopped, optional)"
    ],
    instructions: [
      "Peel and slice plantains diagonally",
      "Heat 2 tablespoons oil in a pan",
      "Fry plantain slices until golden brown (8-10 minutes)",
      "In another pan, scramble eggs with remaining oil",
      "Season eggs with salt, pepper, and onions",
      "Serve plantain and eggs together"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 10,
    name: "Bread and Egg",
    description: "Simple scrambled eggs served with fresh bread",
    meal_type: "breakfast",
    dietary_preference: "lacto-vegetarian",
    cooking_time: "quick",
    prep_time: "15 mins",
    difficulty: "easy",
    ingredients: [
      "Bread (4-6 slices)",
      "Eggs (3-4 pieces)",
      "Vegetable oil or butter (2 tablespoons)",
      "Salt and pepper (to taste)",
      "Onion (1 small, chopped)",
      "Tomato (1 piece, chopped)"
    ],
    instructions: [
      "Heat oil in a pan",
      "Sauté onions and tomatoes for 2-3 minutes",
      "Beat eggs and pour into pan",
      "Scramble eggs until cooked (5-7 minutes)",
      "Season with salt and pepper",
      "Serve with fresh bread slices"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 11,
    name: "Boiled Yam and Stew",
    description: "Boiled yam served with leftover tomato stew",
    meal_type: "breakfast",
    dietary_preference: "any",
    cooking_time: "quick",
    prep_time: "30 mins",
    difficulty: "medium",
    ingredients: [
      "Yam (2-3 medium tubers, peeled and cut into chunks)",
      "Leftover tomato stew (1 cup, with meat/fish)",
      "Water (for boiling)",
      "Salt (to taste)"
    ],
    instructions: [
      "Peel and cut yam into chunks",
      "Boil salted water in a pot",
      "Cook yam for 15-20 minutes until tender",
      "Heat leftover stew in a separate pan (5-8 minutes)",
      "Serve hot yam with warm stew"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 12,
    name: "Bread and Egg Sandwich",
    description: "Delicious egg sandwich perfect for breakfast on the go",
    meal_type: "breakfast",
    dietary_preference: "lacto-vegetarian",
    cooking_time: "quick",
    prep_time: "12 mins",
    difficulty: "easy",
    ingredients: [
      "Bread (6 slices)",
      "Eggs (3 pieces)",
      "Butter or margarine (2 tablespoons)",
      "Salt and pepper (to taste)",
      "Onion (1 small, chopped)",
      "Tomato (1 piece, sliced)"
    ],
    instructions: [
      "Scramble eggs with onions in a pan (5-7 minutes)",
      "Season with salt and pepper",
      "Butter bread slices lightly",
      "Place scrambled eggs between bread slices",
      "Add tomato slices if desired",
      "Cut sandwich in half and serve"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 13,
    name: "Fried Plantain and Fish",
    description: "Fried plantains served with small fish for protein",
    meal_type: "breakfast",
    dietary_preference: "pescatarian",
    cooking_time: "quick",
    prep_time: "25 mins",
    difficulty: "easy",
    ingredients: [
      "Ripe plantains (2 pieces, peeled and sliced)",
      "Small fish (4-6 sardines or mackerel)",
      "Vegetable oil (4 tablespoons)",
      "Salt and pepper (to taste)",
      "Lemon (1 piece, for fish seasoning)"
    ],
    instructions: [
      "Clean and season fish with salt, pepper, and lemon",
      "Peel and slice plantains",
      "Heat oil in a pan",
      "Fry fish until golden (8-10 minutes), set aside",
      "Fry plantain slices until golden (8-10 minutes)",
      "Serve together while hot"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 14,
    name: "Boiled Sweet Potato and Tomato Sauce",
    description: "Healthy boiled sweet potatoes with homemade tomato sauce",
    meal_type: "breakfast",
    dietary_preference: "vegan",
    cooking_time: "quick",
    prep_time: "25 mins",
    difficulty: "easy",
    ingredients: [
      "Sweet potatoes (3-4 medium pieces)",
      "Tomatoes (3 large pieces)",
      "Onion (1 small piece)",
      "Palm oil (2 tablespoons)",
      "Salt and pepper (to taste)",
      "Stock cube (1 piece)"
    ],
    instructions: [
      "Peel and boil sweet potatoes until tender (15-18 minutes)",
      "Blend tomatoes and onions",
      "Heat palm oil in a pan",
      "Fry tomato mixture for 8-10 minutes",
      "Season with salt, pepper, and stock cube",
      "Serve sweet potatoes with tomato sauce"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 15,
    name: "Fried Irish Potato and Egg",
    description: "Crispy fried potatoes served with scrambled eggs",
    meal_type: "breakfast",
    dietary_preference: "lacto-vegetarian",
    cooking_time: "quick",
    prep_time: "25 mins",
    difficulty: "easy",
    ingredients: [
      "Irish potatoes (4-5 medium pieces)",
      "Eggs (3-4 pieces)",
      "Vegetable oil (4 tablespoons)",
      "Salt and pepper (to taste)",
      "Onion (1 small, chopped)"
    ],
    instructions: [
      "Peel and slice potatoes into rounds",
      "Heat oil in a pan",
      "Fry potato slices until golden (12-15 minutes)",
      "In another pan, scramble eggs with onions (5-7 minutes)",
      "Season with salt and pepper",
      "Serve potatoes and eggs together"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 16,
    name: "Bread and Sardine",
    description: "Quick sardine sandwich perfect for protein-rich breakfast",
    meal_type: "breakfast",
    dietary_preference: "pescatarian",
    cooking_time: "quick",
    prep_time: "8 mins",
    difficulty: "easy",
    ingredients: [
      "Bread (4-6 slices)",
      "Sardines (1 can)",
      "Onion (1 small, chopped)",
      "Tomato (1 piece, chopped)",
      "Mayonnaise (2 tablespoons, optional)",
      "Salt and pepper (to taste)"
    ],
    instructions: [
      "Open sardine can and drain oil",
      "Mash sardines lightly with a fork",
      "Mix with chopped onions and tomatoes",
      "Add mayonnaise if desired",
      "Season with salt and pepper",
      "Spread mixture on bread and serve"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 17,
    name: "Custard and Milk",
    description: "Smooth custard with milk - perfect soft food breakfast",
    meal_type: "breakfast",
    dietary_preference: "lacto-vegetarian",
    cooking_time: "quick",
    prep_time: "10 mins",
    difficulty: "easy",
    ingredients: [
      "Custard powder (3 tablespoons)",
      "Milk (2 cups)",
      "Sugar (2-3 tablespoons)",
      "Hot water (1 cup)"
    ],
    instructions: [
      "Mix custard powder with little cold milk to form paste",
      "Boil remaining milk with sugar",
      "Add custard paste to boiling milk while stirring",
      "Cook for 3-5 minutes until thickened",
      "Add hot water if too thick",
      "Serve warm or cold"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 18,
    name: "Boiled Egg and Bread",
    description: "Simple boiled eggs served with fresh bread",
    meal_type: "breakfast",
    dietary_preference: "lacto-vegetarian",
    cooking_time: "quick",
    prep_time: "15 mins",
    difficulty: "easy",
    ingredients: [
      "Eggs (4-6 pieces)",
      "Bread (4-6 slices)",
      "Salt and pepper (to taste)",
      "Butter or margarine",
      "Water (for boiling)"
    ],
    instructions: [
      "Boil water in a pot",
      "Gently add eggs and boil for 8-10 minutes",
      "Remove eggs and place in cold water",
      "Peel eggs when cool",
      "Butter bread slices",
      "Serve boiled eggs with bread"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 19,
    name: "Toast Bread with Jam",
    description: "Simple toast with jam - quick and delicious",
    meal_type: "breakfast",
    dietary_preference: "lacto-vegetarian",
    cooking_time: "quick",
    prep_time: "8 mins",
    difficulty: "easy",
    ingredients: [
      "Bread (4-6 slices)",
      "Jam (3-4 tablespoons, strawberry or mixed fruit)",
      "Butter (optional)"
    ],
    instructions: [
      "Toast bread slices in a toaster or pan until golden",
      "Spread butter lightly if desired",
      "Apply jam generously on toast",
      "Serve immediately while warm"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 20,
    name: "Bread and Butter with Tea",
    description: "Classic Nigerian breakfast with buttered bread and tea",
    meal_type: "breakfast",
    dietary_preference: "lacto-vegetarian",
    cooking_time: "quick",
    prep_time: "10 mins",
    difficulty: "easy",
    ingredients: [
      "Bread (4-6 slices)",
      "Butter or margarine (3 tablespoons)",
      "Tea bags (2 pieces) or loose tea (2 teaspoons)",
      "Water (2 cups)",
      "Sugar and milk (to taste)"
    ],
    instructions: [
      "Boil water for tea",
      "Add tea bags or loose tea and steep for 3-5 minutes",
      "Butter bread slices generously",
      "Add milk and sugar to tea as desired",
      "Serve buttered bread with hot tea"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 21,
    name: "Bread and Mayonnaise",
    description: "Simple mayonnaise sandwich with optional vegetables",
    meal_type: "breakfast",
    dietary_preference: "lacto-vegetarian",
    cooking_time: "quick",
    prep_time: "5 mins",
    difficulty: "easy",
    ingredients: [
      "Bread (4-6 slices)",
      "Mayonnaise (3-4 tablespoons)",
      "Onion (1 small, chopped, optional)",
      "Tomato (1 piece, sliced, optional)",
      "Lettuce leaves (optional)"
    ],
    instructions: [
      "Spread mayonnaise evenly on bread slices",
      "Add chopped onions if desired",
      "Layer with tomato slices and lettuce",
      "Make into sandwiches or serve open",
      "Cut and serve immediately"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 22,
    name: "Pap and Biscuit",
    description: "Traditional pap with digestive biscuits for dipping",
    meal_type: "breakfast",
    dietary_preference: "lacto-vegetarian",
    cooking_time: "quick",
    prep_time: "12 mins",
    difficulty: "easy",
    ingredients: [
      "Pap flour (1/2 cup)",
      "Water (2 cups)",
      "Milk (1/2 cup)",
      "Sugar (2 tablespoons)",
      "Digestive biscuits (6-8 pieces)"
    ],
    instructions: [
      "Mix pap flour with little cold water to form paste",
      "Boil remaining water",
      "Add pap paste while stirring continuously",
      "Cook for 5-7 minutes until smooth",
      "Add milk and sugar",
      "Serve hot with biscuits for dipping"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 23,
    name: "Bread and Corned Beef",
    description: "Hearty corned beef sandwich with vegetables",
    meal_type: "breakfast",
    dietary_preference: "any",
    cooking_time: "quick",
    prep_time: "10 mins",
    difficulty: "easy",
    ingredients: [
      "Bread (4-6 slices)",
      "Corned beef (1 can)",
      "Onion (1 small, chopped)",
      "Tomato (1 piece, chopped)",
      "Vegetable oil (2 tablespoons)",
      "Salt and pepper (to taste)"
    ],
    instructions: [
      "Heat oil in a pan",
      "Sauté onions until soft (2-3 minutes)",
      "Add corned beef and tomatoes",
      "Cook for 5-6 minutes while stirring",
      "Season with salt and pepper",
      "Serve hot with bread"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 24,
    name: "Boiled Plantain and Oil",
    description: "Simple boiled plantains served with palm oil",
    meal_type: "breakfast",
    dietary_preference: "vegan",
    cooking_time: "quick",
    prep_time: "20 mins",
    difficulty: "easy",
    ingredients: [
      "Unripe plantains (3-4 pieces, peeled and cut into chunks)",
      "Palm oil (3 tablespoons)",
      "Salt (to taste)",
      "Water (for boiling)",
      "Onion (1 small, chopped)"
    ],
    instructions: [
      "Peel and cut plantains into chunks",
      "Boil salted water in a pot",
      "Cook plantains for 12-15 minutes until tender",
      "Drain water",
      "Serve hot with palm oil and chopped onions"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 25,
    name: "Fried Yam and Tomato Sauce",
    description: "Crispy fried yam chips with homemade tomato sauce",
    meal_type: "breakfast",
    dietary_preference: "vegan",
    cooking_time: "quick",
    prep_time: "30 mins",
    difficulty: "easy",
    ingredients: [
      "Yam (2-3 medium tubers, peeled and sliced)",
      "Tomatoes (3 large pieces)",
      "Onion (1 small piece)",
      "Palm oil (3 tablespoons)",
      "Salt, pepper, and stock cube",
      "Vegetable oil (for frying)"
    ],
    instructions: [
      "Peel and slice yam into chips",
      "Fry yam slices until golden (12-15 minutes)",
      "Blend tomatoes and onions",
      "Heat palm oil and fry tomato mixture (8-10 minutes)",
      "Season sauce with salt, pepper, and stock cube",
      "Serve fried yam with tomato sauce"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 26,
    name: "Fried Plantain and Pepper Sauce",
    description: "Fried plantains with spicy pepper sauce",
    meal_type: "breakfast",
    dietary_preference: "vegan",
    cooking_time: "quick",
    prep_time: "25 mins",
    difficulty: "easy",
    ingredients: [
      "Ripe plantains (2 pieces, peeled and sliced)",
      "Red bell peppers (2 pieces)",
      "Scotch bonnet pepper (1 piece)",
      "Onion (1 small piece)",
      "Palm oil (3 tablespoons)",
      "Salt and stock cube",
      "Vegetable oil (for frying)"
    ],
    instructions: [
      "Peel and slice plantains",
      "Fry plantain slices until golden (8-10 minutes)",
      "Blend peppers and onions roughly",
      "Heat palm oil and fry pepper mixture (8-10 minutes)",
      "Season with salt and stock cube",
      "Serve fried plantain with pepper sauce"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 27,
    name: "Boiled Potato and Palm Oil",
    description: "Simple boiled potatoes served with palm oil",
    meal_type: "breakfast",
    dietary_preference: "vegan",
    cooking_time: "quick",
    prep_time: "25 mins",
    difficulty: "easy",
    ingredients: [
      "Irish potatoes (4-5 medium pieces)",
      "Palm oil (3 tablespoons)",
      "Salt (to taste)",
      "Onion (1 small, chopped)",
      "Water (for boiling)"
    ],
    instructions: [
      "Peel potatoes and cut into chunks",
      "Boil salted water in a pot",
      "Cook potatoes for 15-20 minutes until tender",
      "Drain water",
      "Serve hot with palm oil and chopped onions"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 28,
    name: "Boiled Plantain and Pepper Soup",
    description: "Boiled plantains served with spicy pepper soup broth",
    meal_type: "breakfast",
    dietary_preference: "pescatarian",
    cooking_time: "quick",
    prep_time: "30 mins",
    difficulty: "medium",
    ingredients: [
      "Unripe plantains (3-4 pieces, peeled and cut into chunks)",
      "Fish or chicken stock (1 cup)",
      "Ground pepper soup spice (1 teaspoon)",
      "Stock cube (1 piece)",
      "Salt (to taste)",
      "Fresh uziza leaves (optional)"
    ],
    instructions: [
      "Peel and cut plantains into chunks",
      "Boil plantains in salted water (12-15 minutes)",
      "In another pot, heat fish/chicken stock",
      "Add pepper soup spice and stock cube",
      "Simmer for 8-10 minutes",
      "Serve hot plantain with pepper soup broth"
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
    ingredients: [
      "Ground egusi (2 cups)",
      "Spinach (2 bunches, washed and chopped)",
      "Assorted meat (1kg - beef, goat, tripe)",
      "Stockfish (200g, soaked and cleaned)",
      "Palm oil (1 cup)",
      "Onions (2 medium, diced)",
      "Scotch bonnet pepper (2 pieces, chopped)",
      "Seasoning cubes (3 pieces, crushed)",
      "Salt (1 teaspoon)",
      "Crayfish (2 tablespoons, ground)",
      "Pounded yam (for serving)",
      "Water (6 cups)"
    ],
    instructions: [
      "Season and cook assorted meat with onions, salt, and seasoning cubes until tender (about 45 minutes)",
      "Add soaked stockfish and cook for additional 15 minutes",
      "Remove meat and stockfish, reserve stock",
      "Heat palm oil in a large pot until hot",
      "Add ground egusi and fry, stirring constantly until golden (about 10 minutes)",
      "Gradually add meat stock while stirring to avoid lumps",
      "Add cooked meat and stockfish",
      "Add crayfish and simmer for 10 minutes",
      "Add chopped spinach and simmer for 5 minutes",
      "Adjust seasoning and serve hot with pounded yam"
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
    ingredients: [
      "Rice (3 cups, parboiled and drained)",
      "Carrots (2 medium, diced)",
      "Green beans (1 cup, chopped)",
      "Sweet corn (1/2 cup)",
      "Green peas (1/2 cup)",
      "Chicken (500g, diced)",
      "Curry powder (2 tablespoons)",
      "Thyme (1 teaspoon)",
      "Onions (1 medium, diced)",
      "Vegetable oil (1/3 cup)",
      "Seasoning cubes (2 pieces, crushed)",
      "Salt (1 teaspoon)",
      "Garlic (2 cloves, minced)"
    ],
    instructions: [
      "Parboil rice for 5 minutes, drain and set aside",
      "Season chicken with salt, curry powder, and crushed seasoning cubes",
      "Heat oil in a large wok or pan",
      "Fry chicken until golden brown, remove and set aside",
      "In same oil, sauté onions and garlic until fragrant",
      "Add diced vegetables and stir-fry for 3-4 minutes",
      "Add curry powder and thyme, stir well",
      "Add parboiled rice and mix gently",
      "Add fried chicken and stir-fry for 5-7 minutes",
      "Season with salt and serve hot"
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
    ingredients: [
      "Goat meat (1kg, cut into pieces)",
      "Pepper soup spice (2 tablespoons)",
      "Onions (1 large, sliced)",
      "Ginger (1 inch, sliced)",
      "Garlic (4 cloves, minced)",
      "Scent leaves (1 bunch, washed)",
      "Yam (1 medium, peeled and cubed)",
      "Scotch bonnet pepper (2 pieces, whole)",
      "Seasoning cubes (2 pieces, crushed)",
      "Salt (1 teaspoon)",
      "Water (6 cups)"
    ],
    instructions: [
      "Clean and cut goat meat into medium pieces",
      "Season meat with salt, crushed seasoning cubes, and pepper soup spice",
      "Place meat in a large pot with water and bring to boil",
      "Reduce heat and simmer until meat is tender (about 30-40 minutes)",
      "Add yam cubes and cook until soft (about 15 minutes)",
      "Add sliced onions, ginger, garlic, and whole scotch bonnet",
      "Simmer for additional 10 minutes",
      "Add scent leaves in the last 2 minutes",
      "Adjust seasoning and serve hot"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 10,
    name: "Rice and Stew",
    description: "Classic white rice with rich tomato stew - a household favorite",
    meal_type: "dinner",
    dietary_preference: "any",
    cooking_time: "elaborate",
    prep_time: "60 mins",
    difficulty: "easy",
    ingredients: [
      "Rice (3 cups, washed and drained)",
      "Tomatoes (6 large, roughly chopped)",
      "Beef (500g, cut into pieces)",
      "Onions (2 medium, roughly chopped)",
      "Red peppers (2 medium, roughly chopped)",
      "Palm oil (1/2 cup)",
      "Seasoning cubes (2 pieces, crushed)",
      "Salt (1 teaspoon)",
      "Garlic (3 cloves, minced)",
      "Ginger (1 inch, minced)",
      "Water (for cooking rice and stew)"
    ],
    instructions: [
      "Cook rice in salted water until fluffy, drain and set aside",
      "Season beef with salt and crushed seasoning cubes",
      "Blend tomatoes, peppers, and onions until smooth",
      "Heat palm oil in a large pot until hot",
      "Add minced garlic and ginger, fry for 1 minute",
      "Add seasoned beef and fry until brown on all sides",
      "Pour in blended tomato mixture and fry until thick and oily (about 20 minutes)",
      "Add water if needed and simmer until meat is tender",
      "Adjust seasoning and serve hot rice with stew"
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
    ingredients: [
      "Indomie noodles (2 packs)",
      "Eggs (2 pieces)",
      "Onions (1 small, diced)",
      "Tomatoes (1 medium, diced)",
      "Vegetable oil (2 tablespoons)",
      "Seasoning (from noodle packs)",
      "Salt (to taste)",
      "Water (4 cups for boiling)"
    ],
    instructions: [
      "Bring water to boil in a pot",
      "Add noodles and cook for 3 minutes",
      "Drain noodles and set aside",
      "Heat oil in a pan and fry diced onions until translucent",
      "Add diced tomatoes and fry for 2 minutes",
      "Push vegetables to one side and fry eggs in the same pan",
      "Add cooked noodles and seasoning packets",
      "Mix well and cook for 2 minutes",
      "Serve hot with fried egg on top"
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
    ingredients: [
      "Ripe plantain (2 medium, peeled and cut into chunks)",
      "Brown beans (2 cups, soaked overnight)",
      "Palm oil (1/3 cup)",
      "Onions (1 medium, diced)",
      "Scotch bonnet pepper (1 piece, chopped)",
      "Crayfish (2 tablespoons, ground)",
      "Seasoning cubes (2 pieces, crushed)",
      "Salt (1 teaspoon)",
      "Water (6 cups)"
    ],
    instructions: [
      "Soak beans overnight, then rinse and drain",
      "Cook beans in water until almost soft (about 30 minutes)",
      "Add plantain chunks and cook for 10 minutes",
      "Add palm oil, diced onions, and pepper",
      "Add crayfish, crushed seasoning cubes, and salt",
      "Simmer until plantain is tender and beans are soft",
      "Stir gently to avoid breaking plantain",
      "Serve hot with optional fried fish or meat"
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
    ingredients: [
      "Yam flour (2 cups)",
      "Ewedu leaves (1 bunch, washed)",
      "Locust beans (2 tablespoons)",
      "Palm oil (1/4 cup)",
      "Assorted meat (500g, cooked)",
      "Scotch bonnet pepper (1 piece)",
      "Seasoning cubes (2 pieces, crushed)",
      "Salt (1 teaspoon)",
      "Water (for cooking)"
    ],
    instructions: [
      "Cook assorted meat with seasoning until tender, reserve stock",
      "Blend ewedu leaves with a little water until smooth",
      "Pour blended ewedu into a pot with meat stock",
      "Add locust beans, palm oil, and crushed seasoning cubes",
      "Cook on medium heat, stirring occasionally until thick (about 15 minutes)",
      "For amala: bring water to boil in a separate pot",
      "Gradually add yam flour while stirring vigorously to avoid lumps",
      "Continue stirring until smooth and stretchy",
      "Serve hot amala with ewedu soup and meat"
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
    ingredients: [
      "Fresh okra (500g, sliced into rings)",
      "Assorted meat (500g, cut into pieces)",
      "Fish (200g, cleaned and cut)",
      "Palm oil (1/2 cup)",
      "Onions (1 medium, diced)",
      "Scotch bonnet pepper (2 pieces, chopped)",
      "Seasoning cubes (2 pieces, crushed)",
      "Crayfish (2 tablespoons, ground)",
      "Salt (1 teaspoon)",
      "Water (4 cups)"
    ],
    instructions: [
      "Season and cook assorted meat until tender, reserve stock",
      "Add fish to meat stock and cook for 10 minutes",
      "Remove fish and meat, set aside",
      "Heat palm oil in a pot and sauté onions until translucent",
      "Add sliced okra and stir-fry for 3-4 minutes",
      "Add meat stock gradually while stirring",
      "Add crayfish, crushed seasoning cubes, and salt",
      "Add cooked meat and fish",
      "Simmer until okra is tender and soup is thick",
      "Serve hot with your choice of swallow (eba, amala, etc.)"
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
    ingredients: [
      "Spaghetti (400g)",
      "Tomatoes (4 large, roughly chopped)",
      "Onions (1 medium, roughly chopped)",
      "Red bell peppers (2 medium, roughly chopped)",
      "Curry powder (2 tablespoons)",
      "Thyme (1 teaspoon)",
      "Chicken stock (4 cups)",
      "Palm oil (1/3 cup)",
      "Seasoning cubes (2 pieces, crushed)",
      "Salt (1 teaspoon)",
      "Garlic (2 cloves, minced)"
    ],
    instructions: [
      "Blend tomatoes, peppers, and onions until smooth",
      "Heat palm oil in a large pot until hot",
      "Add minced garlic and fry for 1 minute",
      "Pour in blended mixture and fry until thick and oily (about 15 minutes)",
      "Add curry powder, thyme, crushed seasoning cubes, and salt",
      "Add chicken stock and bring to boil",
      "Add spaghetti and cook according to package instructions",
      "Stir occasionally to prevent sticking",
      "Cook until pasta is tender and sauce is thick",
      "Serve hot with grilled chicken or fish"
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
    ingredients: [
      "Spinach (2 bunches, washed and chopped)",
      "Waterleaf (1 bunch, washed and chopped)",
      "Assorted meat (500g, cut into pieces)",
      "Palm oil (1/2 cup)",
      "Crayfish (3 tablespoons, ground)",
      "Seasoning cubes (2 pieces, crushed)",
      "Onions (1 medium, diced)",
      "Scotch bonnet pepper (1 piece, chopped)",
      "Salt (1 teaspoon)",
      "Water (4 cups)"
    ],
    instructions: [
      "Season and cook assorted meat until tender, reserve stock",
      "Heat palm oil in a pot and sauté onions until translucent",
      "Add chopped pepper and fry for 1 minute",
      "Add meat stock and bring to boil",
      "Add chopped vegetables (waterleaf first, then spinach)",
      "Add crayfish, crushed seasoning cubes, and salt",
      "Simmer for 5-7 minutes until vegetables are tender",
      "Add cooked meat and simmer for 2 minutes",
      "Serve hot with your choice of swallow"
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
    ingredients: [
      "Brown beans (2 cups, soaked overnight)",
      "Ripe plantain (2 medium, peeled and cut into chunks)",
      "Palm oil (1/2 cup)",
      "Onions (1 medium, diced)",
      "Scotch bonnet pepper (1 piece, chopped)",
      "Spinach (1 bunch, washed and chopped)",
      "Crayfish (2 tablespoons, ground)",
      "Seasoning cubes (2 pieces, crushed)",
      "Salt (1 teaspoon)",
      "Water (6 cups)"
    ],
    instructions: [
      "Soak beans overnight, then rinse and drain",
      "Cook beans in water until almost soft (about 40 minutes)",
      "Add plantain chunks and cook for 10 minutes",
      "Add palm oil, diced onions, and chopped pepper",
      "Add crayfish, crushed seasoning cubes, and salt",
      "Simmer until plantain is tender and beans are soft",
      "Add chopped spinach in the last 5 minutes",
      "Stir gently to avoid breaking plantain",
      "Serve hot with optional fried fish or meat"
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
    ingredients: [
      "Fresh catfish (1kg, cleaned and cut into pieces)",
      "Pepper soup spice (2 tablespoons)",
      "Ginger (1 inch, sliced)",
      "Garlic (4 cloves, minced)",
      "Scent leaves (1 bunch, washed)",
      "Yam (1 medium, peeled and cubed)",
      "Onions (1 medium, sliced)",
      "Scotch bonnet pepper (2 pieces, whole)",
      "Seasoning cubes (2 pieces, crushed)",
      "Salt (1 teaspoon)",
      "Water (4 cups)"
    ],
    instructions: [
      "Clean and cut catfish into medium pieces",
      "Season fish with salt, crushed seasoning cubes, and pepper soup spice",
      "Place fish in a large pot with water and bring to boil",
      "Add yam cubes and cook until soft (about 15 minutes)",
      "Add sliced onions, ginger, garlic, and whole scotch bonnet",
      "Simmer for additional 10 minutes",
      "Add scent leaves in the last 2 minutes",
      "Adjust seasoning and serve hot"
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
    ingredients: [
      "Rice (3 cups, washed and drained)",
      "Chicken (1kg, cut into pieces)",
      "Tomatoes (5 large, roughly chopped)",
      "Onions (2 medium, roughly chopped)",
      "Red peppers (2 medium, roughly chopped)",
      "Palm oil (1/2 cup)",
      "Seasoning cubes (2 pieces, crushed)",
      "Salt (1 teaspoon)",
      "Garlic (3 cloves, minced)",
      "Ginger (1 inch, minced)",
      "Water (for cooking rice and stew)"
    ],
    instructions: [
      "Cook rice in salted water until fluffy, drain and set aside",
      "Season chicken with salt and crushed seasoning cubes",
      "Blend tomatoes, peppers, and onions until smooth",
      "Heat palm oil in a large pot until hot",
      "Add minced garlic and ginger, fry for 1 minute",
      "Add seasoned chicken and fry until brown on all sides",
      "Pour in blended tomato mixture and fry until thick and oily (about 20 minutes)",
      "Add water if needed and simmer until chicken is tender",
      "Adjust seasoning and serve hot rice with chicken stew"
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
    ingredients: [
      "White yam (1 large tuber, peeled and cut into cubes)",
      "Tomatoes (4 large, roughly chopped)",
      "Onions (1 medium, roughly chopped)",
      "Palm oil (1/3 cup)",
      "Fish (200g, cleaned and cut)",
      "Spinach (1 bunch, washed and chopped)",
      "Scotch bonnet pepper (1 piece, chopped)",
      "Seasoning cubes (2 pieces, crushed)",
      "Salt (1 teaspoon)",
      "Water (3 cups)"
    ],
    instructions: [
      "Peel and cut yam into medium cubes, rinse well",
      "Blend tomatoes, onions, and pepper until smooth",
      "Heat palm oil in a large pot until hot",
      "Pour in blended mixture and fry until thick (about 10 minutes)",
      "Add yam cubes and stir to coat with sauce",
      "Add water, crushed seasoning cubes, and salt",
      "Add fish and simmer until yam is tender (about 20 minutes)",
      "Add chopped spinach in the last 5 minutes",
      "Stir gently and serve hot"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 21,
    name: "Halal Chicken Suya",
    description: "Spicy grilled chicken skewers with traditional Nigerian spices - perfect for halal diets",
    meal_type: "dinner",
    dietary_preference: "halal",
    cooking_time: "regular",
    prep_time: "45 mins",
    difficulty: "medium",
    ingredients: [
      "Chicken breast (500g, cut into cubes)",
      "Groundnut powder (1/2 cup)",
      "Cayenne pepper (2 tablespoons)",
      "Paprika (1 tablespoon)",
      "Garlic powder (1 teaspoon)",
      "Ginger powder (1 teaspoon)",
      "Onion powder (1 teaspoon)",
      "Vegetable oil (3 tablespoons)",
      "Salt (1 teaspoon)",
      "Skewers (for grilling)"
    ],
    instructions: [
      "Cut chicken breast into 1-inch cubes",
      "Mix groundnut powder, cayenne pepper, paprika, garlic powder, ginger powder, onion powder, and salt",
      "Coat chicken cubes with the spice mixture",
      "Thread chicken onto skewers",
      "Heat vegetable oil in a grill pan or outdoor grill",
      "Grill chicken skewers for 8-10 minutes on each side until cooked through",
      "Serve hot with sliced onions and tomatoes"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 22,
    name: "Pescatarian Fish Pepper Soup",
    description: "Spicy fish soup with traditional Nigerian herbs - perfect for pescatarian diets",
    meal_type: "dinner",
    dietary_preference: "pescatarian",
    cooking_time: "quick",
    prep_time: "30 mins",
    difficulty: "easy",
    ingredients: [
      "Fresh fish (500g, cleaned and cut)",
      "Scotch bonnet pepper (2 pieces)",
      "Onions (1 medium, sliced)",
      "Garlic (3 cloves, minced)",
      "Ginger (1 inch, minced)",
      "Utazi leaves (2 pieces)",
      "Uziza leaves (2 pieces)",
      "Vegetable oil (2 tablespoons)",
      "Salt (1 teaspoon)",
      "Water (4 cups)"
    ],
    instructions: [
      "Clean and cut fish into pieces",
      "Heat vegetable oil in a pot",
      "Add sliced onions, minced garlic, and ginger, fry for 2 minutes",
      "Add fish pieces and fry for 3 minutes",
      "Add water, salt, and scotch bonnet pepper",
      "Add utazi and uziza leaves",
      "Simmer for 15-20 minutes until fish is cooked",
      "Serve hot with boiled yam or rice"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 23,
    name: "Gluten-Free Yam and Vegetable Stew",
    description: "Delicious yam stew with fresh vegetables - perfect for gluten-free diets",
    meal_type: "lunch",
    dietary_preference: "gluten_free",
    cooking_time: "regular",
    prep_time: "40 mins",
    difficulty: "easy",
    ingredients: [
      "White yam (1 large tuber, peeled and cut)",
      "Tomatoes (4 large, chopped)",
      "Bell peppers (2 medium, chopped)",
      "Onions (1 medium, chopped)",
      "Spinach (1 bunch, chopped)",
      "Vegetable oil (1/3 cup)",
      "Garlic (3 cloves, minced)",
      "Ginger (1 inch, minced)",
      "Salt (1 teaspoon)",
      "Water (3 cups)"
    ],
    instructions: [
      "Peel and cut yam into cubes, rinse well",
      "Heat vegetable oil in a large pot",
      "Add chopped onions, garlic, and ginger, fry for 2 minutes",
      "Add chopped tomatoes and bell peppers, fry for 5 minutes",
      "Add yam cubes and stir to coat with sauce",
      "Add water and salt, simmer for 20 minutes",
      "Add chopped spinach in the last 5 minutes",
      "Serve hot"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 24,
    name: "High-Protein Beef and Beans Stew",
    description: "Protein-rich beef stew with beans - perfect for muscle building and fitness",
    meal_type: "dinner",
    dietary_preference: "high_protein",
    cooking_time: "elaborate",
    prep_time: "50 mins",
    difficulty: "medium",
    ingredients: [
      "Beef (500g, cut into cubes)",
      "Black-eyed beans (2 cups, soaked overnight)",
      "Tomatoes (4 large, chopped)",
      "Onions (2 medium, chopped)",
      "Bell peppers (2 medium, chopped)",
      "Garlic (4 cloves, minced)",
      "Ginger (1 inch, minced)",
      "Vegetable oil (1/3 cup)",
      "Scotch bonnet pepper (1 piece, chopped)",
      "Seasoning cubes (2 pieces, crushed)",
      "Salt (1 teaspoon)",
      "Water (4 cups)"
    ],
    instructions: [
      "Soak black-eyed beans overnight, then boil until tender (about 30 minutes)",
      "Season beef with salt and crushed seasoning cubes",
      "Heat vegetable oil in a large pot until hot",
      "Add chopped onions, garlic, and ginger, fry for 2 minutes",
      "Add seasoned beef and fry until brown on all sides",
      "Add chopped tomatoes, bell peppers, and scotch bonnet pepper",
      "Fry until tomatoes are soft and mixture is thick (about 15 minutes)",
      "Add boiled beans and water, simmer for 20-25 minutes until beef is tender",
      "Adjust seasoning and serve hot with rice or yam"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 25,
    name: "Traditional Nigerian Wedding Jollof Rice",
    description: "The ultimate celebration rice - rich, flavorful, and perfect for special occasions",
    meal_type: "dinner",
    dietary_preference: "traditional",
    cooking_time: "elaborate",
    prep_time: "90 mins",
    difficulty: "hard",
    ingredients: [
      "Basmati rice (4 cups, washed and drained)",
      "Chicken (1kg, cut into pieces)",
      "Tomatoes (8 large, roughly chopped)",
      "Red bell peppers (4 medium, roughly chopped)",
      "Onions (3 large, roughly chopped)",
      "Scotch bonnet pepper (3 pieces, to taste)",
      "Chicken stock (6 cups)",
      "Bay leaves (3 pieces)",
      "Thyme (2 teaspoons)",
      "Curry powder (3 tablespoons)",
      "Palm oil (3/4 cup)",
      "Seasoning cubes (3 pieces, crushed)",
      "Salt (1.5 teaspoons)",
      "Garlic (6 cloves, minced)",
      "Ginger (2 inches, minced)",
      "Tomato paste (2 tablespoons)",
      "Coconut milk (1 cup, optional)"
    ],
    instructions: [
      "Season chicken with salt, crushed seasoning cubes, and pepper soup spice",
      "Blend tomatoes, peppers, onions, and scotch bonnet until very smooth",
      "Heat palm oil in a large pot until hot (test with a drop of water)",
      "Add minced garlic and ginger, fry for 2 minutes until fragrant",
      "Add seasoned chicken and fry until golden brown on all sides",
      "Pour in blended mixture and fry until thick and oily (about 25-30 minutes)",
      "Add tomato paste and fry for additional 5 minutes",
      "Add crushed seasoning cubes, salt, thyme, curry powder, and bay leaves",
      "Stir well and add chicken stock and coconut milk",
      "Bring to boil and add washed rice",
      "Reduce heat to low, cover and cook for 25-30 minutes",
      "Check rice is tender, then let it steam for 15 minutes",
      "Fluff with fork and serve hot with grilled chicken and plantains"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 26,
    name: "Beef Pepper Soup with Pounded Yam",
    description: "Spicy beef soup with smooth pounded yam - a traditional Nigerian delicacy",
    meal_type: "dinner",
    dietary_preference: "traditional",
    cooking_time: "elaborate",
    prep_time: "75 mins",
    difficulty: "medium",
    ingredients: [
      "Beef (1kg, cut into pieces)",
      "White yam (1 large tuber, peeled and cut)",
      "Scotch bonnet pepper (4 pieces)",
      "Onions (2 medium, sliced)",
      "Garlic (6 cloves, minced)",
      "Ginger (2 inches, minced)",
      "Utazi leaves (4 pieces)",
      "Uziza leaves (4 pieces)",
      "Scent leaves (1 bunch)",
      "Pepper soup spice (2 tablespoons)",
      "Seasoning cubes (3 pieces, crushed)",
      "Salt (1.5 teaspoons)",
      "Water (8 cups)",
      "Palm oil (2 tablespoons, optional)"
    ],
    instructions: [
      "Clean and cut beef into medium pieces",
      "Season beef with salt, crushed seasoning cubes, and pepper soup spice",
      "Place beef in a large pot with water and bring to boil",
      "Reduce heat and simmer until beef is very tender (about 45-50 minutes)",
      "Add sliced onions, minced garlic, and ginger",
      "Add whole scotch bonnet peppers and simmer for 10 minutes",
      "Add utazi, uziza, and scent leaves in the last 5 minutes",
      "For pounded yam: Boil yam pieces until very soft (about 30 minutes)",
      "Drain yam and pound in a mortar until smooth and stretchy",
      "Add hot water gradually while pounding to achieve smooth consistency",
      "Shape into balls and serve hot with the beef pepper soup"
    ],
    cuisine_type: "Nigerian"
  },
  {
    id: 27,
    name: "Seafood Okro Soup with Eba",
    description: "Rich seafood soup with smooth eba - a coastal Nigerian favorite",
    meal_type: "dinner",
    dietary_preference: "pescatarian",
    cooking_time: "elaborate",
    prep_time: "80 mins",
    difficulty: "medium",
    ingredients: [
      "Fresh fish (500g, cleaned and cut)",
      "Shrimp (300g, cleaned)",
      "Crab (2 medium, cleaned)",
      "Okro (500g, sliced)",
      "Palm oil (1/2 cup)",
      "Onions (2 medium, chopped)",
      "Scotch bonnet pepper (2 pieces)",
      "Crayfish (3 tablespoons, ground)",
      "Seasoning cubes (2 pieces, crushed)",
      "Salt (1 teaspoon)",
      "Water (6 cups)",
      "Garri (for eba, 2 cups)",
      "Hot water (for eba, 1.5 cups)"
    ],
    instructions: [
      "Clean and cut fish, shrimp, and crab into pieces",
      "Heat palm oil in a large pot until hot",
      "Add chopped onions and fry for 2 minutes",
      "Add fish, shrimp, and crab, fry for 5 minutes",
      "Add water, salt, and crushed seasoning cubes",
      "Simmer for 20 minutes until seafood is cooked",
      "Add sliced okro and simmer for 10 minutes",
      "Add ground crayfish and scotch bonnet pepper",
      "Simmer for additional 5 minutes",
      "For eba: Boil water in a separate pot",
      "Add garri gradually while stirring with a wooden spoon",
      "Continue stirring until smooth and stretchy",
      "Shape into balls and serve hot with the seafood okro soup"
    ],
    cuisine_type: "Nigerian"
  }
];

// Categorized Nigerian ingredients for better organization
export const ingredientCategories = [
  {
    id: "pasta",
    name: "Pasta",
    emoji: "🍝",
    ingredients: [
      "Spaghetti", "Noodles", "Macaroni", "Penne", "Fusilli", "Lasagna"
    ]
  },
  {
    id: "swallows",
    name: "Swallows & Starches",
    emoji: "🍚",
    ingredients: [
      "Garri", "Semovita", "Amala", "Eba", "Pounded yam", "Tuwo", "Fufu",
      "Rice", "Wheat", "Starch", "Couscous"
    ]
  },
  {
    id: "proteins",
    name: "Proteins & Meats",
    emoji: "🥩",
    ingredients: [
      "Chicken", "Beef", "Goat meat", "Fish", "Pork", "Turkey", "Egg",
      "Shrimp", "Crab", "Snail", "Liver", "Kidney", "Tripe", "Stockfish",
      "Dried fish", "Smoked fish", "Bush meat", "Ponmo", "Crayfish", "Periwinkle"
    ]
  },
  {
    id: "tubers",
    name: "Tubers",
    emoji: "🍠",
    ingredients: [
      "Yam", "Cocoyam", "Sweet potato", "Irish potatoes", "Plantain"
    ]
  },
  {
    id: "vegetables",
    name: "Vegetables & Greens",
    emoji: "🥬",
    ingredients: [
      "Tomatoes", "Onions", "Spinach", "Okra", "Carrots", "Green beans",
      "Bell peppers", "Scotch bonnet", "Habanero", "Cucumber", "Lettuce",
      "Cabbage", "Cauliflower", "Broccoli", "Cassava", "Pumpkin leaves", "Bitter leaf",
      "Water leaf", "Scent leaf", "Curry leaf", "Basil"
    ]
  },
  {
    id: "fruits",
    name: "Fruits & Tropical",
    emoji: "🍎",
    ingredients: [
      "Banana", "Orange", "Apple", "Mango", "Pineapple", "Watermelon",
      "Pawpaw", "Guava", "Grape", "Strawberry", "Avocado", "Lemon", "Lime",
      "Tangerine", "Grapefruit", "Pomegranate", "Coconut", "Tiger nut"
    ]
  },
  {
    id: "dairy",
    name: "Dairy & Alternatives",
    emoji: "🥛",
    ingredients: [
      "Milk", "Cheese", "Yogurt", "Butter", "Cream", "Sour cream",
      "Coconut milk", "Almond milk", "Soy milk", "Coconut cream",
      "Evaporated milk", "Condensed milk", "Tiger nut milk", "Kunu"
    ]
  },
  {
    id: "spices",
    name: "Spices & Seasonings",
    emoji: "🌶️",
    ingredients: [
      "Garlic", "Ginger", "Pepper", "Curry powder",
      "Thyme", "Bay leaves", "Nutmeg", "Cinnamon", "Cumin", "Coriander",
      "Seasoning cubes", "Salt", "Black pepper", "White pepper",
      "Cayenne pepper", "Paprika", "Turmeric", "Cloves", "Cardamom"
    ]
  },
  {
    id: "oils",
    name: "Oils & Fats",
    emoji: "🫒",
    ingredients: [
      "Palm oil", "Vegetable oil", "Olive oil", "Coconut oil", "Groundnut oil",
      "Sesame oil", "Margarine", "Ghee"
    ]
  },
  {
    id: "legumes",
    name: "Legumes & Beans",
    emoji: "🫘",
    ingredients: [
      "Beans", "Black-eyed peas", "Lentils", "Chickpeas", "Cowpeas",
      "Soybeans", "Peanuts", "Groundnuts", "Almonds", "Cashews",
      "Bambara nuts", "Melon seeds", "Pumpkin seeds"
    ]
  },
  {
    id: "baked",
    name: "Baked Goods & Snacks",
    emoji: "🍞",
    ingredients: [
      "Bread", "Toast", "Buns", "Cake", "Cookies", "Biscuits",
      "Puff puff", "Rolls", "Croissants", "Agege bread",
      "Plantain chips", "Popcorn"
    ]
  },
  {
    id: "traditional",
    name: "Native",
    emoji: "🇳🇬",
    ingredients: [
      "Ogbono", "Egusi",
      "Uziza", "Utazi", "Nchawu",
      "Palm wine", "Zobo", "Locust beans", "Abacha", "Ugba",
      "Ewedu", "Ofada", "Ayamase", "Akamu",

      "Nchuanwu", "Tuwon Masara", "Starch"
    ]
  }
];

// Flattened list for backward compatibility
export const commonIngredients = ingredientCategories.flatMap(category => category.ingredients);

// Leftover-specific ingredients for leftover transformation suggestions
export const leftoverIngredients = [
  "Leftover Rice", "Leftover Beans", "Leftover Stew", "Leftover Soup", 
  "Leftover Meat", "Leftover Fish", "Leftover Chicken", "Leftover Vegetables",
  "Leftover Bread", "Leftover Pasta", "Leftover Yam", "Leftover Plantain",
  "Leftover Garri", "Leftover Semovita", "Leftover Eba", "Leftover Amala"
];

// Leftover combinations for smart suggestions
export const leftoverCombinations = [
  {
    name: "Rice + Stew",
    ingredients: ["Leftover Rice", "Leftover Stew"],
    suggestions: ["Fried Rice", "Rice and Beans", "Rice Porridge"],
    description: "Transform leftover rice and stew into a new meal"
  },
  {
    name: "Meat + Vegetables",
    ingredients: ["Leftover Meat", "Leftover Vegetables"],
    suggestions: ["Meat and Vegetable Stir-fry", "Meat and Vegetable Soup", "Meat and Vegetable Stew"],
    description: "Combine leftover meat with vegetables for a fresh dish"
  },
  {
    name: "Bread + Leftovers",
    ingredients: ["Leftover Bread", "Leftover Meat", "Leftover Vegetables"],
    suggestions: ["Sandwich", "Bread and Stew", "Bread Pudding"],
    description: "Use leftover bread with other leftovers"
  },
  {
    name: "Pasta + Sauce",
    ingredients: ["Leftover Pasta", "Leftover Stew", "Leftover Vegetables"],
    suggestions: ["Pasta Stir-fry", "Pasta and Stew", "Pasta Salad"],
    description: "Transform leftover pasta with available sauces"
  }
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
  { value: "any", label: "Any", emoji: "🍽️" },
  { value: "vegetarian", label: "Vegetarian", emoji: "🥬" },
  { value: "vegan", label: "Vegan", emoji: "🌱" },
  { value: "halal", label: "Halal", emoji: "☪️" },
  { value: "traditional", label: "Traditional", emoji: "🇳🇬" },
  { value: "pescatarian", label: "Pescatarian", emoji: "🐟" },
  { value: "rice_based", label: "Rice-Based", emoji: "🍚" },
  { value: "high_protein", label: "High-Protein", emoji: "🥩" },
  { value: "low_fat", label: "Low-Fat", emoji: "💪" },
  { value: "soft_foods", label: "Soft Foods", emoji: "🥣" }
];
