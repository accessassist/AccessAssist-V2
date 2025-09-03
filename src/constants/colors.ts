// Unified color system for AccessAssist
export const Colors = {
  // Category colors - for accessibility features
  categories: {
    physical: {
      main: "#006D77",
      light: "#B2DFDB",
      background: "#E8F4FD",
    },
    sensory: {
      main: "#E69F00",
      light: "#FFE082",
      background: "#FFF8E1",
    },
    cognitive: {
      main: "#8E44AD",
      light: "#D7BDE2",
      background: "#F3E5F5",
    },
  },

  // Background colors
  background: {
    app: "#FAFAFA",
    card: "#FFFFFF",
    list: "#F5F5F5",
    modal: "#FFFFFF",
    divider: "#E0E0E0",
    secondary: "#F0F0F0",
    highlight: "#E3F2FD",
    overlay: "rgba(0, 0, 0, 0.5)",
  },

  // Text colors
  text: {
    primary: "#212121",
    secondary: "#616161",
    link: "#0066CC",
    light: "#FFFFFF",
    disabled: "#BDBDBD",
  },

  // Button colors
  button: {
    primary: {
      background: "#0066CC",
      text: "#FFFFFF",
      border: "#0066CC",
    },
    secondary: {
      background: "#E0E0E0",
      text: "#212121",
      border: "#E0E0E0",
    },
    outline: {
      background: "transparent",
      text: "#0066CC",
      border: "#0066CC",
    },
  },

  // Interactive elements
  interactive: {
    star: {
      filled: "#FFD700",
      empty: "#BDBDBD",
      half: "#FFD700",
    },
    tag: {
      default: "#E8F4FD",
      selected: "#0066CC",
      text: "#0066CC",
      selectedText: "#FFFFFF",
    },
  },

  // Status colors
  status: {
    success: "#009E73",
    warning: "#E69F00",
    error: "#D55E00",
    info: "#0066CC",
  },

  // Border colors
  border: {
    default: "#E0E0E0",
    focus: "#0066CC",
    error: "#D55E00",
  },

  // Shadow colors
  shadow: {
    light: "rgba(0, 0, 0, 0.1)",
    medium: "rgba(0, 0, 0, 0.2)",
    dark: "rgba(0, 0, 0, 0.5)",
  },
} as const;

// Type definitions for better type safety
export type ColorCategory = keyof typeof Colors.categories;
export type ColorCategoryVariant = "main" | "light" | "background";
export type ButtonVariant = keyof typeof Colors.button;
export type StatusType = keyof typeof Colors.status;

// Utility functions for consistent color access
export const ColorUtils = {
  // Get category color with fallback
  getCategoryColor: (
    category: ColorCategory,
    variant: ColorCategoryVariant = "main"
  ): string => {
    return Colors.categories[category]?.[variant] || Colors.text.secondary;
  },

  // Get button color with fallback
  getButtonColor: (
    variant: ButtonVariant,
    part: keyof typeof Colors.button.primary
  ): string => {
    return Colors.button[variant]?.[part] || Colors.button.primary[part];
  },

  // Get status color with fallback
  getStatusColor: (status: StatusType): string => {
    return Colors.status[status] || Colors.text.secondary;
  },

  // Get tag colors based on selection state
  getTagColors: (isSelected: boolean) => ({
    background: isSelected
      ? Colors.interactive.tag.selected
      : Colors.interactive.tag.default,
    text: isSelected
      ? Colors.interactive.tag.selectedText
      : Colors.interactive.tag.text,
    border: isSelected
      ? Colors.interactive.tag.selected
      : Colors.border.default,
  }),

  // Get star colors
  getStarColor: (type: "filled" | "empty" | "half"): string => {
    return Colors.interactive.star[type] || Colors.interactive.star.empty;
  },
};

// Export individual color getters for backward compatibility
export const getCategoryColor = ColorUtils.getCategoryColor;
export const getButtonColor = ColorUtils.getButtonColor;
export const getStatusColor = ColorUtils.getStatusColor;
export const getTagColors = ColorUtils.getTagColors;
export const getStarColor = ColorUtils.getStarColor;
