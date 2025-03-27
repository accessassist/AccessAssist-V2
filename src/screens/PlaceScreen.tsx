import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Review, User, Facility } from "../types";
import StarRating from "../components/StarRating";
import ReviewItem from "../components/ReviewItem";
import { getFacilityReviews } from "../services/reviewService";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useFocusEffect } from "@react-navigation/native";

type Props = NativeStackScreenProps<RootStackParamList, "Place">;

const PlaceScreen: React.FC<Props> = ({ navigation, route }) => {
  const { place: initialPlace } = route.params;
  const [place, setPlace] = useState<Facility>(initialPlace);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Record<string, User>>({});
  const { user } = useAuth();

  const loadPlaceData = async () => {
    try {
      // Fetch updated place data
      const facilityRef = doc(db, "facilities", place.id);
      const facilityDoc = await getDoc(facilityRef);
      if (facilityDoc.exists()) {
        setPlace({ id: facilityDoc.id, ...facilityDoc.data() } as Facility);
      }

      // Fetch reviews
      const fetchedReviews = await getFacilityReviews(place.id);
      setReviews(fetchedReviews);
      setLoading(false);
    } catch (error) {
      console.error("Error loading place data:", error);
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPlaceData();
    }, [place.id])
  );

  const handleAddReview = () => {
    navigation.navigate("AddReview", { facilityId: place.id, place });
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
