import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "./types";
import BottomTabNavigator from "./BottomTabNavigator";

import LoginScreen from "../screens/LoginScreen";
import CreateAccountScreen from "../screens/CreateAccountScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Auth screens
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MainApp" component={BottomTabNavigator} />
          </Stack.Group>
        ) : (
          // Non-auth screens
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen
              name="CreateAccount"
              component={CreateAccountScreen}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
