import React, { useState } from "react";
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

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Profile">,
  NativeStackScreenProps<RootStackParamList>
>;

type AccessTagCategory = NonNullable<AccessTag["category"]>;

const ACCESS_TAG_CONFIG: {
  id: AccessTagCategory;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: "physical", icon: "body-outline" },
  { id: "sensory", icon: "eye-outline" },
  { id: "cognitive", icon: "bulb-outline" },
];

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

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    }
  };

  const handleToggleTag = (tagId: string) => {
    setAccessTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
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

  const renderAccessTags = () => {
    return ACCESS_TAG_CONFIG.map((tag) => (
      <TouchableOpacity
        key={tag.id}
        style={[
          styles.tagButton,
          accessTags.includes(tag.id) && styles.tagButtonSelected,
        ]}
        onPress={() => handleToggleTag(tag.id)}
      >
        <Ionicons
          name={tag.icon as keyof typeof Ionicons.glyphMap}
          size={24}
          color={accessTags.includes(tag.id) ? "#fff" : "#007AFF"}
        />
        <Text
          style={[
            styles.tagButtonText,
            accessTags.includes(tag.id) && styles.tagButtonTextSelected,
          ]}
        >
          {tag.id}
        </Text>
      </TouchableOpacity>
    ));
  };

  const renderCurrentTags = () => {
    if (!user?.preferredAccessTags?.length) return null;

    return (
      <View style={styles.tagsContainer}>
        {user.preferredAccessTags.map((tagId) => {
          const tagConfig = ACCESS_TAG_CONFIG.find((t) => t.id === tagId);
          if (!tagConfig) return null;

          return (
            <View key={tagId} style={styles.tag}>
              <Ionicons
                name={tagConfig.icon as keyof typeof Ionicons.glyphMap}
                size={20}
                color="#007AFF"
                style={styles.tagIcon}
              />
              <Text style={styles.tagText}>{tagConfig.id}</Text>
            </View>
          );
        })}
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
            <Text style={styles.sectionTitle}>Preferred Access Tags</Text>
            <View style={styles.tagsContainer}>{renderAccessTags()}</View>
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
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    gap: 8,
    marginTop: 8,
  },
  tagButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#007AFF",
    marginBottom: 8,
    minWidth: 120,
  },
  tagButtonSelected: {
    backgroundColor: "#007AFF",
  },
  tagButtonText: {
    color: "#007AFF",
    fontSize: 16,
    marginLeft: 8,
  },
  tagButtonTextSelected: {
    color: "#fff",
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    margin: 4,
  },
  tagIcon: {
    marginRight: 6,
  },
  tagText: {
    fontSize: 14,
    color: "#007AFF",
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
});

export default ProfileScreen;
