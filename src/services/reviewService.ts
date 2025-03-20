import { updateFacilityMetrics } from "../utils/facilityUtils";
import { Facility, Review } from "../types";
import { db } from "../config/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

const addReviewToDatabase = async (review: Review): Promise<void> => {
  await addDoc(collection(db, "reviews"), review);
};

export const getFacilityReviews = async (
  facilityId: string
): Promise<Review[]> => {
  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, where("facilityId", "==", facilityId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as Review)
    );
  } catch (error) {
    console.error("Error fetching facility reviews:", error);
    return [];
  }
};

const getFacility = async (facilityId: string): Promise<Facility> => {
  const docRef = doc(db, "facilities", facilityId);
  const docSnap = await getDoc(docRef);
  return { id: docSnap.id, ...docSnap.data() } as Facility;
};

const updateFacility = async (
  facilityId: string,
  facility: Facility
): Promise<void> => {
  const { id, ...facilityData } = facility;
  await updateDoc(doc(db, "facilities", facilityId), facilityData);
};

export const addReview = async (
  facilityId: string,
  reviewData: Omit<Review, "id" | "rating">
): Promise<void> => {
  try {
    const reviewsRef = collection(db, "reviews");
    const rating = Math.round(
      ((reviewData.physicalRating || 0) +
        (reviewData.sensoryRating || 0) +
        (reviewData.cognitiveRating || 0)) /
        3
    );

    await addDoc(reviewsRef, {
      ...reviewData,
      rating,
      facilityId,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};
