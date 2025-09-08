/* 
  This section contains all the main components of the home screen. 
  This includes the background map, search bar to access any facility 
  listed in the location database, filters for access tags and 
  some account verification. Styles for most of the buttons and on-screen
  displays are here, the rest are in the constants folder. 
 */

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
  Modal,
  SafeAreaView,
  Alert,
  ScrollView,
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
import { Colors } from "../constants/colors";
import { AccessTags } from "../components/AccessTags";

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
  const [selectedAccessTags, setSelectedAccessTags] = useState<string[]>([]);
  const [showTagSelectionModal, setShowTagSelectionModal] = useState(false);
  const [tempSelectedTags, setTempSelectedTags] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<
    "Physical" | "Sensory" | "Cognitive" | null
  >(null);

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
    if (option === "selectAccessTag") {
      setShowFilterModal(false);
      setShowTagSelectionModal(true);
      setTempSelectedTags([]);
      setSelectedCategory(null);
    } else {
      setFilterOption(option);
      setShowFilterModal(false);
      // Clear selected access tags when switching to other filter options
      if (option === "none" || option === "myAccessTags") {
        setSelectedAccessTags([]);
      }
    }
  };

  const handleApplySelectedTags = () => {
    if (tempSelectedTags.length === 0) {
      Alert.alert(
        "No Tags Selected",
        "Please select at least one access tag to filter by."
      );
      return;
    }

    setSelectedAccessTags(tempSelectedTags);
    setFilterOption("selectAccessTag");
    setShowTagSelectionModal(false);
  };

  const handleCancelTagSelection = () => {
    setShowTagSelectionModal(false);
    setTempSelectedTags([]);
    setSelectedCategory(null);
  };

  const getCategoryColor = (category: "Physical" | "Sensory" | "Cognitive") => {
    const categoryKey = category.toLowerCase() as
      | "physical"
      | "sensory"
      | "cognitive";
    return Colors.categories[categoryKey].main;
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
        <>
          {(() => {
            console.log("User in HomeScreen:", user);
            console.log(
              "User access tags in HomeScreen:",
              user?.preferredAccessTags
            );
            return null;
          })()}
          <PlacesList
            places={searchResults}
            onPlaceSelect={(place: Facility) =>
              navigation.navigate("Place", { place })
            }
            filterOption={filterOption}
            userAccessTags={user?.preferredAccessTags || []}
            selectedAccessTags={selectedAccessTags}
          />
        </>
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
              {selectedAccessTags.length > 0 && (
                <View style={styles.selectedTagsContainer}>
                  {selectedAccessTags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={styles.selectedTagChip}>
                      <Text style={styles.selectedTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
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

      {/* Tag Selection Modal */}
      <Modal
        visible={showTagSelectionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelTagSelection}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tagSelectionModalContent}>
            <Text style={styles.modalTitle}>Select Access Tags</Text>
            <Text style={styles.selectionCounter}>
              {tempSelectedTags.length}/3 selected
            </Text>

            <View style={styles.categoryButtons}>
              {(["Physical", "Sensory", "Cognitive"] as const).map(
                (category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && {
                        backgroundColor: getCategoryColor(category),
                        borderColor: getCategoryColor(category),
                        borderWidth: 1,
                      },
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        {
                          color:
                            selectedCategory === category
                              ? Colors.text.light
                              : getCategoryColor(category),
                        },
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <ScrollView
              style={styles.tagsScrollView}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {selectedCategory && (
                <AccessTags
                  selectedTags={tempSelectedTags}
                  onTagSelect={(tags) => {
                    // Limit selection to 3 tags maximum
                    if (tags.length <= 3) {
                      setTempSelectedTags(tags);
                    }
                  }}
                  category={
                    selectedCategory.toLowerCase() as
                      | "physical"
                      | "sensory"
                      | "cognitive"
                  }
                />
              )}
            </ScrollView>

            <View style={styles.tagSelectionButtons}>
              <TouchableOpacity
                style={styles.cancelTagButton}
                onPress={handleCancelTagSelection}
              >
                <Text style={styles.cancelTagButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyTagButton}
                onPress={handleApplySelectedTags}
              >
                <Text style={styles.applyTagButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
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
    backgroundColor: Colors.background.secondary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeFilterButton: {
    backgroundColor: Colors.button.primary.background,
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
    marginBottom: 8,
    textAlign: "center",
  },
  selectionCounter: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: "center",
    marginBottom: 20,
  },
  filterOption: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: Colors.background.secondary,
  },
  selectedFilterOption: {
    backgroundColor: Colors.background.highlight,
    borderWidth: 1,
    borderColor: Colors.button.primary.background,
  },
  filterOptionText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  closeButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: Colors.button.primary.background,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: Colors.text.light,
    fontSize: 16,
    fontWeight: "bold",
  },
  selectedTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  selectedTagChip: {
    backgroundColor: Colors.button.primary.background,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  selectedTagText: {
    color: Colors.text.light,
    fontSize: 12,
    fontWeight: "500",
  },
  tagSelectionModalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  tagsScrollView: {
    maxHeight: 300,
    marginBottom: 16,
  },
  categoryButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.background.divider,
    backgroundColor: Colors.background.card,
    flex: 1,
    alignItems: "center",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  tagSelectionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  cancelTagButton: {
    flex: 1,
    padding: 15,
    backgroundColor: Colors.background.secondary,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
  },
  cancelTagButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
  applyTagButton: {
    flex: 1,
    padding: 15,
    backgroundColor: Colors.button.primary.background,
    borderRadius: 10,
    alignItems: "center",
    marginLeft: 10,
  },
  applyTagButtonText: {
    color: Colors.text.light,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;
