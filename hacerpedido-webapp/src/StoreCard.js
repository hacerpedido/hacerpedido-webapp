import React from "react";
import { useParams } from "react-router-dom";

export default function StoreCard() {
  let { storeId } = useParams();

  return <h3>Requested store ID: {storeId}</h3>;
}
