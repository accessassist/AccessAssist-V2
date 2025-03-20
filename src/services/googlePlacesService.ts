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

    const url = "https://places.googleapis.com/v1/places:searchText";

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

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey || "",
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.location,places.photos",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Places API error:", errorData);
      throw new Error(
        `Failed to fetch places: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

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
      photo: place.photos?.[0]?.name
        ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?key=${apiKey}&maxHeightPx=400&maxWidthPx=400`
        : null,
      physicalRating: 0,
      sensoryRating: 0,
      cognitiveRating: 0,
      reviewCount: 0,
      commonAccessTags: [
        "Wheelchair Accessible",
        "Braille Signage",
        "Quiet Space",
      ], // Sample tags for testing
      accessTags: [
        "Wheelchair Accessible",
        "Braille Signage",
        "Quiet Space",
        "Elevator",
        "Accessible Parking",
      ],
      createdAt: new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Google Places search error:", error);
    throw error;
  }
};
