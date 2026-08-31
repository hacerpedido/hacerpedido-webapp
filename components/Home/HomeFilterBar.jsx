import React from "react";
import { FlatList, Text, TouchableHighlight, View } from "react-native";

import { categories } from "../../lib/utils/categories";
import colors from "../../assets/colors";
import styles from "./HomeFilterBar.module.css";

function Item({ id, title, selected, onSelect }) {
  return (
    <TouchableHighlight
      accessibilityLabel={title}
      accessibilityRole="button"
      underlayColor={colors.lightBackground}
      onPress={() => onSelect(id)}
      classList={[styles.item]}
      style={{ backgroundColor: selected ? colors.orangeHP : colors.white }}
      testID={`category-${id}`}
    >
      <Text classList={[styles.title]} style={{ color: selected ? colors.white : colors.orangeHP }}>
        {title}
      </Text>
    </TouchableHighlight>
  );
}

const HomeFilterBar = ({ selectedFilter, onSelectFilter }) => {
  const [selected, setSelected] = React.useState(String);

  if (selected === "") {
    setSelected(selectedFilter);
  }

  const onSelect = React.useCallback(
    (id) => {
      setSelected(id);
      onSelectFilter(id);
    },
    [onSelectFilter]
  );

  return (
    <View classList={[styles.container]}>
      <FlatList
        alwaysBounceHorizontal={true}
        showsVerticalScrollIndicator={false}
        horizontal={true}
        data={categories}
        renderItem={({ item }) => <Item id={item} title={item} selected={selected === item} onSelect={onSelect} />}
        keyExtractor={(item) => item}
        extraData={selected}
      />
    </View>
  );
};

export default HomeFilterBar;

// Styles moved to HomeFilterBar.module.css
