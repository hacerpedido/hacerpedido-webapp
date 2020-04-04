import React from "react";
import {
  Icon,
  TopNavigation,
  TopNavigationAction,
  useTheme
} from "@ui-kitten/components";
import { useHistory } from "react-router-dom";

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
    <TopNavigation
      style={{ backgroundColor: theme["color-primary-default"] }}
      title={shop.name}
      alignment="center"
      leftControl={renderLeftControl()}
    />
  );
}
