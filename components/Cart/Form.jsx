import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { WhatsappFill as WhatsappFillIcon } from "../../assets/icons";
import { useCart } from "../../lib/context/CartContext";
import Input from "../Input";
import Switch from "../Switch";
import styles from "./Form.module.css";

const Form = ({ onSubmit }) => {
  const { state, dispatch } = useCart();
  const shop = state.shop;
  const { name } = shop;
  const [takeaway, setTakeaway] = useState(false);

  const { handleSubmit, errors, control } = useForm({ mode: "onSubmit" });

  const onNameChange = (value) =>
    dispatch({ type: "SET_NAME", payload: value });
  const onAddressChange = (value) =>
    dispatch({ type: "SET_ADDRESS", payload: value });
  const onNotesChange = (value) =>
    dispatch({ type: "SET_NOTES", payload: value });

  const toggleTakeAway = () => {
    const value = !takeaway;
    setTakeaway(value);
  };

  // const animatedProps = useSpring({
  //   opacity: !takeaway ? 1 : 0,
  //   maxHeight: !takeaway ? 100 : 0,
  // })

  return (
    <form className={styles.container} onSubmit={handleSubmit(onSubmit)}>
      <Switch toggle={toggleTakeAway} value={takeaway} />

      <Controller
        as={Input}
        autoCompleteType="name"
        autoFocus
        control={control}
        defaultValue={state.name ?? ""}
        error={errors.name}
        label="Tu Nombre"
        maxLength={50}
        name="name"
        onChangeText={onNameChange}
        placeholder="¿Cómo te llamás?"
        rules={{
          required: {
            value: true,
            message: "Necesitamos tu nombre",
          },
        }}
        testID="customer-name"
      />

      {/* <AnimatedView style={animatedProps}> */}
      {takeaway || (
        <Controller
          as={Input}
          autoCompleteType="street-address"
          control={control}
          defaultValue={state.address ?? ""}
          error={errors.address}
          label="Tu Dirección"
          maxLength={50}
          name="address"
          onChangeText={onAddressChange}
          placeholder="¿A dónde lo mandamos?"
          rules={{
            required: {
              value: true,
              message: "Necesitamos tu dirección",
            },
          }}
          testID="customer-address"
        />
      )}
      {/* </AnimatedView> */}

      <Controller
        as={Input}
        control={control}
        defaultValue={state.notes ?? ""}
        label="Notas"
        maxLength={500}
        multiline
        name="notes"
        numberOfLines={2}
        onChangeText={onNotesChange}
        placeholder="¿Querés hacer alguna aclaración?"
        testID="order-notes"
      />

      <p className={styles.notes}>
        Por favor,
        <strong> confirmá el precio final </strong>
        con el comercio. No somos responsables de modificaciones en el menú.
      </p>

      <button
        aria-label="Submit WhatsApp order"
        className={`${styles.button} ${styles.buttonWhatsApp} bounza`}
        data-testid="submit-whatsapp-order"
        type="submit"
      >
        <span className={styles.textContainer}>
          <span className={styles.icon}>
            <WhatsappFillIcon color="#ffffff" />
          </span>
          <span className={styles.buttonText}> Pedir a {name} </span>
        </span>
      </button>
    </form>
  );
};

export default Form;
