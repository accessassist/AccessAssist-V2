import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { createUser } from "../api/firestoreService";
import { Colors } from "../constants/colors";

type Props = NativeStackScreenProps<RootStackParamList, "CreateAccount">;

const CreateAccountScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

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
        preferredAccessTags: [],
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AccessAssist</Text>
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
        <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.app,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 40,
    color: Colors.text.primary,
  },
  inputContainer: {
    width: "100%",
    maxWidth: 400,
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
});

export default CreateAccountScreen;
