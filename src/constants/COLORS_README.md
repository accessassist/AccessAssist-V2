# Unified Color System

This document explains how to use the unified color system in AccessAssist.

## Overview

The color system provides consistent, type-safe access to all colors used throughout the application. It includes utility functions for common color operations and eliminates hardcoded color values.

## Basic Usage

### Direct Color Access

```typescript
import { Colors } from "../constants/colors";

// Access category colors
const physicalColor = Colors.categories.physical.main; // "#006D77"
const sensoryLight = Colors.categories.sensory.light; // "#FFE082"

// Access background colors
const cardBg = Colors.background.card; // "#FFFFFF"
const secondaryBg = Colors.background.secondary; // "#F0F0F0"

// Access button colors
const primaryBtnBg = Colors.button.primary.background; // "#0066CC"
const primaryBtnText = Colors.button.primary.text; // "#FFFFFF"
```

### Using Utility Functions

```typescript
import { ColorUtils } from "../constants/colors";

// Get category colors with fallback
const color = ColorUtils.getCategoryColor("physical", "main");
const lightColor = ColorUtils.getCategoryColor("sensory", "light");

// Get button colors
const btnBg = ColorUtils.getButtonColor("primary", "background");

// Get tag colors based on selection state
const tagColors = ColorUtils.getTagColors(true); // selected
// Returns: { background: "#0066CC", text: "#FFFFFF", border: "#0066CC" }

// Get star colors
const starColor = ColorUtils.getStarColor("filled"); // "#FFD700"
```

### Using Helper Functions (Backward Compatibility)

```typescript
import { getCategoryColor, getTagColor } from "../constants/colors";

// These functions are exported for backward compatibility
const color = getCategoryColor("physical", "main");
const tagColor = getTagColor("Wheelchair Accessible");
```

## Color Categories

### Accessibility Categories

- **Physical**: Blue tones (#006D77, #B2DFDB, #E8F4FD)
- **Sensory**: Orange tones (#E69F00, #FFE082, #FFF8E1)
- **Cognitive**: Purple tones (#8E44AD, #D7BDE2, #F3E5F5)

### Background Colors

- `app`: Main app background (#FAFAFA)
- `card`: Card/component backgrounds (#FFFFFF)
- `list`: List backgrounds (#F5F5F5)
- `secondary`: Secondary backgrounds (#F0F0F0)
- `highlight`: Highlighted backgrounds (#E3F2FD)

### Button Colors

- `primary`: Primary action buttons (#0066CC)
- `secondary`: Secondary action buttons (#E0E0E0)
- `outline`: Outline buttons (transparent with border)

### Status Colors

- `success`: Success states (#009E73)
- `warning`: Warning states (#E69F00)
- `error`: Error states (#D55E00)
- `info`: Information states (#0066CC)

## Best Practices

1. **Always use the Colors constant** instead of hardcoded hex values
2. **Use utility functions** for dynamic color selection
3. **Prefer semantic color names** over visual descriptions
4. **Use the appropriate color variant** (main, light, background) for the context
5. **Test color combinations** for accessibility and contrast

## Migration Guide

### Before (Old Way)

```typescript
// Hardcoded colors
backgroundColor: "#0066CC";
color: "#FFFFFF";

// Inconsistent access
backgroundColor: Colors.button.primary; // ❌ Wrong
```

### After (New Way)

```typescript
// Unified color system
backgroundColor: Colors.button.primary.background;
color: Colors.button.primary.text;

// Utility functions
const tagColors = ColorUtils.getTagColors(isSelected);
backgroundColor: tagColors.background;
```

## Type Safety

The color system includes TypeScript types for better development experience:

```typescript
import { ColorCategory, ButtonVariant, StatusType } from "../constants/colors";

type ColorCategory = "physical" | "sensory" | "cognitive";
type ButtonVariant = "primary" | "secondary" | "outline";
type StatusType = "success" | "warning" | "error" | "info";
```
