import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAuth } from "../contexts/AuthContext";
import StarRating from "../components/StarRating";
import { addReview } from "../api/firestoreService";
import { Facility } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "AddReview">;

const SAMPLE_ACCESS_TAGS = [
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

const AddReviewScreen: React.FC<Props> = ({ navigation, route }) => {
  const { facilityId, place } = route.params;
  const { user } = useAuth();
  const [physicalRating, setPhysicalRating] = useState(0);
  const [sensoryRating, setSensoryRating] = useState(0);
  const [cognitiveRating, setCognitiveRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleTagPress = (tag: string) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag)
        ? prevTags.filter((t) => t !== tag)
        : [...prevTags, tag]
    );
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert("Error", "You must be logged in to submit a review");
      return;
    }

    if (physicalRating === 0 && sensoryRating === 0 && cognitiveRating === 0) {
      Alert.alert("Error", "Please provide at least one rating");
      return;
    }

    try {
      console.log("Submitting review with data:", {
        userId: user.id,
        facilityId,
        facilityName: place.name,
        facilityAddress: place.address,
        facilityLocation: place.location,
        physicalRating,
        sensoryRating,
        cognitiveRating,
        comment,
        accessTags: selectedTags,
      });

      await addReview(facilityId, {
        userId: user.id,
        facilityId,
        facilityName: place.name,
        facilityAddress: place.address,
        facilityLocation: place.location,
        physicalRating,
        sensoryRating,
        cognitiveRating,
        comment,
        accessTags: selectedTags,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Review submitted successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error("Error submitting review:", error);
      Alert.alert("Error", "Failed to submit review. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Accessibility Ratings</Text>

        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Physical Accessibility</Text>
          <StarRating
            rating={physicalRating}
            size={32}
            onRatingChange={setPhysicalRating}
          />
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Sensory Accessibility</Text>
          <StarRating
            rating={sensoryRating}
            size={32}
            onRatingChange={setSensoryRating}
          />
        </View>

        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Cognitive Accessibility</Text>
          <StarRating
            rating={cognitiveRating}
            size={32}
            onRatingChange={setCognitiveRating}
          />
        </View>

        <Text style={styles.sectionTitle}>Access Features</Text>
        <View style={styles.tagsContainer}>
          {SAMPLE_ACCESS_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={[
                styles.tag,
                selectedTags.includes(tag) && styles.selectedTag,
              ]}
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

        <Text style={styles.sectionTitle}>Additional Comments</Text>
        <TextInput
          style={styles.commentInput}
          placeholder="Share your experience..."
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit Review</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 12,
  },
  ratingSection: {
    marginBottom: 16,
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: "#333",
  },
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
  commentInput: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 12,
    height: 100,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: "#0066cc",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddReviewScreen;
