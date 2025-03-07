export interface Facility {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  photo?: string | null;
  physicalRating: number;
  sensoryRating: number;
  cognitiveRating: number;
  reviewCount: number;
  commonAccessTags: string[];
  accessTags: string[];
  createdAt: Date;
}
