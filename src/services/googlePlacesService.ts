import { Facility } from "../types";

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
    let searchParams = new URLSearchParams({
      key: process.env.GOOGLE_PLACES_API_KEY || "",
      query: query,
    });

    if (userLocation) {
      searchParams.append(
        "location",
        `${userLocation.latitude},${userLocation.longitude}`
      );
      searchParams.append("radius", "5000"); // 5km radius
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?${searchParams.toString()}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch places");
    }

    const data = await response.json();

    if (data.status !== "OK") {
      throw new Error(`Places API error: ${data.status}`);
    }

    return data.results.map(transformGooglePlacesResult);
  } catch (error) {
    console.error("Google Places search error:", error);
    throw error;
  }
};
