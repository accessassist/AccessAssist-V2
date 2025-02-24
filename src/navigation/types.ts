import { Facility } from "../types";

export type RootStackParamList = {
  Login: undefined;
  CreateAccount: undefined;
  Home: undefined;
  Place: { place: Facility };
};
