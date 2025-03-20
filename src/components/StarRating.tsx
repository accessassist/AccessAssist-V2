import React from "react";
import { View, StyleSheet } from "react-native";
import { FontAwesome } from "@expo/vector-icons";

interface StarRatingProps {
  rating: number;
  size?: number;
  color?: string;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 20,
  color = "#FFD700",
}) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <View style={styles.container}>
      {[...Array(5)].map((_, index) => {
        if (index < fullStars) {
          return (
            <FontAwesome
              key={index}
              name="star"
              size={size}
              color={color}
              style={styles.star}
            />
          );
        } else if (index === fullStars && hasHalfStar) {
          return (
            <FontAwesome
              key={index}
              name="star-half-o"
              size={size}
              color={color}
              style={styles.star}
            />
          );
        } else {
          return (
            <FontAwesome
              key={index}
              name="star-o"
              size={size}
              color={color}
              style={styles.star}
            />
          );
        }
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
