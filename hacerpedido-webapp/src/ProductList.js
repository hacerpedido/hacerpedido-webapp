import React, { useEffect, useReducer, View } from "react";
import API, { graphqlOperation } from "@aws-amplify/api";
import { Card, Layout, Text, Spinner } from "@ui-kitten/components";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  card: {
    marginTop: 16
  },
  category: {
    // marginBottom: 16,
    marginTop: 16
  }
});

function Product({ product }) {
  return (
    <Text key={product.id}>
      {product.name} - {product.description} - ${product.price}
    </Text>
  );
}

function ProductPromo({ product }) {
  return (
    <Card key={product.id} style={styles.card}>
      <Text>
        {product.name} - {product.description} - ${product.price}
      </Text>
    </Card>
  );
}

export default function ProductList(props) {
  const listItems = [];

  let category = "";

  props.products.forEach(product => {
    if (category !== product.category) {
      listItems.push(
        <Text category="h6" style={styles.category}>
          {product.category}
        </Text>
      );
      category = product.category;
    }

    if (product.category === "Promociones") {
      listItems.push(<ProductPromo product={product} />);
    } else {
      listItems.push(<Product product={product} />);
    }
  });

  return <>{listItems}</>;
}
