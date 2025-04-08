import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Modal,
  SafeAreaView,
} from "react-native";
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
import { useAuth } from "../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, "Home">,
  NativeStackScreenProps<RootStackParamList>
>;

type FilterOption = "none" | "myAccessTags" | "selectAccessTag";

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
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
  const [filterOption, setFilterOption] = useState<FilterOption>("none");
  const [showFilterModal, setShowFilterModal] = useState(false);

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

  const toggleFilterModal = () => {
    setShowFilterModal(!showFilterModal);
  };

  const selectFilterOption = (option: FilterOption) => {
    setFilterOption(option);
    setShowFilterModal(false);
  };

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          ref={mapRef}
          style={styles.map}
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

      {/* Overlay: Search bar and filter button */}
      <View style={[styles.overlayContainer, { paddingTop: insets.top }]}>
        <View style={styles.searchContainer}>
          <SearchBar onSearch={handleSearch} />
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterOption !== "none" && styles.activeFilterButton,
            ]}
            onPress={toggleFilterModal}
          >
            <Ionicons
              name="filter"
              size={24}
              color={filterOption !== "none" ? "#fff" : "#007AFF"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Results List */}
      {showResults && (
        <PlacesList
          places={searchResults}
          onPlaceSelect={(place: Facility) =>
            navigation.navigate("Place", { place })
          }
          filterOption={filterOption}
          userAccessTags={user?.preferredAccessTags || []}
        />
      )}

      {/* Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="slide"
        onRequestClose={toggleFilterModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Access Tags</Text>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filterOption === "none" && styles.selectedFilterOption,
              ]}
              onPress={() => selectFilterOption("none")}
            >
              <Text style={styles.filterOptionText}>No Filter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filterOption === "myAccessTags" && styles.selectedFilterOption,
              ]}
              onPress={() => selectFilterOption("myAccessTags")}
            >
              <Text style={styles.filterOptionText}>My Access Tags</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterOption,
                filterOption === "selectAccessTag" &&
                  styles.selectedFilterOption,
              ]}
              onPress={() => selectFilterOption("selectAccessTag")}
            >
              <Text style={styles.filterOptionText}>Select Access Tag</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={toggleFilterModal}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    paddingHorizontal: 10,
    flexDirection: "column",
  },
  searchContainer: {
    marginBottom: 10, // spacing between search and filter
  },
  filterRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeFilterButton: {
    backgroundColor: "#007AFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  filterOption: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#f0f0f0",
  },
  selectedFilterOption: {
    backgroundColor: "#e0e0e0",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  filterOptionText: {
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#007AFF",
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;
