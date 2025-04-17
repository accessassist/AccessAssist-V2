import React, { useState } from "react";
import { View, TextInput, StyleSheet } from "react-native";

interface SearchBarProps {
  onSearch: (query: string) => Promise<void>;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = () => {
    onSearch(query);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Search places..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  input: {
    height: 50,
    backgroundColor: "white",
    borderRadius: 25,
    paddingHorizontal: 20,
    marginHorizontal: 0,
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

export default SearchBar;
