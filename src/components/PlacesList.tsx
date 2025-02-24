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
import { Facility } from "../types";

interface PlacesListProps {
  places: Facility[];
  onPlaceSelect: (place: Facility) => void;
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

const PlacesList: React.FC<PlacesListProps> = ({ places, onPlaceSelect }) => {
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {places.map((place) => (
          <TouchableOpacity
            key={place.id}
            style={styles.card}
            onPress={() => onPlaceSelect(place)}
          >
            <View style={styles.imageContainer}>
              {/* Placeholder for image */}
              <View style={styles.imagePlaceholder} />
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.name}>{place.name}</Text>
              <Text style={styles.address}>{place.address}</Text>
              <View style={styles.ratingsContainer}>
                <RatingTile category="Physical" rating={place.physicalRating} />
                <RatingTile category="Sensory" rating={place.sensoryRating} />
                <RatingTile
                  category="Cognitive"
                  rating={place.cognitiveRating}
                />
              </View>
              <TouchableOpacity
                style={styles.directionsButton}
                onPress={() => openDirections(place)}
              >
                <Text style={styles.directionsText}>Directions</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
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
  imageContainer: {
    width: 80,
    height: 80,
    marginRight: 15,
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#eee",
    borderRadius: 8,
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
});

export default PlacesList;
