/*
  Facility utils acts as a side program used in the services to calculate certain aspects of 
  the facility service. This includes updating the review metrics when a new review gets added
  as well as observing the attached review access tags and obtaining the top three most commonly
  listed ones with the reviews.
 */

import { Facility, Review } from "../types";

interface RatingAccumulator {
  physical: number;
  sensory: number;
  cognitive: number;
  count: number;
}

export const updateFacilityMetrics = (
  facility: Facility,
  reviews: Review[]
): Facility => {
  // Calculate average ratings
  const ratings = reviews.reduce(
    (acc: RatingAccumulator, review) => ({
      physical: acc.physical + review.physicalRating,
      sensory: acc.sensory + review.sensoryRating,
      cognitive: acc.cognitive + review.cognitiveRating,
      count: acc.count + 1,
    }),
    { physical: 0, sensory: 0, cognitive: 0, count: 0 }
  );

  // Collect and count all access tags
  const tagFrequencyMap = new Map<string, number>();
  reviews.forEach((review) => {
    review.accessTags.forEach((tag) => {
      tagFrequencyMap.set(tag, (tagFrequencyMap.get(tag) || 0) + 1);
    });
  });

  // Sort tags by frequency and get top 3
  const sortedTags = Array.from(tagFrequencyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag);

  return {
    ...facility,
    physicalRating: ratings.count > 0 ? ratings.physical / ratings.count : 0,
    sensoryRating: ratings.count > 0 ? ratings.sensory / ratings.count : 0,
    cognitiveRating: ratings.count > 0 ? ratings.cognitive / ratings.count : 0,
    reviewCount: ratings.count,
    commonAccessTags: sortedTags.slice(0, 3),
    accessTags: sortedTags,
  };
};
