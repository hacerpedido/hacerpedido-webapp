import React from "react";
import { ActivityIndicator } from "react-native";

export default function Loading() {
  return (
    <ActivityIndicator size="large" color="#FFB233" style={{ margin: 30 }} />
  );
}
