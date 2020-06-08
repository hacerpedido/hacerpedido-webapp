import React, {useState} from "react";
import {useDispatch} from "react-redux";
import {TouchableHighlight, StyleSheet, Text, View} from "react-native";
import {updateProductAmount} from "reducers/cartSlice";
import colors from "assets/colors";

export default ({product, show, handleShow}) => {
  const dispatch = useDispatch();
  const [amount, setAmount] = useState(0);

  const updateAmount = (amount) => {
    if (amount < 0) return false
    setAmount(amount)
    dispatch(updateProductAmount({product, amount}));
  }

  return (
    <View >
      {show ? (
        <View style={styles.container} >
          <TouchableHighlight
            underlayColor={"none"}
            onPress={() => updateAmount(amount - 1)}
          >
            <View style={styles.buttonQty}>
              <Text style={styles.buttonQtyText}>-</Text>
            </View>
          </TouchableHighlight>

          <Text style={styles.amountText}>{amount}</Text>

          <TouchableHighlight
            underlayColor={"none"}
            onPress={() => updateAmount(amount + 1)}
          >
            <View style={[styles.buttonQty, styles.buttonPlus]}>
              <Text style={[styles.buttonQtyText, styles.buttonPlusText]}>+</Text>
            </View>
          </TouchableHighlight>

          <View style={styles.lineBreak} />

          <TouchableHighlight underlayColor={"none"}>
            <View style={styles.buttonSubmit}>
              <Text style={styles.buttonSubmitText}>Agregar</Text>
            </View>
          </TouchableHighlight>

          <View style={styles.lineBreak} />

          <TouchableHighlight
            onPress={() => handleShow()}
            underlayColor={"none"}>
            <View style={styles.closeButton}>
              <Text style={styles.closeButtonText}>x</Text>
            </View>
          </TouchableHighlight>
        </View >
      ) : null}

    </View >
  );
};

const shadowColor = "rgba(0, 0, 0, 0.2)"

const styles = StyleSheet.create({
  amountText: {
    fontFamily: "Barlow",
    fontSize: 20,
    marginHorizontal: 17,
  },
  buttonPlus: {
    backgroundColor: colors.orangeHP,
  },
  buttonPlusText: {
    color: colors.white,
  },
  buttonQty: {
    alignItems: "center",
    borderColor: colors.gray4,
    borderRadius: "50%",
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    // marginHorizontal: 17,
    width: 28,
  },
  buttonQtyText: {
    color: colors.gray4,
    fontFamily: "Barlow",
    fontSize: 20,
    fontWeight: "600",
    paddingBottom: 2
  },
  buttonSubmit: {
    backgroundColor: colors.orangeHP,
    borderRadius: 3.4,
    marginBottom: 18.5,
    marginTop: 17
  },
  buttonSubmitText: {
    color: colors.white,
    fontFamily: "barlow",
    fontWeight: 600,
    lineHeight: 18,
    paddingBottom: 5.5,
    paddingHorizontal: 24,
    paddingTop: 4.5,
  },
  closeButton: {
    backgroundColor: "yellow",
    width: 10
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.lightGrey3,
    borderRadius: 5.6,
    borderWidth: 1,
    bottom: 0,
    flexDirection: "row",
    flexWrap: 'wrap',
    justifyContent: "center",
    paddingBo6tom: 18,
    paddingTop: 16,
    position: "absolute",
    right: 0,
    shadowColor: shadowColor,
    shadowOffset: {width: 1.14, height: 5.55},
    shadowRadius: 10,
    width: 135,
  },
  lineBreak: {width: "100%"},
});
