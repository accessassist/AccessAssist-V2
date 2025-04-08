import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
  Platform,
} from "react-native";
import { Facility, AccessTag } from "../types";

type FilterOption = "none" | "myAccessTags" | "selectAccessTag";

interface PlacesListProps {
  places: Facility[];
  onPlaceSelect: (place: Facility) => void;
  filterOption: FilterOption;
  userAccessTags: string[];
}

interface RatingTileProps {
  category: string;
  rating: number;
}

const RatingTile: React.FC<RatingTileProps> = ({ category, rating }) => (
  <View style={styles.ratingTile}>
    <Text style={styles.ratingCategory}>{category}</Text>
    <Text style={styles.ratingValue}>{rating.toFixed(1)}</Text>
  </View>
);

interface AccessTagsProps {
  tags: string[];
  userAccessTags: string[];
  filterOption: FilterOption;
  accessTagMap: Record<string, string>;
  showAdditionalTags?: boolean;
}

const AccessTags: React.FC<AccessTagsProps> = ({
  tags,
  userAccessTags,
  filterOption,
  accessTagMap,
  showAdditionalTags = false,
}) => {
  // Check if any of the tags match the user's access tags
  const hasMatchingTags =
    filterOption === "myAccessTags" &&
    userAccessTags.length > 0 &&
    tags.some((tagName) => {
      // Check if the tag name exists in our mapping
      const tagId = accessTagMap[tagName];
      return !!tagId && userAccessTags.includes(tagId);
    });

  // If showAdditionalTags is true, we'll show all matching tags
  // Otherwise, we'll only show the first 3 common tags
  const tagsToShow = showAdditionalTags ? tags : tags.slice(0, 3);

  return (
    <View style={styles.accessTagsContainer}>
      {tagsToShow.map((tag, index) => {
        const isMatchingTag =
          filterOption === "myAccessTags" &&
          userAccessTags.length > 0 &&
          !!accessTagMap[tag] &&
          userAccessTags.includes(accessTagMap[tag]);
        return (
          <View
            key={index}
            style={[
              styles.accessTag,
              isMatchingTag && styles.matchingAccessTag,
            ]}
          >
            <Text
              style={[
                styles.accessTagText,
                isMatchingTag && styles.matchingAccessTagText,
              ]}
            >
              {tag}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const PlacesList: React.FC<PlacesListProps> = ({
  places,
  onPlaceSelect,
  filterOption,
  userAccessTags,
}) => {
  // Instead of fetching from Firestore, we'll use a hardcoded mapping
  // This is a temporary solution until proper permissions are set up
  const accessTagMap: Record<string, string> = {
    "Curb Ramp": "mKZfbDAhQroYDgl3s8sG",
    // Add more mappings as needed
  };

  const openDirections = async (place: Facility) => {
    const scheme = Platform.select({
      ios: "maps://0,0?q=",
      android: "geo:0,0?q=",
    });
    const latLng = `${place.location.latitude},${place.location.longitude}`;
    const label = place.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    if (url) {
      await Linking.openURL(url);
    }
  };

  // Debug: Log the user's access tags
  console.log("User access tags:", userAccessTags);
  console.log("Filter option:", filterOption);
  console.log("Access tag mapping:", accessTagMap);

  // We don't filter the places anymore, we just highlight matching ones
  // This ensures the order remains the same as the original search results
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {places.map((place) => {
          // Debug: Log the place's access tags
          console.log(`Place ${place.name} access tags:`, place.accessTags);

          // Check if this place has matching access tags
          const hasMatchingTags =
            filterOption === "myAccessTags" &&
            userAccessTags.length > 0 &&
            place.accessTags.some((tagName) => {
              // Check if the tag name exists in our mapping
              const tagId = accessTagMap[tagName];
              const isMatch = !!tagId && userAccessTags.includes(tagId);
              console.log(`Checking tag ${tagName}: ${isMatch} (ID: ${tagId})`);
              return isMatch;
            });

          console.log(
            `Place ${place.name} has matching tags: ${hasMatchingTags}`
          );

          // Find additional matching tags that aren't in the common tags
          const commonTags = place.commonAccessTags.slice(0, 3);
          const additionalMatchingTags =
            filterOption === "myAccessTags" && userAccessTags.length > 0
              ? place.accessTags.filter((tag) => {
                  // Check if the tag is not in the common tags
                  const isNotCommon = !commonTags.includes(tag);
                  // Check if the tag matches one of the user's preferred tags
                  const tagId = accessTagMap[tag];
                  const isMatching = !!tagId && userAccessTags.includes(tagId);
                  return isNotCommon && isMatching;
                })
              : [];

          return (
            <TouchableOpacity
              key={place.id}
              style={[styles.card, hasMatchingTags && styles.matchingCard]}
              onPress={() => onPlaceSelect(place)}
            >
              <View style={styles.imageContainer}>
                {place.photo ? (
                  <Image
                    source={{ uri: place.photo }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.imagePlaceholder} />
                )}
              </View>
              <View style={styles.contentContainer}>
                <Text style={styles.name}>{place.name}</Text>
                <Text style={styles.address}>{place.address}</Text>
                <View style={styles.ratingsContainer}>
                  <RatingTile
                    category="Physical"
                    rating={place.physicalRating}
                  />
                  <RatingTile category="Sensory" rating={place.sensoryRating} />
                  <RatingTile
                    category="Cognitive"
                    rating={place.cognitiveRating}
                  />
                </View>

                {/* Common Access Tags */}
                <AccessTags
                  tags={place.commonAccessTags}
                  userAccessTags={userAccessTags}
                  filterOption={filterOption}
                  accessTagMap={accessTagMap}
                />

                {/* Additional Matching Tags */}
                {additionalMatchingTags.length > 0 && (
                  <View style={styles.additionalTagsContainer}>
                    <Text style={styles.additionalTagsTitle}>
                      Your Access Tags:
                    </Text>
                    <AccessTags
                      tags={additionalMatchingTags}
                      userAccessTags={userAccessTags}
                      filterOption={filterOption}
                      accessTagMap={accessTagMap}
                      showAdditionalTags={true}
                    />
                  </View>
                )}

                <TouchableOpacity
                  style={styles.directionsButton}
                  onPress={() => openDirections(place)}
                >
                  <Text style={styles.directionsText}>Directions</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  matchingCard: {
    backgroundColor: "#e6ffe6", // Light green background for matching cards
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginRight: 15,
    borderRadius: 8,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f0f0f0",
  },
  contentContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  ratingsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  ratingTile: {
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    padding: 4,
    marginRight: 8,
    minWidth: 80,
    alignItems: "center",
  },
  ratingCategory: {
    fontSize: 12,
    color: "#666",
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
  accessTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  additionalTagsContainer: {
    marginBottom: 8,
  },
  additionalTagsTitle: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    color: "#007AFF",
  },
  accessTag: {
    backgroundColor: "#f0f0f0",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  matchingAccessTag: {
    backgroundColor: "#4CAF50", // Green background for matching tags
  },
  accessTagText: {
    fontSize: 12,
    color: "#333",
  },
  matchingAccessTagText: {
    color: "white",
  },
  directionsButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  directionsText: {
    color: "white",
    fontWeight: "500",
  },
});

export default PlacesList;
