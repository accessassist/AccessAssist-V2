export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredAccessTags: string[];
  photoURL?: string;
  createdAt: Date;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
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
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  facilityId: string;
  rating: number;
  comment: string;
  physicalRating?: number;
  sensoryRating?: number;
  cognitiveRating?: number;
  accessTags?: string[];
  accessibilityTags?: string[];
  createdAt: Date;
}

export interface AccessTag {
  id: string;
  name: string;
  description: string;
  icon: string;
  category?: "physical" | "sensory" | "cognitive";
}
