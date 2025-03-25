import { Facility } from "../types";
import Constants from "expo-constants";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

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
    createdAt: new Date().toISOString(),
  };
};

export const searchPlaces = async (
  query: string,
  location: { latitude: number; longitude: number },
  radius: number = 5000
): Promise<Facility[]> => {
  try {
    const apiKey = Constants.expoConfig?.extra?.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw new Error("Google Places API key not found");
    }

    const response = await fetch(
      `https://places.googleapis.com/v1/places:searchText`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask":
            "places.displayName,places.formattedAddress,places.location,places.photos,places.id",
        },
        body: JSON.stringify({
          textQuery: query,
          locationBias: {
            circle: {
              center: {
                latitude: location.latitude,
                longitude: location.longitude,
              },
              radius: radius,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch places");
    }

    const data = await response.json();

    // Transform and fetch additional data from database
    const transformedPlaces = await Promise.all(
      data.places.map(async (place: any) => {
        // Check if place exists in database
        const facilityRef = doc(db, "facilities", place.id);
        const facilityDoc = await getDoc(facilityRef);

        if (facilityDoc.exists()) {
          // If place exists, return the database data
          return {
            id: facilityDoc.id,
            ...facilityDoc.data(),
            photo: place.photos?.[0]?.name
              ? `https://places.googleapis.com/v1/${place.photos[0].name}/media?key=${apiKey}&maxHeightPx=400&maxWidthPx=400`
              : null,
          } as Facility;
        } else {
          // If place doesn't exist, create a new facility with default values
          const newFacility: Facility = {
            id: place.id,
            placeId: place.id, // Store the Google Places ID
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
            commonAccessTags: [],
            accessTags: [],
            createdAt: new Date().toISOString(),
          };

          // Save the new facility to the database
          await setDoc(facilityRef, newFacility);

          return newFacility;
        }
      })
    );

    return transformedPlaces;
  } catch (error) {
    console.error("Google Places search error:", error);
    throw error;
  }
};
