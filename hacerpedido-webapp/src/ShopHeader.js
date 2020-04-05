import React from "react";
import { View, Image, StyleSheet } from "react-native";
import {
  Icon,
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
    width: 75,
    height: 75,
    alignItems: "center"
  },
  containerLabels: {
    flex: 1,
    paddingStart: 8
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
    width: 75,
    height: 75
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
    <View style={{ backgroundColor: theme["color-primary-default"] }}>
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
        <Text category="h4" style={styles.nameLabel}>{shop.name}</Text>
        {shop.address ? (
          <DecoratedLabel
            iconName="pin"
            text={shop.address}
            style={styles.decoratedLabel}
          />
        ) : null}
        {shop.openTimes ? (
          <DecoratedLabel
            iconName="clock"
            text={"Pedidos: " + shop.openTimes}
            style={styles.decoratedLabel}
          />
        ) : null}
        {shop.deliveryCost ? (
          <DecoratedLabel
            iconName="car"
            text={"Delivery: " + shop.deliveryCost}
            style={styles.decoratedLabel}
          />
        ) : null}
      </View>
    </View>
  );
}
