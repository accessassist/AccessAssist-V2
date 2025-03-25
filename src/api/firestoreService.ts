import { db } from "../config/firebase";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  increment,
  DocumentReference,
  QuerySnapshot,
} from "firebase/firestore";
import { User, Facility, Review, AccessTag } from "../types";

// Add COLLECTIONS constant
export const COLLECTIONS = {
  USERS: "users",
  FACILITIES: "facilities",
  REVIEWS: "reviews",
  ACCESS_TAGS: "access_tags",
};

// User Functions
export const createUser = async (
  userId: string,
  userData: Partial<User>
): Promise<void> => {
  await setDoc(doc(db, COLLECTIONS.USERS, userId), {
    ...userData,
    preferredAccessTags: [],
    createdAt: new Date(),
  });
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
  return userDoc.exists() ? (userDoc.data() as User) : null;
};

// Facility Functions
export const createOrUpdateFacility = async (
  facilityId: string,
  facilityData: Partial<Facility>
): Promise<DocumentReference> => {
  const facilityRef = doc(db, COLLECTIONS.FACILITIES, facilityId);
  const facilityDoc = await getDoc(facilityRef);

  if (!facilityDoc.exists()) {
    await setDoc(facilityRef, {
      ...facilityData,
      physicalRating: 0,
      sensoryRating: 0,
      cognitiveRating: 0,
      reviewCount: 0,
      commonAccessTags: [],
      createdAt: new Date(),
    });
  }
  return facilityRef;
};

export const getFacility = async (
  facilityId: string
): Promise<Facility | null> => {
  const facilityDoc = await getDoc(doc(db, COLLECTIONS.FACILITIES, facilityId));
  return facilityDoc.exists() ? (facilityDoc.data() as Facility) : null;
};

// Review Functions
export const addReview = async (
  facilityId: string,
  reviewData: Partial<Review>
): Promise<DocumentReference> => {
  const facilityRef = doc(db, COLLECTIONS.FACILITIES, facilityId);
  const reviewRef = doc(collection(db, COLLECTIONS.REVIEWS));

  // Add the review
  await setDoc(reviewRef, {
    ...reviewData,
    facilityId,
    createdAt: new Date(),
  });

  // Get all reviews for the facility
  const reviewsQuery = query(
    collection(db, COLLECTIONS.REVIEWS),
    where("facilityId", "==", facilityId)
  );
  const reviewsSnapshot = await getDocs(reviewsQuery);
  const reviews = reviewsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Review[];

  // Calculate new metrics
  const physicalRatings = reviews.map((r) => r.physicalRating || 0);
  const sensoryRatings = reviews.map((r) => r.sensoryRating || 0);
  const cognitiveRatings = reviews.map((r) => r.cognitiveRating || 0);

  const physicalRating =
    physicalRatings.length > 0
      ? physicalRatings.reduce((a, b) => a + b, 0) / physicalRatings.length
      : 0;
  const sensoryRating =
    sensoryRatings.length > 0
      ? sensoryRatings.reduce((a, b) => a + b, 0) / sensoryRatings.length
      : 0;
  const cognitiveRating =
    cognitiveRatings.length > 0
      ? cognitiveRatings.reduce((a, b) => a + b, 0) / cognitiveRatings.length
      : 0;

  // Calculate most common access tags
  const tagCounts: Record<string, number> = {};
  reviews.forEach((review) => {
    review.accessTags?.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  // Sort tags by count and get top 3
  const commonAccessTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([tag]) => tag);

  // Get all unique access tags
  const allAccessTags = Array.from(
    new Set(reviews.flatMap((review) => review.accessTags || []))
  );

  // Update facility document with new metrics
  await updateDoc(facilityRef, {
    physicalRating,
    sensoryRating,
    cognitiveRating,
    reviewCount: reviews.length,
    commonAccessTags,
    accessTags: allAccessTags,
  });

  return reviewRef;
};

// Access Tags Functions
export const getAccessTags = async (): Promise<AccessTag[]> => {
  const tagsSnapshot = await getDocs(collection(db, COLLECTIONS.ACCESS_TAGS));
  return tagsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<AccessTag, "id">),
  }));
};

// Search Functions
export const searchFacilities = async (
  searchQuery: string
): Promise<Facility[]> => {
  const facilitiesRef = collection(db, COLLECTIONS.FACILITIES);
  const q = query(facilitiesRef, where("name", ">=", searchQuery));
  const querySnapshot: QuerySnapshot = await getDocs(q);

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Facility, "id">),
  }));
};
