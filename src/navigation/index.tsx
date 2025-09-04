/*
  The index for navigation acts as a central hub for all of the pages within the app the
  user can navigate to. This includes the authentication-only screens like view facility 
  and add review or non-authentication like the login or create account screens. Sets default
  params for these pages when they are accessed through nav.
*/

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../contexts/AuthContext";
import { RootStackParamList } from "./types";
import BottomTabNavigator from "./BottomTabNavigator";

import LoginScreen from "../screens/LoginScreen";
import CreateAccountScreen from "../screens/CreateAccountScreen";
import PlaceScreen from "../screens/PlaceScreen";
import AddReviewScreen from "../screens/AddReviewScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const Navigation: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Auth screens, requires authentication to access these main screens.
          <>
            <Stack.Screen
              name="MainApp"
              component={BottomTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Place"
              component={PlaceScreen}
              options={{
                headerShown: true,
                title: "Details",
              }}
            />
            <Stack.Screen
              name="AddReview"
              component={AddReviewScreen}
              options={{
                headerShown: true,
                title: "Add Review",
              }}
            />
          </>
        ) : (
          // Non-auth screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CreateAccount"
              component={CreateAccountScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
