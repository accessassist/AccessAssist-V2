import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Review } from "../types";
import StarRating from "./StarRating";
import { Colors, ColorUtils } from "../constants/colors";

interface ReviewItemProps {
  review: Review;
  userName: string;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, userName }) => {
  // Helper function to determine tag category based on tag name patterns
  // This is a fallback since reviews only store tag names, not full objects
  const getTagCategoryFromName = (
    tagName: string
  ): "physical" | "sensory" | "cognitive" | null => {
    const lowerTag = tagName.toLowerCase();

    // Physical accessibility patterns
    if (
      lowerTag.includes("wheelchair") ||
      lowerTag.includes("accessible") ||
      lowerTag.includes("ramp") ||
      lowerTag.includes("elevator") ||
      lowerTag.includes("parking") ||
      lowerTag.includes("door") ||
      lowerTag.includes("hallway") ||
      lowerTag.includes("stall") ||
      lowerTag.includes("seating") ||
      lowerTag.includes("washroom")
    ) {
      return "physical";
    }

    // Sensory accessibility patterns
    if (
      lowerTag.includes("braille") ||
      lowerTag.includes("hearing") ||
      lowerTag.includes("visual") ||
      lowerTag.includes("audio") ||
      lowerTag.includes("lighting") ||
      lowerTag.includes("quiet") ||
      lowerTag.includes("scent") ||
      lowerTag.includes("tactile")
    ) {
      return "sensory";
    }

    // Cognitive accessibility patterns
    if (
      lowerTag.includes("clear") ||
      lowerTag.includes("simple") ||
      lowerTag.includes("picture") ||
      lowerTag.includes("memory") ||
      lowerTag.includes("distraction") ||
      lowerTag.includes("stimulation") ||
      lowerTag.includes("guidance") ||
      lowerTag.includes("support")
    ) {
      return "cognitive";
    }

    return null; // Default fallback
  };

  // Get tag colors based on inferred category
  const getTagColors = (tagName: string) => {
    const category = getTagCategoryFromName(tagName);

    if (category) {
      return {
        background: ColorUtils.getCategoryColor(category, "background"),
        border: ColorUtils.getCategoryColor(category, "main"),
        text: ColorUtils.getCategoryColor(category, "main"),
      };
    }

    // Fallback to neutral colors if category can't be determined
    return {
      background: Colors.background.card,
      border: Colors.border.default,
      text: Colors.text.secondary,
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.date}>
          {new Date(review.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.ratingsContainer}>
        <View style={styles.ratingItem}>
          <Text
            style={[
              styles.ratingLabel,
              { color: Colors.categories.physical.main },
            ]}
          >
            Physical
          </Text>
          <StarRating
            rating={review.physicalRating || 0}
            size={16}
            color={Colors.categories.physical.main}
          />
        </View>
        <View style={styles.ratingItem}>
          <Text
            style={[
              styles.ratingLabel,
              { color: Colors.categories.sensory.main },
            ]}
          >
            Sensory
          </Text>
          <StarRating
            rating={review.sensoryRating || 0}
            size={16}
            color={Colors.categories.sensory.main}
          />
        </View>
        <View style={styles.ratingItem}>
          <Text
            style={[
              styles.ratingLabel,
              { color: Colors.categories.cognitive.main },
            ]}
          >
            Cognitive
          </Text>
          <StarRating
            rating={review.cognitiveRating || 0}
            size={16}
            color={Colors.categories.cognitive.main}
          />
        </View>
      </View>

      {review.comment && <Text style={styles.comment}>{review.comment}</Text>}

      {review.accessTags && review.accessTags.length > 0 && (
        <View style={styles.tagsContainer}>
          {review.accessTags.map((tag, index) => {
            const tagColors = getTagColors(tag);

            return (
              <View
                key={index}
                style={[
                  styles.tag,
                  {
                    backgroundColor: tagColors.background,
                    borderColor: tagColors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: tagColors.text }]}>
                  {tag}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text.primary,
  },
  date: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  ratingsContainer: {
    marginBottom: 12,
  },
  ratingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  ratingLabel: {
    fontSize: 14,
    width: 80,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    color: Colors.text.primary,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  tagText: {
    fontSize: 12,
  },
});

export default ReviewItem;
