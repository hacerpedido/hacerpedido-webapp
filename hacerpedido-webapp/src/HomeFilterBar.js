import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
} from "react-native";
import { categories } from "./categories";

function Item({ id, title, selected, onSelect }) {
  return (
    <TouchableHighlight
      underlayColor={"#fafafa"}
      onPress={() => onSelect(id)}
      style={[
        styles.item,
        {
          backgroundColor: selected ? "#FFB233" : "#FFFFFF",
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: selected ? "#FFFFFF" : "#FFB233",
          },
        ]}
      >
        {title}
      </Text>
    </TouchableHighlight>
  );
}

export default ({ selectedFilter, onSelectFilter }) => {
  // TODO: mover todo esto a Redux!!
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
        renderItem={({ item }) => (
          <Item
            id={item}
            title={item}
            selected={!!(selected === item)}
            onSelect={onSelect}
          />
        )}
        keyExtractor={(item) => item}
        extraData={selected}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#F3F0EB",
    borderBottomWidth: 1,
    paddingLeft: 4,
    paddingRight: 4,
  },
  item: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    paddingVertical: 10,
    marginVertical: 8,
    marginHorizontal: 4,
    borderRadius: 4,
    borderColor: "#E6A02E",
    borderWidth: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: "Barlow",
    fontWeight: 600,
    color: "#E5A130",
  },
});
