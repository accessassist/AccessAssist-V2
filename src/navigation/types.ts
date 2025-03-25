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
  AddReview: { facilityId: string };
  Profile: undefined;
};
