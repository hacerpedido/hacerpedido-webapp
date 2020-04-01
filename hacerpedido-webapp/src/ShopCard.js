import React from "react";
import { Link } from "react-router-dom";

export default function ShopCard({ shop }) {
  return (
    <div>
      <Link to={shop.slug}>
        <h3>{shop.name}</h3>
      </Link>
      {shop.logo ? <img src="{shop.logo}" alt={shop.name + " logo"} /> : ""}
      {shop.address ? <p>{shop.address}</p> : ""}
      {shop.openTimes ? <p>Pedidos: {shop.openTimes}</p> : ""}
      {shop.deliveryCost ? <p>Delivery: {shop.deliveryCost}</p> : ""}
    </div>
  );
}
