# MomFoodie Admin Guide

## 🎯 Overview
The MomFoodie Admin system allows you to manually create, edit, and manage recipes in your database. This guide covers all features and best practices for managing your recipe collection.

## 🚀 Getting Started

### **Accessing the Admin Panel**
1. Navigate to your MomFoodie app
2. Click the **Admin** button in the top-right corner
3. You'll be taken to `/admin` page

### **System Requirements**
- Supabase database (recommended) or local storage
- Modern web browser
- Recipe data in JSON format (for bulk import)

## 📝 Recipe Management Features

### **1. Creating New Recipes**

#### **Step-by-Step Process:**
1. Click **"Add New Recipe"** button
2. Fill in all required fields (marked with *)
3. Add ingredients one by one
4. Add cooking instructions step by step
5. Click **"Save Recipe"**

#### **Required Fields:**
- **Recipe Name**: Clear, descriptive name
- **Description**: Brief description of the dish
- **Meal Type**: Breakfast, Lunch, or Dinner
- **Cooking Time**: Quick, Regular, or Elaborate
- **Prep Time**: Estimated preparation time
- **Ingredients**: At least one ingredient
- **Instructions**: At least one cooking step

#### **Optional Fields:**
- **Difficulty**: Easy, Medium, or Hard
- **Dietary Preference**: Any, Vegetarian, or Vegan
- **Cuisine Type**: Defaults to "Nigerian"

### **2. Editing Existing Recipes**

#### **How to Edit:**
1. Find the recipe in the list
2. Click the **Edit** (pencil) icon
3. Modify any fields as needed
4. Click **"Update Recipe"**

#### **What You Can Edit:**
- All recipe details
- Add/remove ingredients
- Add/remove instructions
- Change metadata

### **3. Deleting Recipes**

#### **Safety Measures:**
- Confirmation dialog before deletion
- Cannot be undone
- Consider backing up before deletion

## 🔍 Search and Filter

### **Search Functionality:**
- Search by recipe name
- Search by description
- Search by ingredients
- Real-time filtering

### **Advanced Filters:**
- Meal type (Breakfast, Lunch, Dinner)
- Cooking time (Quick, Regular, Elaborate)
- Difficulty level (Easy, Medium, Hard)
- Dietary preference (Any, Vegetarian, Vegan)

## 📊 Data Management

### **Export Recipes:**
- Export all recipes to JSON file
- Includes all recipe data
- Timestamped filename
- Can be used for backup

### **Import Recipes:**
- Import from JSON file
- Validates recipe structure
- Shows import results
- Handles errors gracefully

### **Bulk Operations:**
- Bulk import multiple recipes
- Validation before import
- Detailed error reporting
- Success/failure tracking

## 🛠️ Recipe Quality Standards

### **Ingredient Guidelines:**
- Include specific quantities (cups, tablespoons, pieces)
- Add preparation details (chopped, diced, soaked)
- Specify ingredient quality (fresh, ripe, medium-sized)
- Never omit essential ingredients (salt, oil, water)

### **Instruction Guidelines:**
- Write clear, step-by-step instructions
- Include cooking times for each step
- Specify heat levels and techniques
- Add visual cues for doneness
- Include safety tips where needed

### **Metadata Guidelines:**
- Accurate prep and cooking times
- Appropriate difficulty levels
- Correct dietary classifications
- Descriptive recipe names

## 📋 Recipe Validation

### **Automatic Validation:**
- Required field checking
- Data type validation
- Structure validation
- Duplicate detection

### **Quality Scoring:**
- Ingredients completeness (40 points)
- Instructions clarity (40 points)
- Metadata accuracy (20 points)
- Total score out of 100

### **Common Validation Errors:**
- Missing recipe name
- Empty ingredients list
- Empty instructions list
- Invalid meal type
- Invalid cooking time

## 🔧 Advanced Features

### **Recipe Templates:**
- Pre-filled form templates
- Common ingredient lists
- Standard instruction patterns
- Quick recipe creation

### **Duplicate Recipes:**
- Copy existing recipes
- Modify for variations
- Maintain original recipe
- Create recipe families

### **Recipe Statistics:**
- Total recipe count
- Breakdown by category
- Average complexity
- Popular ingredients

## 📱 Mobile Responsiveness

### **Mobile Features:**
- Responsive form design
- Touch-friendly buttons
- Optimized layouts
- Easy navigation

### **Mobile Best Practices:**
- Keep ingredient lists concise
- Use shorter instruction steps
- Optimize for small screens
- Test on mobile devices

## 🔒 Data Security

### **Backup Recommendations:**
- Regular data exports
- Multiple backup locations
- Version control for recipes
- Test restores periodically

### **Data Integrity:**
- Validation before saving
- Error handling
- Transaction safety
- Data consistency checks

## 🚨 Troubleshooting

### **Common Issues:**

#### **Recipe Won't Save:**
- Check all required fields
- Ensure ingredients/instructions aren't empty
- Verify database connection
- Check browser console for errors

#### **Import Fails:**
- Validate JSON format
- Check recipe structure
- Ensure all required fields present
- Review error messages

#### **Search Not Working:**
- Clear search term
- Check for typos
- Verify recipe exists
- Refresh page if needed

### **Error Messages:**
- **"Failed to load recipes"**: Database connection issue
- **"Failed to save recipe"**: Validation or database error
- **"No valid recipes found"**: Import file format issue
- **"Recipe name is required"**: Missing required field

## 📈 Best Practices

### **Recipe Creation:**
1. **Start with a clear name** that describes the dish
2. **Write a compelling description** that makes users want to cook it
3. **Use specific quantities** for all ingredients
4. **Write detailed instructions** with timing and techniques
5. **Test the recipe** before publishing
6. **Get feedback** from users

### **Data Management:**
1. **Regular backups** of your recipe database
2. **Validate recipes** before publishing
3. **Update recipes** based on user feedback
4. **Maintain consistency** in formatting
5. **Monitor quality scores** and improve low-scoring recipes

### **User Experience:**
1. **Keep instructions clear** and easy to follow
2. **Use consistent terminology** throughout
3. **Include helpful tips** and variations
4. **Consider different skill levels**
5. **Add cultural context** where relevant

## 🔄 Maintenance Schedule

### **Daily:**
- Check for new user feedback
- Review recipe quality scores
- Address immediate issues

### **Weekly:**
- Export backup of recipe database
- Review and update low-scoring recipes
- Add new recipes based on trends

### **Monthly:**
- Comprehensive recipe review
- Update seasonal recipes
- Analyze user feedback patterns
- Optimize recipe quality

### **Quarterly:**
- Major database cleanup
- Recipe structure improvements
- Performance optimization
- Feature updates

## 📞 Support

### **Getting Help:**
- Check this guide first
- Review error messages carefully
- Test with simple recipes
- Contact support if needed

### **Feature Requests:**
- Submit through feedback system
- Include use case details
- Provide examples if possible
- Consider impact on existing data

---

*This admin system is designed to make recipe management easy and efficient. Regular use and maintenance will ensure your recipe database remains high-quality and user-friendly.* 