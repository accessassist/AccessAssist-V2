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
import { Colors, ColorUtils } from "../constants/colors";
import { getAccessTags } from "../api/firestoreService";

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

const RatingTile: React.FC<RatingTileProps> = ({ category, rating }) => {
  // Determine the color based on the category
  const getCategoryColor = (cat: string): string => {
    switch (cat) {
      case "Physical":
        return Colors.categories.physical.main;
      case "Sensory":
        return Colors.categories.sensory.main;
      case "Cognitive":
        return Colors.categories.cognitive.main;
      default:
        return Colors.text.primary;
    }
  };

  const categoryColor = getCategoryColor(category);

  return (
    <View style={[styles.ratingTile, { backgroundColor: categoryColor }]}>
      <Text style={[styles.ratingText, { color: Colors.text.light }]}>
        {category}
      </Text>
      <Text style={[styles.ratingValue, { color: Colors.text.light }]}>
        {" "}
        {rating.toFixed(1)}
      </Text>
    </View>
  );
};

interface AccessTagsProps {
  tags: string[];
  userAccessTags: string[];
  filterOption: FilterOption;
  accessTagMap: Record<string, string>;
  showAdditionalTags?: boolean;
  allAccessTags: AccessTag[]; // Add this to get category information
}

const AccessTags: React.FC<AccessTagsProps> = ({
  tags,
  userAccessTags,
  filterOption,
  accessTagMap,
  showAdditionalTags = false,
  allAccessTags,
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

  // Helper function to get tag colors based on category
  const getTagStyle = (tagName: string, isMatchingTag: boolean) => {
    // Find the full tag object to get its category
    const fullTag = allAccessTags.find((tag) => tag.name === tagName);

    if (fullTag && fullTag.category) {
      const category = fullTag.category as "physical" | "sensory" | "cognitive";

      if (isMatchingTag) {
        // Matching tag: use category main color for background, white text
        return {
          backgroundColor: ColorUtils.getCategoryColor(category, "main"),
          borderColor: ColorUtils.getCategoryColor(category, "main"),
          borderWidth: 1,
          textColor: Colors.text.light,
        };
      } else {
        // Non-matching tag: use category background color, category main color for text
        return {
          backgroundColor: ColorUtils.getCategoryColor(category, "background"),
          borderColor: ColorUtils.getCategoryColor(category, "main"),
          borderWidth: 1,
          textColor: ColorUtils.getCategoryColor(category, "main"),
        };
      }
    }

    // Fallback for tags without category information
    return {
      backgroundColor: Colors.background.card,
      borderColor: Colors.border.default,
      borderWidth: 1,
      textColor: Colors.text.secondary,
    };
  };

  return (
    <View style={styles.accessTagsContainer}>
      {tagsToShow.map((tag, index) => {
        const isMatchingTag =
          filterOption === "myAccessTags" &&
          userAccessTags.length > 0 &&
          !!accessTagMap[tag] &&
          userAccessTags.includes(accessTagMap[tag]);

        const tagStyle = getTagStyle(tag, isMatchingTag);

        return (
          <View
            key={index}
            style={[
              styles.accessTag,
              {
                backgroundColor: tagStyle.backgroundColor,
                borderColor: tagStyle.borderColor,
                borderWidth: tagStyle.borderWidth,
              },
            ]}
          >
            <Text style={[styles.accessTagText, { color: tagStyle.textColor }]}>
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
  const [allAccessTags, setAllAccessTags] = useState<AccessTag[]>([]);

  // Fetch all access tags to get category information
  useEffect(() => {
    const loadAccessTags = async () => {
      try {
        const tags = await getAccessTags();
        setAllAccessTags(tags);
      } catch (error) {
        console.error("Error loading access tags:", error);
      }
    };

    loadAccessTags();
  }, []);

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
                  allAccessTags={allAccessTags}
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
                      allAccessTags={allAccessTags}
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
    backgroundColor: Colors.background.app,
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
    borderBottomColor: Colors.background.divider,
    backgroundColor: Colors.background.card,
  },
  matchingCard: {
    backgroundColor: Colors.background.list,
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
    backgroundColor: Colors.background.list,
  },
  contentContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
    color: Colors.text.primary,
  },
  address: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  ratingsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  ratingTile: {
    padding: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "500",
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
    color: Colors.text.link,
  },
  accessTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  accessTagText: {
    fontSize: 14,
  },
  directionsButton: {
    backgroundColor: Colors.button.primary.background,
    borderRadius: 8,
    padding: 8,
    alignItems: "center",
  },
  directionsText: {
    color: Colors.button.primary.text,
    fontWeight: "500",
  },
});

export default PlacesList;
