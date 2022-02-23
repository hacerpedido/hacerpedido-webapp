import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableHighlight, View, ListRenderItemInfo } from "react-native";

import colors from "../../assets/colors";
import { categories } from "../../lib/utils/categories";

interface ICategoryProps {
  title: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

function Category({ title, selected, onSelect }: ICategoryProps) {
  return (
    <TouchableHighlight
      underlayColor={colors.lightBackground}
      onPress={() => onSelect(title)}
      style={[styles.item, { backgroundColor: selected ? colors.orangeHP : colors.white }]}
    >
      <Text style={[styles.title, { color: selected ? colors.white : colors.orangeHP }]}>{title}</Text>
    </TouchableHighlight>
  );
}

interface IHomeFilterBarProps {
  selectedFilter: string;
  onSelectFilter: (id: number) => void;
}

const HomeFilterBar = ({ selectedFilter, onSelectFilter }: IHomeFilterBarProps) => {
  const [selected, setSelected] = useState("");

  if (!selected) setSelected(selectedFilter);

  const onSelect = useCallback(
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
        renderItem={({ item }: ListRenderItemInfo<String>) => <Category title={item} selected={!!(selected === item)} onSelect={onSelect} />}
        keyExtractor={(item: string) => item}
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
    fontWeight: "600",
  },
});
