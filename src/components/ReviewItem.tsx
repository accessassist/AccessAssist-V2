/*
  The review item is displayed on the reviews screen of the app and contains
  the styling and components needed to display a user's review information including their
  profile, overall ratings for each category as well as any comments they wrote. 
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Review } from "../types";
import StarRating from "./StarRating";
import { Colors } from "../constants/colors";
import { getTagColor } from "../utils/tagCategoryMapping";

interface ReviewItemProps {
  review: Review;
  userName: string;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, userName }) => {
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
            const categoryColor = getTagColor(tag);

            return (
              <View
                key={index}
                style={[
                  styles.tag,
                  {
                    backgroundColor: Colors.background.card,
                    borderColor: categoryColor,
                    borderWidth: 1,
                  },
                ]}
              >
                <Text style={[styles.tagText, { color: categoryColor }]}>
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
