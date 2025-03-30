import React, { useState, useEffect } from "react";
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
import { getAccessTags } from "../api/firestoreService";
import { AccessTag } from "../types";

type Props = NativeStackScreenProps<RootStackParamList, "AddReview">;

const AddReviewScreen: React.FC<Props> = ({ navigation, route }) => {
  const { facilityId, place } = route.params;
  const { user } = useAuth();
  const [physicalRating, setPhysicalRating] = useState(0);
  const [sensoryRating, setSensoryRating] = useState(0);
  const [cognitiveRating, setCognitiveRating] = useState(0);
  const [comment, setComment] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [accessTags, setAccessTags] = useState<AccessTag[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    "physical" | "sensory" | "cognitive" | null
  >(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAccessTags = async () => {
      try {
        const tags = await getAccessTags();
        setAccessTags(tags);
      } catch (error) {
        console.error("Error loading access tags:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAccessTags();
  }, []);

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

    if (physicalRating === 0 || sensoryRating === 0 || cognitiveRating === 0) {
      Alert.alert("Error", "Please rate all accessibility categories");
      return;
    }

    try {
      const reviewData = {
        userId: user.id,
        facilityId,
        facilityName: place.name,
        facilityAddress: place.address,
        facilityLocation: place.location,
        rating: (physicalRating + sensoryRating + cognitiveRating) / 3,
        physicalRating,
        sensoryRating,
        cognitiveRating,
        comment,
        accessTags: selectedTags,
        createdAt: new Date().toISOString(),
      };

      await addReview(facilityId, reviewData);
      Alert.alert("Success", "Review submitted successfully!", [
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

  const filteredTags = selectedCategory
    ? accessTags.filter((tag) => tag.category === selectedCategory)
    : [];

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

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

        <View style={styles.categoryButtons}>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === "physical" && styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory("physical")}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === "physical" &&
                  styles.selectedCategoryButtonText,
              ]}
            >
              Physical
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === "sensory" && styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory("sensory")}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === "sensory" &&
                  styles.selectedCategoryButtonText,
              ]}
            >
              Sensory
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === "cognitive" && styles.selectedCategoryButton,
            ]}
            onPress={() => setSelectedCategory("cognitive")}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === "cognitive" &&
                  styles.selectedCategoryButtonText,
              ]}
            >
              Cognitive
            </Text>
          </TouchableOpacity>
        </View>

        {selectedCategory && (
          <View style={styles.tagsContainer}>
            {filteredTags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.tag,
                  selectedTags.includes(tag.name) && styles.selectedTag,
                ]}
                onPress={() => handleTagPress(tag.name)}
              >
                <Text
                  style={[
                    styles.tagText,
                    selectedTags.includes(tag.name) && styles.selectedTagText,
                  ]}
                >
                  {tag.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Additional Comments</Text>
        <TextInput
          style={styles.commentInput}
          multiline
          numberOfLines={4}
          value={comment}
          onChangeText={setComment}
          placeholder="Share your experience..."
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
    backgroundColor: "#fff",
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  selectedCategoryButton: {
    backgroundColor: "#0066cc",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#333",
  },
  selectedCategoryButtonText: {
    color: "#fff",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
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
    color: "#fff",
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    minHeight: 100,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: "#0066cc",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddReviewScreen;
