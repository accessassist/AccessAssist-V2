import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface StarRatingProps {
  rating: number;
  size?: number;
  color?: string;
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 20,
  color = "#FFD700",
  onRatingChange,
}) => {
  const handleStarPress = (index: number) => {
    if (onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  return (
    <View style={styles.container}>
      {[...Array(5)].map((_, index) => {
        const starFilled = index < Math.floor(rating);
        const hasHalfStar = index === Math.floor(rating) && rating % 1 >= 0.5;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleStarPress(index)}
            disabled={!onRatingChange}
          >
            <FontAwesome
              name={
                starFilled ? "star" : hasHalfStar ? "star-half-o" : "star-o"
              }
              size={size}
              color={color}
              style={styles.star}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    marginRight: 2,
  },
});

export default StarRating;
