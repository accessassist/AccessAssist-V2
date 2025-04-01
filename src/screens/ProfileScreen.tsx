import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, TabParamList } from "../navigation/types";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Profile">,
  NativeStackScreenProps<RootStackParamList>
>;

const DEFAULT_PROFILE_PIC =
  "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { user, logout, updateUserProfile } = useAuth();
  const [profilePic, setProfilePic] = useState(user?.photoURL || DEFAULT_PROFILE_PIC);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');

  const handleLogout = async () => {
    try {
      await logout();
      navigation.navigate('Login');
    } catch (error) {
      console.error("Error logging out:", error);
      Alert.alert(
        "Logout Error",
        "There was an error logging out. Please try again."
      );
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile({
        firstName,
        lastName,
        photoURL: profilePic
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const handleChangePhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert("Permission Required", "Please allow access to your photo library");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        try {
          await updateUserProfile({ photoURL: result.assets[0].uri });
          setProfilePic(result.assets[0].uri);
        } catch (error) {
          console.error('Error updating profile photo:', error);
          Alert.alert("Update Failed", "Failed to update profile photo. Please try again.");
        }
      }
    } catch (error) {
      console.error('Error in photo picker:', error);
      Alert.alert("Error", "There was an error accessing the photo library. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
        >
          <Text style={styles.editButtonText}>
            {isEditing ? 'Save' : 'Edit'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileContainer}>
        <TouchableOpacity onPress={handleChangePhoto}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: profilePic }} style={styles.profileImage} />
            <View style={styles.editIconContainer}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
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
          </View>
        ) : (
          <>
            <Text style={styles.userName}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </>
        )}
      </View>

      <View style={styles.content}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#fff" style={styles.logoutIcon} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  profileContainer: {
    alignItems: 'center',
    padding: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editIconContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#007AFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editForm: {
    width: '100%',
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
  },
  logoutButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
