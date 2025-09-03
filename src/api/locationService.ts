/*
  Simple service for gathering current location, requires the permission
  to access location in order to create the request. 
 */

import * as Location from "expo-location";
import { LocationObject } from "expo-location";

export interface LocationData {
  latitude: number;
  longitude: number;
}

export const getCurrentLocation = async (): Promise<LocationData> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      throw new Error("Permission to access location was denied");
    }

    const location: LocationObject = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    throw error;
  }
};
