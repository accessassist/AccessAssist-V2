export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredAccessTags: string[];
  createdAt: Date;
}

export interface Facility {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  physicalRating: number;
  sensoryRating: number;
  cognitiveRating: number;
  reviewCount: number;
  commonAccessTags: string[];
  accessTags: string[];
  createdAt: Date;
}

export interface Review {
  id: string;
  userId: string;
  facilityId: string;
  text: string;
  photoUrl?: string;
  accessTags: string[];
  physicalRating: number;
  sensoryRating: number;
  cognitiveRating: number;
  createdAt: Date;
}

export interface AccessTag {
  id: string;
  name: string;
  category: "physical" | "sensory" | "cognitive";
  description?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}
