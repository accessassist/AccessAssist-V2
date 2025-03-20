import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Region, Marker } from "react-native-maps";
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

      // Calculate the bounds of all results
      if (results.length > 0 && mapRef.current) {
        const coordinates = results.map((place) => ({
          latitude: place.location.latitude,
          longitude: place.location.longitude,
        }));

        // Find min and max coordinates
        const minLat = Math.min(...coordinates.map((c) => c.latitude));
        const maxLat = Math.max(...coordinates.map((c) => c.latitude));
        const minLng = Math.min(...coordinates.map((c) => c.longitude));
        const maxLng = Math.max(...coordinates.map((c) => c.longitude));

        // Add padding to the region
        const PADDING = 0.1; // 10% padding
        const newRegion = {
          latitude: (minLat + maxLat) / 2,
          longitude: (minLng + maxLng) / 2,
          latitudeDelta: (maxLat - minLat) * (1 + PADDING),
          longitudeDelta: (maxLng - minLng) * (1 + PADDING),
        };

        mapRef.current.animateToRegion(newRegion, 1000);
      }
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
        >
          {searchResults.map((place) => (
            <Marker
              key={place.id}
              coordinate={{
                latitude: place.location.latitude,
                longitude: place.location.longitude,
              }}
              title={place.name}
              description={place.address}
              pinColor="red"
              onPress={() => navigation.navigate("Place", { place })}
            />
          ))}
        </MapView>
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
