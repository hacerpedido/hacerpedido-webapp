import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import ReactDataSheet from "react-datasheet";
import "react-datasheet/lib/react-datasheet.css";

import theme from "assets/theme";
import { extractSections } from "utils/products";

export default ({ shop, products }) => {
  //   console.log(grid);

  let sections = extractSections(products);
  let grid = sections.map((section) =>
    section.products.map((product) => [
      { value: product.name },
      { value: product.description },
      { value: product.price },
    ])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Tu menú o listado de precios</Text>
      <ScrollView style={styles.formContainer}>
        {sections.map((section, i) => (
          <View key={i}>
            <Text>{section.category}</Text>
            <ReactDataSheet
              data={grid[i]}
              valueRenderer={(cell) => cell.value}
              // onCellsChanged={changes => {
              //   const grid = this.state.grid.map(row => [...row])
              //   changes.forEach(({cell, row, col, value}) => {
              //     grid[row][col] = {...grid[row][col], value}
              //   })
              //   this.setState({grid})
              // }}
            />
          </View>
        ))}

        {/*  */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.lightBackground,
    flex: 1,
  },
  formContainer: {
    backgroundColor: theme.colors.white,
    flex: 1,
    width: "100%",
  },
  title: {
    ...theme.text.title,
    marginVertical: 10,
  },
});
