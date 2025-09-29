/*
  Add review screen implements all visual animation and some functionality of the adding
  a review screen for the facilities. This includes where and what happens when certain buttons
  are on screen and what happens when the user interacts with them. It also includes all style
  information about the buttons and text on the add review screen. Some of this info is contained
  within the constants folder if you are looking to change global color/text options.
*/

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
  KeyboardAvoidingView,
  Platform,
  Switch,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { useAuth } from "../contexts/AuthContext";
import StarRating from "../components/StarRating";
import { AccessTags } from "../components/AccessTags";
import { addReview } from "../api/firestoreService";
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
  const [selectedCategory, setSelectedCategory] = useState<
    "Physical" | "Sensory" | "Cognitive" | null
  >(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

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
        isAnonymous,
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

  const getCategoryColor = (category: "Physical" | "Sensory" | "Cognitive") => {
    const categoryKey = category.toLowerCase() as
      | "physical"
      | "sensory"
      | "cognitive";
    return Colors.categories[categoryKey].main;
  };

  const getCategoryLightColor = (
    category: "Physical" | "Sensory" | "Cognitive"
  ) => {
    const categoryKey = category.toLowerCase() as
      | "physical"
      | "sensory"
      | "cognitive";
    return Colors.categories[categoryKey].light;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
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
              {(["Physical", "Sensory", "Cognitive"] as const).map(
                (category) => (
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
                )
              )}
            </View>

            {selectedCategory && (
              <AccessTags
                selectedTags={selectedTags}
                onTagSelect={setSelectedTags}
                category={
                  selectedCategory.toLowerCase() as
                    | "physical"
                    | "sensory"
                    | "cognitive"
                }
                maxTags={undefined} // Allow unlimited tag selection for reviews
              />
            )}

            <Text style={styles.sectionTitle}>Comments</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience..."
              placeholderTextColor={Colors.text.secondary}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
            />

            <View style={styles.anonymousToggle}>
              <Text style={styles.anonymousLabel}>Post anonymously</Text>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{
                  false: Colors.background.divider,
                  true: Colors.button.primary.background,
                }}
                thumbColor={
                  isAnonymous ? Colors.text.light : Colors.text.secondary
                }
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.app,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
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

  commentInput: {
    borderWidth: 1,
    borderColor: Colors.border.default,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    minHeight: 100,
    textAlignVertical: "top",
    color: Colors.text.primary,
  },
  anonymousToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 8,
  },
  anonymousLabel: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: "500",
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
