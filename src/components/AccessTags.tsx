/*
  Contains all the component information for when access tags are used in the
  filtration or profile pages to select them. Contains a set list of tags as 
  well as the stylization for them as well as the interaction code.
 */

import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ACCESS_TAGS = [
  "Wheelchair Accessible",
  "Braille Signage",
  "Quiet Space",
  "Elevator",
  "Accessible Parking",
  "Visual Alerts",
  "Hearing Loop",
  "Service Animals Welcome",
  "Step-free Access",
  "Wide Doorways",
];

interface AccessTagsProps {
  selectedTags: string[];
  onTagSelect: (tags: string[]) => void;
}

export const AccessTags: React.FC<AccessTagsProps> = ({
  selectedTags,
  onTagSelect,
}) => {
  const handleTagPress = (tag: string) => {
    onTagSelect(
      selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag]
    );
  };

  return (
    <View style={styles.tagsContainer}>
      {ACCESS_TAGS.map((tag) => (
        <TouchableOpacity
          key={tag}
          style={[styles.tag, selectedTags.includes(tag) && styles.selectedTag]}
          onPress={() => handleTagPress(tag)}
        >
          <Text
            style={[
              styles.tagText,
              selectedTags.includes(tag) && styles.selectedTagText,
            ]}
          >
            {tag}
          </Text>
        </TouchableOpacity>
      ))}
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
    backgroundColor: "#e8f4fd",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTag: {
    backgroundColor: "#0066cc",
  },
  tagText: {
    fontSize: 14,
    color: "#0066cc",
  },
  selectedTagText: {
    color: "white",
  },
});
