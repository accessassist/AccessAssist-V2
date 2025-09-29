/*
  Contains all of the information for the profile screen in the access assist app. 
  This contains profile editing methods such as changing profile info and design as 
  well as managing and sending requests to the database for changes reguarding the
  user's profile info. It also contains the styling and positioning for many different
  interactable features and buttons located within the profile screen. Most of the info
  is here however some is within the constant folder and must be edited there instead.
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, TabParamList } from "../navigation/types";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { AccessTag } from "../types";
import { getAccessTags } from "../api/firestoreService";
import { Colors } from "../constants/colors";
import { AccessTags } from "../components/AccessTags";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Profile">,
  NativeStackScreenProps<RootStackParamList>
>;

type AccessTagCategory = "physical" | "sensory" | "cognitive";

const ACCESS_TAG_CONFIG: {
  id: AccessTagCategory;
  icon: keyof typeof Ionicons.glyphMap;
  displayName: string;
}[] = [
  { id: "physical", icon: "body-outline", displayName: "Physical" },
  { id: "sensory", icon: "eye-outline", displayName: "Sensory" },
  { id: "cognitive", icon: "bulb-outline", displayName: "Cognitive" },
];

const MAX_ACCESS_TAGS = 3;
const DEFAULT_PROFILE_PIC =
  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, updateUserProfile } = useAuth();
  const [profilePic, setProfilePic] = useState(
    user?.photoURL || DEFAULT_PROFILE_PIC
  );
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [accessTags, setAccessTags] = useState<string[]>(
    user?.preferredAccessTags || []
  );
  const [availableAccessTags, setAvailableAccessTags] = useState<AccessTag[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] =
    useState<AccessTagCategory | null>(null);
  const [loading, setLoading] = useState(true);

  // Keep track of original values for comparison
  const [originalFirstName, setOriginalFirstName] = useState(
    user?.firstName || ""
  );
  const [originalLastName, setOriginalLastName] = useState(
    user?.lastName || ""
  );
  const [originalProfilePic] = useState(user?.photoURL || DEFAULT_PROFILE_PIC);
  const [originalAccessTags] = useState<string[]>(
    user?.preferredAccessTags || []
  );

  useEffect(() => {
    const loadAccessTags = async () => {
      try {
        const tags = await getAccessTags();
        setAvailableAccessTags(tags);
      } catch (error) {
        console.error("Error loading access tags:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAccessTags();
  }, []);

  const handleStartEditing = () => {
    setOriginalFirstName(firstName);
    setOriginalLastName(lastName);
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Restore original values
    setFirstName(originalFirstName);
    setLastName(originalLastName);
    setProfilePic(originalProfilePic);
    setAccessTags(originalAccessTags);
    setSelectedCategory(null);
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    try {
      const updates: Partial<{
        firstName: string;
        lastName: string;
        photoURL: string;
        preferredAccessTags: string[];
      }> = {};

      // Only include changed fields
      if (firstName !== originalFirstName) updates.firstName = firstName;
      if (lastName !== originalLastName) updates.lastName = lastName;
      if (profilePic !== originalProfilePic) updates.photoURL = profilePic;
      if (JSON.stringify(accessTags) !== JSON.stringify(originalAccessTags)) {
        updates.preferredAccessTags = accessTags;
      }

      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        await updateUserProfile(updates);
        Alert.alert("Success", "Profile updated successfully");
      }

      setSelectedCategory(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert(
        "Logout Error",
        "There was an error logging out. Please try again."
      );
    }
  };

  const handleChangePhoto = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePic(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error in photo picker:", error);
      Alert.alert(
        "Error",
        "There was an error accessing the photo library. Please try again."
      );
    }
  };

  const getCategoryColor = (category: AccessTagCategory) => {
    switch (category) {
      case "physical":
        return Colors.categories.physical.main;
      case "sensory":
        return Colors.categories.sensory.main;
      case "cognitive":
        return Colors.categories.cognitive.main;
    }
  };

  const filteredTags = selectedCategory
    ? availableAccessTags.filter(
        (tag) => tag.category?.toLowerCase() === selectedCategory
      )
    : [];

  const renderAccessTagsSelector = () => {
    if (loading) {
      return <Text style={styles.loadingText}>Loading access tags...</Text>;
    }

    return (
      <View>
        <Text style={styles.sectionTitle}>Preferred Access Features</Text>
        <Text style={styles.helperText}>
          Choose up to {MAX_ACCESS_TAGS} access tags that best describe your
          needs
        </Text>

        <View style={styles.categoryButtons}>
          {ACCESS_TAG_CONFIG.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && {
                  backgroundColor: getCategoryColor(category.id),
                  borderColor: getCategoryColor(category.id),
                  borderWidth: 1,
                },
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  {
                    color:
                      selectedCategory === category.id
                        ? "#fff"
                        : getCategoryColor(category.id),
                  },
                ]}
              >
                {category.displayName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedCategory && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagCountText}>
              Selected: {accessTags.length}/{MAX_ACCESS_TAGS}
            </Text>
            <AccessTags
              selectedTags={accessTags}
              onTagSelect={setAccessTags}
              category={selectedCategory}
              maxTags={MAX_ACCESS_TAGS}
            />
          </View>
        )}
      </View>
    );
  };

  const renderCurrentTags = () => {
    if (!user?.preferredAccessTags?.length) return null;

    return (
      <View style={styles.currentTagsContainer}>
        <Text style={styles.currentTagsTitle}>Your Access Preferences</Text>
        <View style={styles.currentTagsWrapper}>
          {user.preferredAccessTags.map((tagId) => {
            // Find the tag in available tags using the ID
            const tagData = availableAccessTags.find((t) => t.id === tagId);
            const category = tagData?.category as AccessTagCategory;
            const tagConfig = ACCESS_TAG_CONFIG.find((t) => t.id === category);

            return (
              <View key={tagId} style={styles.currentTag}>
                {tagConfig && (
                  <Ionicons
                    name={tagConfig.icon as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color={getCategoryColor(category)}
                    style={styles.currentTagIcon}
                  />
                )}
                <Text
                  style={[
                    styles.currentTagText,
                    {
                      color: category ? getCategoryColor(category) : "#007AFF",
                    },
                  ]}
                >
                  {tagData?.name || tagId}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        {isEditing ? (
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCancel}
            >
              <Text style={[styles.headerButtonText, styles.cancelButton]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.headerButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleStartEditing}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={isEditing ? handleChangePhoto : undefined}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: profilePic }} style={styles.profileImage} />
            {isEditing && (
              <View style={styles.editIconContainer}>
                <Ionicons name="camera" size={20} color="#fff" />
              </View>
            )}
          </View>
        </TouchableOpacity>

        {isEditing ? (
          <View style={styles.editForm}>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              placeholderTextColor="#999"
            />
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              placeholderTextColor="#999"
            />
            {renderAccessTagsSelector()}
          </View>
        ) : (
          <>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            {renderCurrentTags()}
          </>
        )}
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons
            name="log-out-outline"
            size={24}
            color="#fff"
            style={styles.logoutIcon}
          />
          <Text style={styles.logoutButtonText}>Logout</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  headerButtons: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  headerButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
  cancelButton: {
    color: "#FF3B30",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: "#007AFF",
    fontSize: 16,
  },
  profileContainer: {
    alignItems: "center",
    padding: 20,
  },
  profileImageContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIconContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    backgroundColor: "#007AFF",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  editForm: {
    width: "100%",
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: "#000",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: "#666",
    marginBottom: 16,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginTop: 16,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginVertical: 20,
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
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  tagButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  tagButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  currentTagsContainer: {
    width: "100%",
    marginTop: 8,
  },
  currentTagsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
    textAlign: "center",
  },
  currentTagsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  currentTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 2,
  },
  currentTagIcon: {
    marginRight: 6,
  },
  currentTagText: {
    fontSize: 14,
    fontWeight: "500",
  },
  logoutButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  helperText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    fontStyle: "italic",
  },
  tagCountText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
    width: "100%",
    textAlign: "center",
  },
});

export default ProfileScreen;
