import React from "react";
import { View, Image, StyleSheet } from "react-native";
import {
  Icon,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction,
  useTheme
} from "@ui-kitten/components";
import { useHistory } from "react-router-dom";

import DecoratedLabel from "./components/DecoratedLabel";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  },
  containerLogo: {
    flex: -1,
    width: 100,
    height: 100,
    alignItems: "center"
  },
  containerLabels: {
    flex: 1,
    paddingStart: 8
  },
  containerBottom: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    flex: 1,
    backgroundColor: "none",
    padding: 12,
    paddingTop: 18
  },
  containerDelivery: {
    justifyContent: "flex-end",
    backgroundColor: "none"
  },
  decoratedLabel: {
    textAlignVertical: "center",
    color: "#222b45",
    paddingBottom: 6
  },
  nameLabel: {
    color: "#222b45",
    padding: 6
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50
  }
});

export default function ShopHeader({ shop }) {
  const theme = useTheme();
  const history = useHistory();

  const BackIcon = style => <Icon {...style} name="arrow-back" />;

  const BackAction = props => (
    <TopNavigationAction {...props} icon={BackIcon} />
  );

  const renderLeftControl = () => (
    <BackAction
      onPress={() => {
        history.push("/");
      }}
    />
  );

  return (
    <View
      style={{
        backgroundColor: theme["color-primary-default"],
        marginBottom: 16
      }}
    >
      <TopNavigation
        style={{ backgroundColor: theme["color-primary-default"] }}
        leftControl={renderLeftControl()}
      />
      <View style={styles.container}>
        <View style={styles.containerLogo}>
          <Image
            source={{
              uri: shop.logo
            }}
            style={styles.logo}
          />
        </View>
        <Text category="h4" style={styles.nameLabel}>
          {shop.name}
        </Text>
        {shop.address ? (
          <DecoratedLabel
            iconName="pin"
            text={shop.address}
            color={"#222b45"}
          />
        ) : null}
      </View>
      <Layout style={styles.containerBottom}>
        {shop.openTimes ? (
          <DecoratedLabel
            iconName="clock"
            text={"Pedidos: " + shop.openTimes}
            color={"#222b45"}
          />
        ) : null}
        <Layout style={styles.containerDelivery}>
          {shop.deliveryCost ? (
            <DecoratedLabel
              iconName="car"
              text={"Delivery: " + shop.deliveryCost}
              color={"#222b45"}
            />
          ) : null}
        </Layout>
      </Layout>
    </View>
  );
}
