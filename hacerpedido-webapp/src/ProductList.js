import React from "react";
import { Card, Layout, Text } from "@ui-kitten/components";
import { StyleSheet } from "react-native";

const productStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    flex: 1
  },
  price: {
    marginLeft: 12,
    fontFamily: "Barlow",
    fontWeight: "600"

  },
  description: {
    color: "#8f9bb3",
    flex: 1,
    flexWrap: "wrap"
  },
  name: {
    flex: 1,
    flexWrap: "wrap",
    fontFamily: "Barlow",
    fontWeight: "600"
  }
});

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    marginLeft: 16,
    marginRight: 16
  },
  product: {
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 16,
    marginRight: 16,
    paddingLeft: 25,
    paddingRight: 25,
    borderBottomWidth: 1,
    borderColor: "#edf1f7",
    paddingBottom: 12
  },
  category: {
    marginLeft: 16,
    marginRight: 16,
    marginTop: 16,
    fontFamily: "Barlow",
    fontWeight: "600"
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
    <Layout key={product.id} style={[productStyles.container, styles.product]}>
      <Layout>
        <Text category="s1" style={productStyles.name}>
          {product.name}
        </Text>
        <Text style={productStyles.description}>{product.description}</Text>
      </Layout>
      <Text category="s1" style={productStyles.price}>
        ${product.price}
      </Text>
    </Layout>
  );
}

function ProductPromo({ product }) {
  return (
    <Card key={product.id} style={styles.card}>
      <Layout style={productStyles.container}>
        <Layout style={{ flex: 1 }}>
          <Text category="s1" style={productStyles.name}>
            {product.name}
          </Text>
          <Text style={productStyles.description}>{product.description}</Text>
        </Layout>
        <Text category="s1" style={productStyles.price}>
          ${product.price}
        </Text>
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
