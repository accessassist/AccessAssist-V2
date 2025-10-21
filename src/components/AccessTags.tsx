import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Colors, ColorUtils } from "../constants/colors";
import { AccessTag } from "../types";
import { getAccessTags } from "../api/firestoreService";

interface AccessTagsProps {
  selectedTags: string[];
  onTagSelect: (tags: string[]) => void;
  category?: "physical" | "sensory" | "cognitive" | null;
  loading?: boolean;
  maxTags?: number; // Optional prop to limit tag selection, undefined means unlimited
}

export const AccessTags: React.FC<AccessTagsProps> = ({
  selectedTags,
  onTagSelect,
  category = null,
  loading = false,
  maxTags,
}) => {
  const [tags, setTags] = useState<AccessTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTags = async () => {
      try {
        const accessTags = await getAccessTags();
        setTags(accessTags);
      } catch (error) {
        console.error("Error loading access tags:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTags();
  }, []);

  const handleTagPress = (tag: string) => {
    if (selectedTags.includes(tag)) {
      // If tag is already selected, remove it
      onTagSelect(selectedTags.filter((t) => t !== tag));
    } else if (maxTags === undefined || selectedTags.length < maxTags) {
      // If tag is not selected and we haven't reached the limit (or no limit), add it
      onTagSelect([...selectedTags, tag]);
    }
    // If we already have reached the limit and this one isn't selected, do nothing
  };

  // Get tag colors based on category and selection state
  const getTagStyle = (tag: AccessTag, isSelected: boolean) => {
    const tagCategory = tag.category as "physical" | "sensory" | "cognitive";

    if (isSelected) {
      // Selected state: use category main color for background, white text
      return {
        backgroundColor: ColorUtils.getCategoryColor(tagCategory, "main"),
        borderColor: ColorUtils.getCategoryColor(tagCategory, "main"),
        borderWidth: 1,
        textColor: Colors.text.light,
      };
    } else {
      // Unselected state: use category background color, category main color for text
      return {
        backgroundColor: ColorUtils.getCategoryColor(tagCategory, "background"),
        borderColor: ColorUtils.getCategoryColor(tagCategory, "main"),
        borderWidth: 1,
        textColor: ColorUtils.getCategoryColor(tagCategory, "main"),
      };
    }
  };

  // Filter tags by category if specified
  const filteredTags = category
    ? tags.filter((tag) => tag.category === category)
    : tags;

  if (isLoading || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="small"
          color={Colors.button.primary.background}
        />
        <Text style={styles.loadingText}>Loading access tags...</Text>
      </View>
    );
  }

  if (filteredTags.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No access tags available</Text>
      </View>
    );
  }

  return (
    <View style={styles.tagsContainer}>
      {filteredTags.map((tag) => {
        const isSelected = selectedTags.includes(tag.name);
        const isDisabled =
          !isSelected &&
          maxTags !== undefined &&
          selectedTags.length >= maxTags;
        const tagStyle = getTagStyle(tag, isSelected);

        return (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.tag,
              {
                backgroundColor: tagStyle.backgroundColor,
                borderColor: tagStyle.borderColor,
                borderWidth: tagStyle.borderWidth,
                opacity: isDisabled ? 0.5 : 1,
              },
            ]}
            onPress={() => handleTagPress(tag.name)}
            disabled={isDisabled}
          >
            <Text style={[styles.tagText, { color: tagStyle.textColor }]}>
              {tag.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    marginLeft: 8,
    color: Colors.text.secondary,
    fontSize: 14,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: Colors.text.secondary,
    fontSize: 14,
    fontStyle: "italic",
  },
});
