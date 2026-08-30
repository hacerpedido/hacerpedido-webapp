import React from "react";
import { FlatList, StyleSheet, Text, TouchableHighlight, View } from "react-native";

import { categories } from "../../lib/utils/categories";
import colors from "../../assets/colors";

function Item({ id, title, selected, onSelect }) {
  return (
    <TouchableHighlight
      accessibilityLabel={title}
      accessibilityRole="button"
      underlayColor={colors.lightBackground}
      onPress={() => onSelect(id)}
      style={[styles.item, { backgroundColor: selected ? colors.orangeHP : colors.white }]}
      testID={`category-${id}`}
    >
      <Text style={[styles.title, { color: selected ? colors.white : colors.orangeHP }]}>{title}</Text>
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
    <View style={styles.container}>
      <FlatList
        alwaysBounceHorizontal={true}
        showsVerticalScrollIndicator={false}
        horizontal={true}
        data={categories}
        renderItem={({ item }) => <Item id={item} title={item} selected={!!(selected === item)} onSelect={onSelect} />}
        keyExtractor={(item) => item}
        extraData={selected}
      />
    </View>
  );
};

export default HomeFilterBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderColor: colors.filterBarBorder,
    flex: 1,
    paddingLeft: 4,
    paddingRight: 4,
  },
  item: {
    backgroundColor: colors.white,
    padding: 15,
    paddingVertical: 10,
    marginVertical: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    borderColor: colors.filterButtonBorder,
    borderWidth: 1,
  },
  title: {
    color: colors.filterButtonTitle,
    fontFamily: "Barlow",
    fontSize: 16,
    fontWeight: 600,
  },
});
