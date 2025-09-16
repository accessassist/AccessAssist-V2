/*
 Below are all the defined object types that are stored in the database for the access assist app.
 These objects include user profiles, user authentication, facility information, user review
 information, and access tags. These are blanket objects used throughout the access assist app.
 All their included variables as well as their types are listed in the code below. Some
 variables are not always necessary so they are marked with "?".
 */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredAccessTags: string[];
  photoURL?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
}

export interface Facility {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  photo?: string | null;
  photos?: string[];
  placeId?: string;
  physicalRating: number;
  sensoryRating: number;
  cognitiveRating: number;
  rating?: number;
  userRatingsTotal?: number;
  reviewCount: number;
  commonAccessTags: string[];
  accessTags: string[];
  accessibilityTags?: string[];
  reviews?: Review[];
  createdAt: string;
}

export interface Review {
  id: string;
  userId: string;
  facilityId: string;
  facilityName: string;
  facilityAddress: string;
  facilityLocation: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  comment: string;
  physicalRating?: number;
  sensoryRating?: number;
  cognitiveRating?: number;
  accessTags?: string[];
  accessibilityTags?: string[];
  isAnonymous?: boolean;
  createdAt: string;
}

export interface AccessTag {
  id: string;
  name: string;
  description: string;
  icon: string;
  category?: "physical" | "sensory" | "cognitive";
}
