import React from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Text,
} from "react-native";

const categories = [
  "Comida",
  "Kiosko",
  "Bebida",
  "Fruta y Verdura",
  "Café",
  "Farmacia",
  "Otros",
];

function Item({ id, title, selected, onSelect }) {
  return (
    <TouchableOpacity
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
    </TouchableOpacity>
  );
}

export default function HomeFilterBar({selectedFilter, onSelectFilter }) {
  const [selected, setSelected] = React.useState(String);

  if (selected === "") {
      setSelected(selectedFilter);
  }

  const onSelect = React.useCallback((id) => {
    setSelected(id);
    onSelectFilter(id);
  }, [onSelectFilter]);

  return (
    <SafeAreaView style={styles.container}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderColor: "#F3F0EB",
    borderBottomWidth: 1,
    paddingLeft: 4,
    paddingRight: 4
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
