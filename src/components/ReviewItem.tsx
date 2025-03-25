import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Review } from "../types";
import StarRating from "./StarRating";

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
          <Text style={styles.ratingLabel}>Physical</Text>
          <StarRating rating={review.physicalRating || 0} size={16} />
        </View>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>Sensory</Text>
          <StarRating rating={review.sensoryRating || 0} size={16} />
        </View>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>Cognitive</Text>
          <StarRating rating={review.cognitiveRating || 0} size={16} />
        </View>
      </View>

      {review.comment && <Text style={styles.comment}>{review.comment}</Text>}

      {review.accessTags && review.accessTags.length > 0 && (
        <View style={styles.tagsContainer}>
          {review.accessTags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
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
  },
  date: {
    color: "#666",
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
    color: "#666",
    width: 80,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  tag: {
    backgroundColor: "#e8f4fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: "#0066cc",
  },
});

export default ReviewItem;
