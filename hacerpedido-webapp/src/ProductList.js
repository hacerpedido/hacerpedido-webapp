import React from "react";
// import { Card, Layout,  } from "@ui-kitten/components";
import { StyleSheet, Text, View } from "react-native";

const productStyles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  price: {
    marginLeft: 12,
    fontFamily: "Barlow",
    fontWeight: "600",
    fontSize: 15,
    color: "#B27D23",
  },
  description: {
    flex: 1,
    flexWrap: "wrap",
    color: "#8f9bb3",
    fontFamily: "Roboto Slab",
    fontSize: 12,
    lineHeight: 16,
  },
  name: {
    flex: 1,
    flexWrap: "wrap",
    fontFamily: "Barlow",
    fontWeight: "600",
    color: "#4D360F",
    fontSize: 15,
    lineHeight: 18,
    marginBottom: 5,
  },
});

const styles = StyleSheet.create({
  card: {
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    borderRadius: 7,
    padding: 10,
    paddingLeft: 15,
    paddingRight: 15,
  },
  product: {
    marginTop: 15,
    marginLeft: 16,
    marginRight: 16,
    paddingRight: 10,
    borderBottomWidth: 1,
    borderColor: "#edf1f7",
    paddingBottom: 10,
  },
  category: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 16,
    marginBottom: 2,
    fontFamily: "Barlow",
    fontWeight: "800",
    fontSize: 17,
    color: "#4D360F",
  },
  divider: {
    borderColor: "#edf1f7",
    backgroundColor: "#fafafa",
    height: 10,
    width: "100%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: 16,
    marginBottom: 16,
  },
});

function Product({ product }) {
  return (
    <View key={product.id} style={[productStyles.container, styles.product]}>
      <View style={{ flex: 1 }}>
        <Text style={productStyles.name}>{product.name}</Text>
        <Text style={productStyles.description}>{product.description}</Text>
      </View>
      <Text style={productStyles.price}>
        {product.price ? "$" : null}
        {product.price}
      </Text>
    </View>
  );
}

function ProductPromo({ product }) {
  return (
    <View key={product.id} style={styles.card}>
      <View style={productStyles.container}>
        <View style={{ flex: 1 }}>
          <Text style={productStyles.name}>{product.name}</Text>
          <Text style={productStyles.description}>{product.description}</Text>
        </View>
        <Text style={productStyles.price}>
          {product.price ? "$" : null}
          {product.price}
        </Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider}></View>;
}

export default function ProductList(props) {
  const listItems = [];

  let category = "";

  props.products.forEach((product) => {
    if (category !== product.category) {
      if (product.category !== "Promociones") {
        listItems.push(<Divider />);
      }
      listItems.push(
        <Text category="h5" style={styles.category}>
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
  listItems.push(<Divider />);

  return <>{listItems}</>;
}
