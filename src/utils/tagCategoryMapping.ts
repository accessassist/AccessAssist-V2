import { AccessTag } from "../types";
import { Colors, ColorUtils } from "../constants/colors";

// Helper function to get tag colors from an AccessTag object
export const getTagColorsFromObject = (tag: AccessTag, isSelected: boolean) => {
  const category = tag.category as "physical" | "sensory" | "cognitive";

  if (isSelected) {
    return {
      background: ColorUtils.getCategoryColor(category, "main"),
      text: Colors.text.light,
      border: ColorUtils.getCategoryColor(category, "main"),
    };
  }

  return {
    background: ColorUtils.getCategoryColor(category, "background"),
    text: ColorUtils.getCategoryColor(category, "main"),
    border: ColorUtils.getCategoryColor(category, "main"),
  };
};

// Helper function to get the color for a tag based on its category
export const getTagColor = (tagName: string, category?: string): string => {
  if (category) {
    return ColorUtils.getCategoryColor(
      category as "physical" | "sensory" | "cognitive",
      "main"
    );
  }
  return Colors.text.secondary; // Default color
};

// Helper function to get the background color for a tag based on its category
export const getTagBackgroundColor = (
  tagName: string,
  category?: string
): string => {
  if (category) {
    return ColorUtils.getCategoryColor(
      category as "physical" | "sensory" | "cognitive",
      "background"
    );
  }
  return Colors.background.card; // Default background
};

// Legacy function - kept for backward compatibility
// This function is no longer used since we now get category from database
export const getTagCategory = (
  tagName: string
): "physical" | "sensory" | "cognitive" | undefined => {
  // This could be enhanced to cache results or work with a local mapping
  // For now, it's a utility that can be used when needed
  return undefined;
};
