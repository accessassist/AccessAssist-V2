/*
  Contains the objects necessary for the navigation system to work. This includes the 
  objects for each of the screens as well as the user info for the facility reviews.
  These are embellished upon in the index.tsx script.
 */
import { Facility } from "../types";

export type TabParamList = {
  Home: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  MainApp: undefined;
  Place: { place: Facility };
  AddReview: { facilityId: string; place: Facility };
  Profile: undefined;
};
