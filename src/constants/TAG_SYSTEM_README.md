# Dynamic Tag System

This document explains the new dynamic tag system that replaces hardcoded access tags with database-driven tags.

## What Changed

### **Before (Hardcoded System)**

- Tags were hardcoded in `AccessTags.tsx` component
- `tagCategoryMapping.ts` contained a large hardcoded mapping
- Adding/removing tags required code changes
- Risk of inconsistency between code and database

### **After (Dynamic System)**

- Tags are fetched dynamically from the `access_tags` database table
- No more hardcoded tag lists
- Tags can be managed entirely through the database
- Consistent data source across the application

## Database Structure

The `access_tags` table contains:

```typescript
{
  id: string; // Unique identifier
  name: string; // Display name (e.g., "Wide hallway")
  category: string; // "physical" | "sensory" | "cognitive"
  description: string; // Detailed description
  icon: string; // Icon identifier
}
```

## Component Updates

### **AccessTags Component**

- Now fetches tags from database using `getAccessTags()`
- Supports filtering by category
- Shows loading states and empty states
- Uses unified color system

```typescript
<AccessTags
  selectedTags={selectedTags}
  onTagSelect={setSelectedTags}
  category="physical" // Optional: filter by category
/>
```

### **AddReviewScreen**

- Removed hardcoded tag rendering logic
- Now uses the dynamic `AccessTags` component
- Cleaner, more maintainable code
- Removed unused state variables and effects

### **ReviewItem Component**

- Updated to use unified color system
- Tags now use consistent styling
- Prepared for future enhancement (storing full tag objects in reviews)

## Benefits

✅ **Single Source of Truth** - All tags come from database  
✅ **Easy Management** - Add/remove tags without code changes  
✅ **Consistent Styling** - Unified color system across all components  
✅ **Better UX** - Loading states and error handling  
✅ **Scalable** - Can handle unlimited number of tags  
✅ **Maintainable** - No more hardcoded arrays to maintain

## Future Enhancements

### **Review System**

Currently, reviews store tag names as strings. Future improvements could:

1. **Store Tag IDs** instead of names for better data integrity
2. **Store Full Tag Objects** including category information
3. **Enhanced Tag Display** with icons and descriptions

### **Tag Management**

1. **Admin Interface** for managing tags
2. **Tag Categories** management
3. **Tag Analytics** and usage statistics

## Migration Notes

### **For Developers**

- All tag-related components now use the database
- Use `getAccessTags()` to fetch tags
- Use `ColorUtils.getTagColors()` for consistent styling
- No more hardcoded tag arrays

### **For Database Admins**

- Tags can be added/removed through the database
- Ensure category values are exactly: "physical", "sensory", or "cognitive"
- Icon field can be used for future icon system

## Example Usage

```typescript
import { AccessTags } from "../components/AccessTags";
import { getAccessTags } from "../api/firestoreService";

// Fetch tags for a specific category
const physicalTags = await getAccessTags();
const filteredTags = physicalTags.filter((tag) => tag.category === "physical");

// Use in component
<AccessTags
  selectedTags={selectedTags}
  onTagSelect={handleTagSelect}
  category="physical"
/>;
```

## Troubleshooting

### **Tags Not Loading**

- Check database connection
- Verify `getAccessTags()` function in `firestoreService.ts`
- Check console for error messages

### **Category Filtering Not Working**

- Ensure database category values match exactly: "physical", "sensory", "cognitive"
- Check case sensitivity

### **Styling Issues**

- Verify `ColorUtils.getTagColors()` is working
- Check that colors are properly imported
