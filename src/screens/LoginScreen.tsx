/*
  Includes all the style and system authentication for the login screen to 
  enter Access Assist. This includes the calls to firebase for user authentication,
  the placeholder text in the input fields, the padding and formatting for both the
  buttons and the text as well as the app logo. Some defaults for text and color are
  located in the constants folder instead of the style sheet.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Colors } from "../constants/colors";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const { resetPassword } = useAuth();
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const handleLogin = async () => {
    // Validate input fields
    if (!email.trim()) {
      Alert.alert("Missing Information", "Please enter your email address.");
      return;
    }

    if (!password.trim()) {
      Alert.alert("Missing Information", "Please enter your password.");
      return;
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      await login(email.trim(), password);
      // The navigation will happen automatically when the user state is updated
    } catch (error) {
      const errorMessage = (error as Error).message;
      let userFriendlyMessage = "Login failed. Please try again.";

      // Provide more specific error messages based on Firebase error codes
      if (errorMessage.includes("user-not-found")) {
        userFriendlyMessage =
          "No account found with this email address. Please check your email or create a new account.";
      } else if (errorMessage.includes("wrong-password")) {
        userFriendlyMessage = "Incorrect password. Please try again.";
      } else if (errorMessage.includes("invalid-email")) {
        userFriendlyMessage =
          "Invalid email address. Please check your email and try again.";
      } else if (errorMessage.includes("user-disabled")) {
        userFriendlyMessage =
          "This account has been disabled. Please contact support.";
      } else if (errorMessage.includes("too-many-requests")) {
        userFriendlyMessage =
          "Too many failed login attempts. Please try again later.";
      } else if (errorMessage.includes("network-request-failed")) {
        userFriendlyMessage =
          "Network error. Please check your internet connection and try again.";
      }

      Alert.alert("Login Failed", userFriendlyMessage);
    }
  };

  const handleForgotPassword = async () => {
    // If user hasn't typed an email in the main input, open modal to prompt
    if (!email.trim()) {
      setForgotEmail("");
      setForgotModalVisible(true);
      return;
    }

    await sendResetForEmail(email.trim());
  };

  const sendResetForEmail = async (targetEmail: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      await resetPassword(targetEmail);
      setForgotModalVisible(false);
      Alert.alert(
        'Reset Email Sent',
        'If an account exists with that email, a password reset link has been sent. Please check your inbox.'
      );
    } catch (error) {
      const message = (error as Error).message || 'Failed to send reset email.';
      Alert.alert('Error', message);
    }
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
                placeholder="Email"
                placeholderTextColor={Colors.text.secondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  placeholderTextColor={Colors.text.secondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color={Colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.createAccountButton}
                onPress={() => navigation.navigate("CreateAccount")}
              >
                <Text style={styles.createAccountButtonText}>
                  Create Account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.forgotPasswordButton}
                onPress={handleForgotPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>

              <Modal
                visible={forgotModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setForgotModalVisible(false)}
              >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                      <Text style={styles.modalTitle}>Reset Password</Text>
                      <Text style={styles.modalText}>
                        Enter the email address associated with your account.
                      </Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor={Colors.text.secondary}
                        value={forgotEmail}
                        onChangeText={setForgotEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TouchableOpacity
                          style={[styles.button, { flex: 1, marginRight: 8 }]}
                          onPress={() => sendResetForEmail(forgotEmail.trim())}
                        >
                          <Text style={styles.buttonText}>Send</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.createAccountButton, { flex: 1, marginLeft: 8 }]}
                          onPress={() => setForgotModalVisible(false)}
                        >
                          <Text style={styles.createAccountButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Modal>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: Colors.background.card,
    borderColor: Colors.background.divider,
    borderWidth: 1,
    marginBottom: 16,
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    padding: 15,
    fontSize: 16,
    color: Colors.text.primary,
  },
  eyeButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
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
  forgotPasswordButton: {
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  forgotPasswordText: {
    color: Colors.text.secondary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalText: {
    color: Colors.text.primary,
    marginBottom: 12,
  },
});

export default LoginScreen;
