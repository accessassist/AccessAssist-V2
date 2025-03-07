import { Facility } from "../types";
import Constants from "expo-constants";

interface GooglePlacesResult {
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

const transformGooglePlacesResult = (result: GooglePlacesResult): Facility => {
  return {
    id: Math.random().toString(36).substr(2, 9), // temporary ID generation
    name: result.name,
    address: result.vicinity,
    location: {
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    },
    physicalRating: 0, // These will come from your database
    sensoryRating: 0,
    cognitiveRating: 0,
    reviewCount: 0,
    commonAccessTags: [], // These will come from your database
    accessTags: [], // These will come from your database
    createdAt: new Date(),
  };
};

export const searchPlaces = async (
  query: string,
  userLocation?: { latitude: number; longitude: number }
): Promise<Facility[]> => {
  try {
    const apiKey = Constants.expoConfig?.extra?.GOOGLE_PLACES_API_KEY;
    console.log("API Key available:", !!apiKey); // Log if key exists (without exposing it)

    const url = "https://places.googleapis.com/v1/places:searchText";
    console.log("Request URL:", url);

    const requestBody = {
      textQuery: query,
      ...(userLocation && {
        locationBias: {
          circle: {
            center: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            },
            radius: 5000,
          },
        },
      }),
    };

    console.log("Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey || "",
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.location",
      },
      body: JSON.stringify(requestBody),
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.log("Error response:", JSON.stringify(errorData, null, 2));
      throw new Error(
        `Failed to fetch places: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("Response data:", JSON.stringify(data, null, 2));

    if (!data.places || data.places.length === 0) {
      return [];
    }

    return data.places.map((place: any) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: place.displayName.text,
      address: place.formattedAddress,
      location: {
        latitude: place.location.latitude,
        longitude: place.location.longitude,
      },
      physicalRating: 0,
      sensoryRating: 0,
      cognitiveRating: 0,
      reviewCount: 0,
      commonAccessTags: [],
      accessTags: [],
      createdAt: new Date(),
    }));
  } catch (error) {
    console.error("Google Places search error:", error);
    throw error;
  }
};
