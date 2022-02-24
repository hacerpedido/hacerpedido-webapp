import { useCallback, useState } from "react"
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableHighlight,
  View,
  ListRenderItemInfo,
  TextStyle,
  ViewStyle,
} from "react-native"

import colors from "../../assets/colors"
import { categories } from "../../lib/utils/categories"

type CategoryProps = {
  title: string
  selected: boolean
  onSelect: (id: string) => void
}

function Category({ title, selected, onSelect }: CategoryProps) {
  return (
    <TouchableHighlight
      underlayColor={colors.lightBackground}
      onPress={() => onSelect(title)}
      style={[
        styles.item,
        { backgroundColor: selected ? colors.orangeHP : colors.white },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: selected ? colors.white : colors.orangeHP },
        ]}
      >
        {title}
      </Text>
    </TouchableHighlight>
  )
}

type Props = {
  selectedFilter: string
  onSelectFilter: (id: number) => void
}

const HomeFilterBar = ({ selectedFilter, onSelectFilter }: Props) => {
  const [selected, setSelected] = useState("")

  if (!selected) setSelected(selectedFilter)

  const onSelect = useCallback(
    (id) => {
      setSelected(id)
      onSelectFilter(id)
    },
    [onSelectFilter]
  )

  return (
    <View style={styles.container}>
      <FlatList
        alwaysBounceHorizontal={true}
        showsVerticalScrollIndicator={false}
        horizontal={true}
        data={categories}
        renderItem={({ item }: ListRenderItemInfo<string>) => (
          <Category
            title={item}
            selected={!!(selected === item)}
            onSelect={onSelect}
          />
        )}
        keyExtractor={(item: string) => item}
        extraData={selected}
      />
    </View>
  )
}

type Styles = {
  container: ViewStyle
  item: ViewStyle
  title: TextStyle
}

const styles = StyleSheet.create<Styles>({
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
})

export default HomeFilterBar
