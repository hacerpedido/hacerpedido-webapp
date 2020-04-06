import React from "react";
import { Card, Layout, Text } from "@ui-kitten/components";
import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  card: {
    marginTop: 16
  },
  container: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    flex: 1
  },
  category: {
    // marginBottom: 16,
    marginTop: 16
  },
  price: {
    marginRight: 24
  },
  description: {
    color: "#8f9bb3"
  },
  name: {
    marginTop: 16
  },
  nameProduct: {
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 14,
    borderBottomWidth: 1,
    borderColor: "#edf1f7",
    paddingBottom: 8
  },
  divider: {
    borderColor: "#edf1f7",
    backgroundColor: "#fafcff",
    height: 10,
    width: "100%",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginTop: 16,
    marginBottom: 16
  }
});

function Product({ product }) {
  return (
    <Layout key={product.id} style={styles.container}>
      <Layout style={styles.nameProduct}>
        <Text category="s1" style={styles.name}>
          {product.name}
        </Text>
        <Text style={styles.description}>{product.description}</Text>
      </Layout>
      <Text category="s1" style={styles.price}>
        ${product.price}
      </Text>
    </Layout>
  );
}

function ProductPromo({ product }) {
  return (
    <Card key={product.id} style={styles.card}>
      <Layout style={styles.container}>
        <Layout>
          <Text category="s1">{product.name}</Text>
          <Text style={styles.description}>{product.description}</Text>
        </Layout>
        <Text category="s1">${product.price}</Text>
      </Layout>
    </Card>
  );
}

function Divider() {
  return <Layout style={styles.divider}></Layout>;
}

export default function ProductList(props) {
  const listItems = [];

  let category = "";

  props.products.forEach(product => {
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
