import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Region } from "react-native-maps";
import { getCurrentLocation } from "../api/locationService";
import SearchBar from "../components/SearchBar";
import PlacesList from "../components/PlacesList";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList, TabParamList } from "../navigation/types";
import { Facility } from "../types";
import { searchPlaces } from "../services/googlePlacesService";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [region, setRegion] = useState<Region | null>(null);
  const [searchResults, setSearchResults] = useState<Facility[]>([]);
  const [showResults, setShowResults] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async (): Promise<void> => {
    try {
      const location = await getCurrentLocation();
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const handleSearch = async (query: string): Promise<void> => {
    try {
      const results = await searchPlaces(
        query,
        region
          ? {
              latitude: region.latitude,
              longitude: region.longitude,
            }
          : undefined
      );
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching places:", error);
    }
  };

  return (
    <View style={styles.container}>
      <SearchBar onSearch={handleSearch} />
      {region && (
        <MapView
          ref={mapRef}
          style={[styles.map, { paddingBottom: insets.bottom }]}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton
        />
      )}
      {showResults && (
        <PlacesList
          places={searchResults}
          onPlaceSelect={(place: Facility) =>
            navigation.navigate("Place", { place })
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height - 60, // Account for tab bar height
  },
});

export default HomeScreen;
