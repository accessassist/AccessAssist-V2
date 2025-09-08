/*
  The place screen is the screen that displays when the user is attempting to 
  view a facility to learn more about it. This includes the average rating for each of the
  access tags, the ability to add your own review, as well as any information linked
  to the facility object in the database such as accessibility items. Contains the styling
  and main function calls to the database, some style info contained in constants folder
  instead of button style sheet listed below.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Review, User, Facility } from "../types";
import StarRating from "../components/StarRating";
import ReviewItem from "../components/ReviewItem";
import {
  getFacilityReviews,
  getFacility,
  getUser,
} from "../api/firestoreService";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "../constants/colors";

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
      setLoading(true);
      const updatedPlace = await getFacility(place.id);
      if (updatedPlace) {
        setPlace(updatedPlace);
      }
      const fetchedReviews = await getFacilityReviews(place.id);
      setReviews(fetchedReviews);

      // Fetch user data for each review author
      const userIds = [
        ...new Set(fetchedReviews.map((review) => review.userId)),
      ];
      const userPromises = userIds.map((userId) => getUser(userId));
      const userResults = await Promise.all(userPromises);

      const usersMap: Record<string, User> = {};
      userResults.forEach((user, index) => {
        if (user) {
          usersMap[userIds[index]] = user;
        }
      });
      setUsers(usersMap);
    } catch (error) {
      console.error("Error loading place data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when screen comes into focus
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
          <Text
            style={[
              styles.ratingLabel,
              { color: Colors.categories.physical.main },
            ]}
          >
            Physical
          </Text>
          <StarRating
            rating={place.physicalRating}
            size={24}
            color={Colors.categories.physical.main}
          />
          <Text
            style={[
              styles.ratingValue,
              { color: Colors.categories.physical.main },
            ]}
          >
            {place.physicalRating.toFixed(1)}
          </Text>
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
            rating={place.sensoryRating}
            size={24}
            color={Colors.categories.sensory.main}
          />
          <Text
            style={[
              styles.ratingValue,
              { color: Colors.categories.sensory.main },
            ]}
          >
            {place.sensoryRating.toFixed(1)}
          </Text>
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
            rating={place.cognitiveRating}
            size={24}
            color={Colors.categories.cognitive.main}
          />
          <Text
            style={[
              styles.ratingValue,
              { color: Colors.categories.cognitive.main },
            ]}
          >
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
          reviews.map((review) => {
            const user = users[review.userId];
            const userName = user
              ? `${user.firstName} ${user.lastName.charAt(0).toUpperCase()}.`
              : "Anonymous";
            return (
              <ReviewItem key={review.id} review={review} userName={userName} />
            );
          })
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
    fontWeight: "600",
  },
  ratingValue: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
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
