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

  await setDoc(reviewRef, {
    ...reviewData,
    facilityId,
    createdAt: new Date(),
  });

  await updateDoc(facilityRef, {
    physicalRating: increment(reviewData.physicalRating || 0),
    sensoryRating: increment(reviewData.sensoryRating || 0),
    cognitiveRating: increment(reviewData.cognitiveRating || 0),
    reviewCount: increment(1),
    commonAccessTags: arrayUnion(...(reviewData.accessTags || [])),
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
