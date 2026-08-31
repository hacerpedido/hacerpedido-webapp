import React from "react";
import { ActivityIndicator } from "react-native";
import styles from "./Loading.module.css";
import colors from "../assets/colors";

export default function Loading() {
  return <ActivityIndicator size="large" color={colors.orangeHP} classList={[styles.default]} />;
}
