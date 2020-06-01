import React, { useState } from "react";
// import { useDispatch } from "react-redux";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import ReactDataSheet from "react-datasheet";
import "react-datasheet/lib/react-datasheet.css";

import theme from "assets/theme";

export default ({ shopId, sections }) => {
  // const dispatch = useDispatch();
  const [editedSections, setEditedSections] = useState({});

  let tempSections = sections;
  for (var index in editedSections) {
    tempSections[index].category = editedSections[index];
  }

  let grid = tempSections.map((section) =>
    section.products.map((product) => [
      { value: product.name },
      { value: product.description },
      { value: product.price },
    ])
  );

  const handleOnChange = (evt) => {
    let index = parseInt(evt.target.name.replace("category-", ""));
    editedSections[index] = evt.target.value;
    setEditedSections(JSON.parse(JSON.stringify(editedSections))); // Reemplazar por reducer
  };

  //  console.log("FC:" + JSON.stringify(tempSections[0].category, null, 2));

  return (
    <View style={styles.container}>
      <Text style={styles.title}> Tu menú o listado de precios</Text>
      <ScrollView style={styles.formContainer}>
        {tempSections.map((section, i) => (
          <View key={i} style={styles.grid}>
            <TextInput
              type="text"
              name={`category-${i}`}
              value={section.category}
              onChange={handleOnChange}
              style={styles.category}
            />
            <ReactDataSheet
              data={grid[i]}
              style={styles.grid}
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  category: {
    ...theme.text.title,
    fontSize: 18,
    marginVertical: 5,
    paddingLeft: 5,
  },
  container: {
    backgroundColor: theme.colors.lightBackground,
    flex: 1,
  },
  formContainer: {
    backgroundColor: theme.colors.white,
    flex: 1,
    width: "100%",
  },
  grid: {},
  title: {
    ...theme.text.title,
    marginVertical: 10,
  },
});
