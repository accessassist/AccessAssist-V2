import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ColorValue,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAuth } from "../contexts/AuthContext";
import StarRating from "../components/StarRating";
import { addReview } from "../api/firestoreService";
import { getAccessTags } from "../api/firestoreService";
import { AccessTag } from "../types";
import { Colors } from "../constants/colors";

type Props = NativeStackScreenProps<RootStackParamList, "AddReview">;

interface CategoryButtonStyle {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
}

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
    "Physical" | "Sensory" | "Cognitive" | null
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
    ? accessTags.filter(
        (tag) => tag.category?.toLowerCase() === selectedCategory.toLowerCase()
      )
    : [];

  const getCategoryColor = (category: "Physical" | "Sensory" | "Cognitive") => {
    switch (category) {
      case "Physical":
        return Colors.categories.physical.main;
      case "Sensory":
        return Colors.categories.sensory.main;
      case "Cognitive":
        return Colors.categories.cognitive.main;
    }
  };

  const getCategoryLightColor = (
    category: "Physical" | "Sensory" | "Cognitive"
  ) => {
    switch (category) {
      case "Physical":
        return Colors.categories.physical.light;
      case "Sensory":
        return Colors.categories.sensory.light;
      case "Cognitive":
        return Colors.categories.cognitive.light;
    }
  };

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
          <Text
            style={[
              styles.ratingLabel,
              { color: Colors.categories.physical.main },
            ]}
          >
            Physical Accessibility
          </Text>
          <StarRating
            rating={physicalRating}
            onRatingChange={setPhysicalRating}
            size={30}
            color={Colors.categories.physical.main}
          />
        </View>

        <View style={styles.ratingSection}>
          <Text
            style={[
              styles.ratingLabel,
              { color: Colors.categories.sensory.main },
            ]}
          >
            Sensory Accessibility
          </Text>
          <StarRating
            rating={sensoryRating}
            onRatingChange={setSensoryRating}
            size={30}
            color={Colors.categories.sensory.main}
          />
        </View>

        <View style={styles.ratingSection}>
          <Text
            style={[
              styles.ratingLabel,
              { color: Colors.categories.cognitive.main },
            ]}
          >
            Cognitive Accessibility
          </Text>
          <StarRating
            rating={cognitiveRating}
            onRatingChange={setCognitiveRating}
            size={30}
            color={Colors.categories.cognitive.main}
          />
        </View>

        <Text style={styles.sectionTitle}>Access Features</Text>

        <View style={styles.categoryButtons}>
          {(["Physical", "Sensory", "Cognitive"] as const).map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && {
                  backgroundColor: getCategoryColor(category),
                  borderColor: getCategoryColor(category),
                  borderWidth: 1,
                },
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  {
                    color:
                      selectedCategory === category
                        ? Colors.text.light
                        : getCategoryColor(category),
                  },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedCategory && (
          <View style={styles.tagsContainer}>
            {filteredTags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.selectedTag,
                  {
                    backgroundColor: selectedTags.includes(tag.name)
                      ? getCategoryColor(selectedCategory)
                      : Colors.background.card,
                    borderColor: getCategoryColor(selectedCategory),
                    borderWidth: 1,
                  },
                ]}
                onPress={() => handleTagPress(tag.name)}
              >
                <Text
                  style={[
                    styles.selectedTagText,
                    {
                      color: selectedTags.includes(tag.name)
                        ? Colors.text.light
                        : getCategoryColor(selectedCategory),
                    },
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
    backgroundColor: Colors.background.app,
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: Colors.text.primary,
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: Colors.text.primary,
  },
  categoryButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.background.divider,
    backgroundColor: Colors.background.card,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  selectedTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  selectedTagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  removeTagButton: {
    padding: 2,
  },
  removeTagText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    minHeight: 100,
    textAlignVertical: "top",
    color: Colors.text.primary,
  },
  submitButton: {
    backgroundColor: Colors.button.primary.background,
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  submitButtonText: {
    color: Colors.text.light,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AddReviewScreen;
