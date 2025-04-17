import React from "react";
import { View, StyleSheet } from "react-native";
import { Colors } from "../constants/colors";

interface DecorativeShapesProps {
  style?: any;
}

const DecorativeShapes: React.FC<DecorativeShapesProps> = ({ style }) => {
  return (
    <View style={[styles.container, style]}>
      {/* Physical category shapes - circles */}
      <View
        style={[
          styles.shape,
          styles.circle,
          styles.physical,
          { top: "5%", left: "-8%" },
        ]}
      />
      <View
        style={[
          styles.shape,
          styles.circle,
          styles.physical,
          { bottom: "5%", right: "-8%" },
        ]}
      />

      {/* Sensory category shapes - squares */}
      <View
        style={[
          styles.shape,
          styles.square,
          styles.sensory,
          { top: "20%", right: "-10%" },
        ]}
      />
      <View
        style={[
          styles.shape,
          styles.square,
          styles.sensory,
          { bottom: "30%", left: "-10%" },
        ]}
      />

      {/* Cognitive category shapes - triangles */}
      <View
        style={[
          styles.shape,
          styles.triangle,
          styles.cognitive,
          { top: "40%", left: "-12%" },
        ]}
      />
      <View
        style={[
          styles.shape,
          styles.triangle,
          styles.cognitive,
          { bottom: "15%", right: "-12%" },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    overflow: "hidden",
    zIndex: 0,
  },
  shape: {
    position: "absolute",
    opacity: 0.25,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  square: {
    width: 100,
    height: 100,
    borderRadius: 20,
  },
  triangle: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 50,
    borderRightWidth: 50,
    borderBottomWidth: 100,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  physical: {
    backgroundColor: "#006D77", // Teal
  },
  sensory: {
    backgroundColor: "#E69F00", // Amber
  },
  cognitive: {
    borderBottomColor: "#8E44AD", // Purple
  },
});

export default DecorativeShapes;
