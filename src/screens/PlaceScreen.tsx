import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Review, User } from "../types";
import StarRating from "../components/StarRating";
import ReviewItem from "../components/ReviewItem";
import { getFacilityReviews } from "../services/reviewService";
import { useAuth } from "../contexts/AuthContext";

type Props = NativeStackScreenProps<RootStackParamList, "Place">;

const PlaceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { place } = route.params;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Record<string, User>>({});
  const { user } = useAuth();

  useEffect(() => {
    navigation.setOptions({
      title: "Details",
    });
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const fetchedReviews = await getFacilityReviews(place.id);
      setReviews(fetchedReviews);
      // TODO: Fetch user details for each review
      setLoading(false);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setLoading(false);
    }
  };

  const handleAddReview = () => {
    navigation.navigate("AddReview", { facilityId: place.id });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.placeName}>{place.name}</Text>
        <Text style={styles.address}>{place.address}</Text>
      </View>

      <View style={styles.ratingsContainer}>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>Physical</Text>
          <StarRating rating={place.physicalRating} size={24} />
          <Text style={styles.ratingValue}>
            {place.physicalRating.toFixed(1)}
          </Text>
        </View>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>Sensory</Text>
          <StarRating rating={place.sensoryRating} size={24} />
          <Text style={styles.ratingValue}>
            {place.sensoryRating.toFixed(1)}
          </Text>
        </View>
        <View style={styles.ratingItem}>
          <Text style={styles.ratingLabel}>Cognitive</Text>
          <StarRating rating={place.cognitiveRating} size={24} />
          <Text style={styles.ratingValue}>
            {place.cognitiveRating.toFixed(1)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.addReviewButton}
        onPress={handleAddReview}
      >
        <Text style={styles.addReviewButtonText}>Add Review</Text>
      </TouchableOpacity>

      <View style={styles.reviewsSection}>
        <Text style={styles.reviewsTitle}>Reviews ({place.reviewCount})</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#0066cc" />
        ) : reviews.length > 0 ? (
          reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              userName={users[review.userId]?.firstName || "Anonymous"}
            />
          ))
        ) : (
          <Text style={styles.noReviews}>No reviews yet</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  placeName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  address: {
    fontSize: 16,
    color: "#666",
  },
  ratingsContainer: {
    backgroundColor: "white",
    padding: 16,
    marginTop: 12,
  },
  ratingItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  ratingLabel: {
    width: 80,
    fontSize: 16,
    color: "#333",
  },
  ratingValue: {
    marginLeft: 12,
    fontSize: 16,
    color: "#666",
  },
  addReviewButton: {
    backgroundColor: "#0066cc",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  addReviewButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  reviewsSection: {
    padding: 16,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  noReviews: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 24,
  },
});

export default PlaceScreen;
