import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import ReactDataSheet from "react-datasheet";
import "react-datasheet/lib/react-datasheet.css";

import theme from "../../assets/theme";

export default ({ shop, products }) => {
  let grid = products.map((p) => [
    { value: p.name },
    { value: p.description },
    { value: p.price },
  ]);

  //   console.log(grid);

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Tu menú o listado de precios</Text>
      <ScrollView style={styles.formContainer}>
        <ReactDataSheet
          data={grid}
          valueRenderer={(cell) => cell.value}
          // onCellsChanged={changes => {
          //   const grid = this.state.grid.map(row => [...row])
          //   changes.forEach(({cell, row, col, value}) => {
          //     grid[row][col] = {...grid[row][col], value}
          //   })
          //   this.setState({grid})
          // }}
        />
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
