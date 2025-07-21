# Vercel Deployment Fix - RLS Policies

## ✅ **ESLint Errors Fixed**

All ESLint errors have been resolved:
- ✅ Fixed `<a>` tags → `<Link>` components
- ✅ Escaped quotes in JSX
- ✅ Build passes successfully

## 🔧 **Database RLS Policies Required**

To enable recipe updates in the admin panel, you need to add missing RLS policies to your Supabase database.

### **Step 1: Go to Supabase Dashboard**
1. Visit [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **SQL Editor**

### **Step 2: Add Missing Policies**
Run this SQL:

```sql
-- Add UPDATE policy for meals table
CREATE POLICY "Anyone can update meals" ON meals
    FOR UPDATE USING (true);

-- Add DELETE policy for meals table  
CREATE POLICY "Anyone can delete meals" ON meals
    FOR DELETE USING (true);
```

### **Step 3: Verify Policies**
Check that you have these policies:
- ✅ "Anyone can read meals" (SELECT)
- ✅ "Anyone can insert meals" (INSERT) 
- ✅ "Anyone can update meals" (UPDATE) ← **NEW**
- ✅ "Anyone can delete meals" (DELETE) ← **NEW**

## 🚀 **Vercel Deployment**

The latest commit (`a88cf73`) should now deploy successfully on Vercel because:
- ✅ No ESLint errors
- ✅ Build passes locally
- ✅ All code follows Next.js best practices

## 🧪 **Test After Deployment**

1. **Check Vercel Dashboard** - Should show successful deployment
2. **Test Admin Panel** - Recipe updates should work
3. **Test Main App** - Should show updated data from Supabase

## 📋 **What Was Fixed**

### **ESLint Issues:**
- `pages/admin.js`: Replaced `<a>` with `<Link>`
- `pages/test-supabase-admin.js`: Fixed quotes and `<a>` tags

### **Database Issues:**
- Missing RLS policies for UPDATE/DELETE operations
- Recipe updates appeared to succeed but didn't persist

### **Deployment Issues:**
- ESLint errors prevented Vercel build
- Now resolved with proper Next.js patterns 