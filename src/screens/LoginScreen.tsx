import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Colors } from "../constants/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
      // The navigation will happen automatically when the user state is updated
    } catch (error) {
      Alert.alert("Login Error", (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AccessAssist</Text>
      <View style={styles.inputContainer}>
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
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={() => navigation.navigate("CreateAccount")}
        >
          <Text style={styles.createAccountButtonText}>Create Account</Text>
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
  createAccountButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  createAccountButtonText: {
    color: Colors.button.primary.background,
    fontSize: 16,
    fontWeight: "500",
  },
});

export default LoginScreen;
