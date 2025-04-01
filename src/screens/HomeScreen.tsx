import React, { useState, useRef, useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { RootStackParamList, TabParamList } from "../navigation/types";
import { Facility } from "../types";
import SearchBar from "../components/SearchBar";
import PlacesList from "../components/PlacesList";
import { searchPlaces } from "../services/googlePlacesService";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { CompositeScreenProps } from "@react-navigation/native";
import * as Location from "expo-location";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [searchResults, setSearchResults] = useState<Facility[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const [lastSearchQuery, setLastSearchQuery] = useState<string>("");

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setLastSearchQuery(query);
      const results = await searchPlaces(query, {
        latitude: region?.latitude || 37.7749,
        longitude: region?.longitude || -122.4194,
      });
      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching places:", error);
    }
  };

  const refreshSearchResults = async () => {
    if (lastSearchQuery) {
      await handleSearch(lastSearchQuery);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      refreshSearchResults();
    }, [lastSearchQuery])
  );

  useEffect(() => {
    const getLocation = async () => {
      try {
        // Request location permissions
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.error("Location permission not granted");
          // Set default region (San Francisco)
          setRegion({
            latitude: 37.7749,
            longitude: -122.4194,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
          return;
        }

        // Get current location
        const location = await Location.getCurrentPositionAsync({});
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error("Error getting location:", error);
        // Set default region (San Francisco)
        setRegion({
          latitude: 37.7749,
          longitude: -122.4194,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    };

    getLocation();
  }, []);

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
    height: Dimensions.get("window").height,
  },
});

export default HomeScreen;
