import React from "react";
import { View } from "react-native";
import styles from "./Divider.module.css";

export default function Divider() {
  return <View classList={[styles.divider]} />;
}
