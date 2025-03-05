import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity } from "react-native";
import MapView, { Region } from "react-native-maps";
import { getCurrentLocation } from "../api/locationService";
import SearchBar from "../components/SearchBar";
import PlacesList from "../components/PlacesList";
import { useAuth } from "../context/AuthContext";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/types";
import { Facility } from "../types";
import { Ionicons } from "@expo/vector-icons";
import { searchPlaces } from "../services/googlePlacesService";

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [region, setRegion] = useState<Region | null>(null);
  const [searchResults, setSearchResults] = useState<Facility[]>([]);
  const [showResults, setShowResults] = useState(false);
  const mapRef = useRef<MapView | null>(null);
  const { logout } = useAuth();

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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#007bff" />
      </TouchableOpacity>
      <SearchBar onSearch={handleSearch} />
      {region && (
        <MapView
          ref={mapRef}
          style={styles.map}
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
    height: Dimensions.get("window").height,
  },
  logoutButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
    backgroundColor: "white",
    padding: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default HomeScreen;
