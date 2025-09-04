/*
  Facility service contains all database and editing methods related to interacting
  with the facility information. This includes getting the facility list from the 
  database, calculating average of the ratings for display, searching specific
  facilities, getting the most popular tags, and creating/editing facilities. 
 */

import { Facility, Review } from "../types";
import { db } from "../config/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  setDoc,
  runTransaction,
} from "firebase/firestore";

export const getFacility = async (
  facilityId: string
): Promise<Facility | null> => {
  try {
    const facilityRef = doc(db, "facilities", facilityId);
    const facilityDoc = await getDoc(facilityRef);
    return facilityDoc.exists()
      ? ({ id: facilityDoc.id, ...facilityDoc.data() } as Facility)
      : null;
  } catch (error) {
    console.error("Error fetching facility:", error);
    return null;
  }
};

export const getFacilityByPlaceId = async (
  placeId: string
): Promise<Facility | null> => {
  try {
    const facilitiesRef = collection(db, "facilities");
    const q = query(facilitiesRef, where("placeId", "==", placeId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Facility;
    }
    return null;
  } catch (error) {
    console.error("Error fetching facility by placeId:", error);
    return null;
  }
};

export const updateFacilityMetrics = async (
  facilityId: string,
  reviews: Review[]
): Promise<void> => {
  try {
    const facilityRef = doc(db, "facilities", facilityId);

    // Calculate average ratings
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

    // Update facility document
    await updateDoc(facilityRef, {
      physicalRating,
      sensoryRating,
      cognitiveRating,
      reviewCount: reviews.length,
      commonAccessTags,
      accessTags: allAccessTags,
    });
  } catch (error) {
    console.error("Error updating facility metrics:", error);
    throw error;
  }
};

export const createFacility = async (
  facilityId: string,
  facilityData: Omit<Facility, "id">
): Promise<void> => {
  try {
    const facilityRef = doc(db, "facilities", facilityId);
    await setDoc(facilityRef, {
      ...facilityData,
      physicalRating: 0,
      sensoryRating: 0,
      cognitiveRating: 0,
      reviewCount: 0,
      commonAccessTags: [],
      accessTags: [],
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error creating facility:", error);
    throw error;
  }
};
