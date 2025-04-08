import React from "react";
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
}

const AccessTags: React.FC<AccessTagsProps> = ({
  tags,
  userAccessTags,
  filterOption,
}) => {
  // Check if any of the tags match the user's access tags
  const hasMatchingTags =
    filterOption === "myAccessTags" &&
    tags.some((tag) => userAccessTags.includes(tag));

  return (
    <View style={styles.accessTagsContainer}>
      {tags.slice(0, 3).map((tag, index) => {
        const isMatchingTag =
          filterOption === "myAccessTags" && userAccessTags.includes(tag);
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

  // Filter places based on the selected filter option
  const filteredPlaces = places.filter((place) => {
    if (filterOption === "none") return true;

    if (filterOption === "myAccessTags") {
      // Check if the place has any of the user's preferred access tags
      return place.accessTags.some((tag) => userAccessTags.includes(tag));
    }

    return true; // For "selectAccessTag" option, we'll handle it later
  });

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {filteredPlaces.map((place) => {
          // Check if this place has matching access tags
          const hasMatchingTags =
            filterOption === "myAccessTags" &&
            place.accessTags.some((tag) => userAccessTags.includes(tag));

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
                <AccessTags
                  tags={place.commonAccessTags}
                  userAccessTags={userAccessTags}
                  filterOption={filterOption}
                />
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
    backgroundColor: "#eee",
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
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
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
  directionsButton: {
    backgroundColor: "#2196F3",
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  directionsText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
  },
  accessTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  accessTag: {
    backgroundColor: "#e8f4fd",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
    marginBottom: 4,
  },
  matchingAccessTag: {
    backgroundColor: "#4CAF50", // Green background for matching tags
  },
  accessTagText: {
    fontSize: 10,
    color: "#0066cc",
  },
  matchingAccessTagText: {
    color: "white", // White text for matching tags
  },
});

export default PlacesList;
