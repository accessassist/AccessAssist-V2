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
  orderBy,
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
    createdAt: new Date().toISOString(),
  });
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
  return userDoc.exists() ? (userDoc.data() as User) : null;
};

export const updateUser = async (
  userId: string,
  userData: Partial<User>
): Promise<void> => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, {
    ...userData,
    updatedAt: new Date().toISOString(),
  });
};

export const updateUserPreferences = async (
  userId: string,
  preferredAccessTags: string[]
): Promise<void> => {
  const userRef = doc(db, COLLECTIONS.USERS, userId);
  await updateDoc(userRef, {
    preferredAccessTags,
    updatedAt: new Date().toISOString(),
  });
};

export const getUserReviews = async (userId: string): Promise<Review[]> => {
  const reviewsQuery = query(
    collection(db, COLLECTIONS.REVIEWS),
    where("userId", "==", userId)
  );
  const reviewsSnapshot = await getDocs(reviewsQuery);
  return reviewsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Review[];
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

  // Check if facility exists
  const facilityDoc = await getDoc(facilityRef);

  if (!facilityDoc.exists()) {
    // If facility doesn't exist, create it with the Google Places ID
    await setDoc(facilityRef, {
      id: facilityId,
      placeId: facilityId, // This is the Google Places ID
      name: reviewData.facilityName || "",
      address: reviewData.facilityAddress || "",
      location: reviewData.facilityLocation || { latitude: 0, longitude: 0 },
      physicalRating: 0,
      sensoryRating: 0,
      cognitiveRating: 0,
      reviewCount: 0,
      commonAccessTags: [],
      accessTags: [],
      createdAt: new Date().toISOString(),
    });
  }

  // Add the review
  const reviewToAdd = {
    ...reviewData,
    facilityId,
    createdAt: new Date().toISOString(),
  };
  await setDoc(reviewRef, reviewToAdd);

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
  const physicalRatings = reviews.map((r) => Number(r.physicalRating) || 0);
  const sensoryRatings = reviews.map((r) => Number(r.sensoryRating) || 0);
  const cognitiveRatings = reviews.map((r) => Number(r.cognitiveRating) || 0);

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
    if (review.accessTags && Array.isArray(review.accessTags)) {
      review.accessTags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
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
  const updateData = {
    physicalRating: Number(physicalRating.toFixed(1)),
    sensoryRating: Number(sensoryRating.toFixed(1)),
    cognitiveRating: Number(cognitiveRating.toFixed(1)),
    reviewCount: reviews.length,
    commonAccessTags,
    accessTags: allAccessTags,
  };
  await updateDoc(facilityRef, updateData);

  return reviewRef;
};

// Access Tags Functions
export const getAccessTags = async (): Promise<AccessTag[]> => {
  try {
    const tagsSnapshot = await getDocs(collection(db, COLLECTIONS.ACCESS_TAGS));
    const tags = tagsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<AccessTag, "id">),
    }));
    return tags;
  } catch (error) {
    console.error("Error in getAccessTags:", error);
    throw error;
  }
};

export const addAccessTag = async (
  tagData: Omit<AccessTag, "id">
): Promise<void> => {
  const tagRef = doc(collection(db, COLLECTIONS.ACCESS_TAGS));
  await setDoc(tagRef, {
    ...tagData,
    id: tagRef.id,
  });
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

export const recalculateFacilityMetrics = async (
  facilityId: string
): Promise<void> => {
  const facilityRef = doc(db, COLLECTIONS.FACILITIES, facilityId);
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
  const physicalRatings = reviews.map((r) => Number(r.physicalRating) || 0);
  const sensoryRatings = reviews.map((r) => Number(r.sensoryRating) || 0);
  const cognitiveRatings = reviews.map((r) => Number(r.cognitiveRating) || 0);

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
    if (review.accessTags && Array.isArray(review.accessTags)) {
      review.accessTags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
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
  const updateData = {
    physicalRating: Number(physicalRating.toFixed(1)),
    sensoryRating: Number(sensoryRating.toFixed(1)),
    cognitiveRating: Number(cognitiveRating.toFixed(1)),
    reviewCount: reviews.length,
    commonAccessTags,
    accessTags: allAccessTags,
  };

  await updateDoc(facilityRef, updateData);
};

export const getFacilityReviews = async (
  facilityId: string
): Promise<Review[]> => {
  const reviewsQuery = query(
    collection(db, COLLECTIONS.REVIEWS),
    where("facilityId", "==", facilityId),
    orderBy("createdAt", "desc")
  );

  const reviewsSnapshot = await getDocs(reviewsQuery);
  return reviewsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Review[];
};
