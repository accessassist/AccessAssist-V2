/*
  The create account screen for the access assist app. Contains all the syling information
  for the buttons on this screen including when they are interacted with via the user. Also
  contains the code for contacting firebase to use account authentication to confirm the user's
  credentials. Some assets are also contained in the constants folder if you wish to change
  the preset color and text constants.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { createUser } from "../api/firestoreService";
import { Colors } from "../constants/colors";
import { AccessTags } from "../components/AccessTags";

type Props = NativeStackScreenProps<RootStackParamList, "CreateAccount">;

type AccessTagCategory = "physical" | "sensory" | "cognitive";

const MAX_ACCESS_TAGS = 3;

const CreateAccountScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    "Physical" | "Sensory" | "Cognitive" | null
  >(null);
  const [accessTags, setAccessTags] = useState<string[]>([]);

  const handleCreateAccount = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await createUser(userCredential.user.uid, {
        id: userCredential.user.uid,
        email,
        firstName,
        lastName,
        preferredAccessTags: accessTags,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Account created successfully! Please log in.", [
        {
          text: "OK",
          onPress: () => navigation.navigate("Login"),
        },
      ]);
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const getCategoryColor = (category: "Physical" | "Sensory" | "Cognitive") => {
    const categoryKey = category.toLowerCase() as
      | "physical"
      | "sensory"
      | "cognitive";
    return Colors.categories[categoryKey].main;
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
          <View style={styles.contentContainer}>
            <Image
              source={require("../../assets/images/appgraphic.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="First Name"
                placeholderTextColor={Colors.text.secondary}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                placeholderTextColor={Colors.text.secondary}
                value={lastName}
                onChangeText={setLastName}
                autoCapitalize="words"
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.text.secondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.text.secondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Text style={styles.tagCountText}>
                Account Accessibility Tags
              </Text>

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
                <View style={styles.tagsContainer}>
                  <Text style={styles.tagCountText}>
                    Selected: {accessTags.length}/{MAX_ACCESS_TAGS}
                  </Text>
                </View>
              )}

              {selectedCategory && (
                <AccessTags
                  selectedTags={accessTags}
                  onTagSelect={setAccessTags}
                  category={
                    selectedCategory.toLowerCase() as
                      | "physical"
                      | "sensory"
                      | "cognitive"
                  }
                  maxTags={MAX_ACCESS_TAGS} // Limit to 3 tags for account creation
                />
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={handleCreateAccount}
              >
                <Text style={styles.buttonText}>Create Account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
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
  contentContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 300,
    height: 300,
    marginBottom: 20,
  },
  inputContainer: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    padding: 20,
    borderRadius: 12,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    height: 50,
    backgroundColor: Colors.background.card,
    borderColor: Colors.background.divider,
    borderWidth: 1,
    marginBottom: 16,
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    color: Colors.text.primary,
  },
  button: {
    backgroundColor: Colors.button.primary.background,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: Colors.text.light,
    fontSize: 18,
    fontWeight: "600",
  },
  backButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  backButtonText: {
    color: Colors.button.primary.background,
    fontSize: 16,
    fontWeight: "500",
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
  tagCountText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
    width: "100%",
    textAlign: "center",
  },
  tagTitleText: {
    color: "#666",
    fontSize: 22,
    margin: 2,
    textAlign: "center",
    width: "100%",
  },
});

export default CreateAccountScreen;
