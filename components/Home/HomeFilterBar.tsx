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

import { colors } from "@/lib/colors"
import { categories } from "@/lib/utils/categories"

type CategoryProps = {
  title: string
  isSelected: boolean
  onSelect: (id: string) => void
}

function Category({ title, isSelected, onSelect }: CategoryProps) {
  const wrapperStyle = [
    styles.item,
    { backgroundColor: isSelected ? colors.orangeHP : colors.white },
  ]
  const textStyle = [
    styles.title,
    { color: isSelected ? colors.white : colors.orangeHP },
  ]

  return (
    <TouchableHighlight
      underlayColor={colors.lightBackground}
      onPress={() => onSelect(title)}
      style={wrapperStyle}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableHighlight>
  )
}

type Props = {
  selected: string
  onSelect: (category: string) => void
}

const HomeFilterBar = ({ selected, onSelect }: Props) => {
  const handleRenderItem = ({ item }: ListRenderItemInfo<string>) => (
    <Category
      title={item}
      isSelected={!!(selected === item)}
      onSelect={onSelect}
    />
  )

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={handleRenderItem}
        keyExtractor={(item: string) => item}
        showsVerticalScrollIndicator={false}
        horizontal={true}
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
    fontWeight: "600",
  },
})

export default HomeFilterBar
