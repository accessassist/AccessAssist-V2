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

const getFacilityReviews = async (facilityId: string): Promise<Review[]> => {
  const q = query(
    collection(db, "reviews"),
    where("facilityId", "==", facilityId)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Review));
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
  review: Review
): Promise<void> => {
  try {
    // Add the review to the database
    await addReviewToDatabase(review);

    // Get all reviews for this facility
    const facilityReviews = await getFacilityReviews(facilityId);

    // Get the facility
    const facility = await getFacility(facilityId);

    // Update facility metrics
    const updatedFacility = updateFacilityMetrics(facility, facilityReviews);

    // Save updated facility
    await updateFacility(facilityId, updatedFacility);
  } catch (error) {
    console.error("Error adding review:", error);
    throw error;
  }
};
