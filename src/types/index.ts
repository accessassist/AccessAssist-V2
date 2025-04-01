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
  createdAt: string;
}

export interface AccessTag {
  id: string;
  name: string;
  description: string;
  icon: string;
  category?: "physical" | "sensory" | "cognitive";
}
