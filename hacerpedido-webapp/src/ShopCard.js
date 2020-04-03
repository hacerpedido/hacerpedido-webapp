import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Text,
} from '@ui-kitten/components';

export default function ShopCard({ shop }) {
  return (
    <Card>
      <Link to={shop.slug}>
        <Text>{shop.name}</Text>
      </Link>
      {shop.logo ? <img src="{shop.logo}" alt={shop.name + " logo"} /> : null}
      {shop.address ? <Text>{shop.address}</Text> : null}
      {shop.openTimes ? <Text>Pedidos: {shop.openTimes}</Text> : null}
      {shop.deliveryCost ? <Text>Delivery: {shop.deliveryCost}</Text> : null}
    </Card>
  );
}
