import React from "react";
import { useParams } from "react-router-dom";

export default function Shop() {
  let { shopId } = useParams();

  return <h3>Requested shop ID: {shopId}</h3>;
}
