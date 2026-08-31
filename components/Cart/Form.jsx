/* eslint-disable react-native/no-raw-text */
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Controller, useForm } from "react-hook-form";

import Switch from "../Switch";
import Input from "../Input";
import { WhatsappFill as WhatsappFillIcon } from "../../assets/icons";
import styles from "./Form.module.css";

const Form = ({ onSubmit }) => {
  const shop = useSelector((state) => state.shop.shop);
  const { name } = shop;
  const [takeaway, setTakeaway] = useState(false);

  const { handleSubmit, errors, control } = useForm({ mode: "onBlur" });

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
        control={control}
        autofocus
        name="name"
        label="Tu Nombre"
        autoCompleteType="name"
        placeholder="¿Cómo te llamás?"
        testID="customer-name"
        defaultValue={""}
        rules={{
          required: {
            value: true,
            message: "Necesitamos tu nombre",
          },
        }}
        error={errors.name}
        maxLength={50}
      />

      {/* <AnimatedView style={animatedProps}> */}
      {takeaway || (
        <Controller
          as={Input}
          control={control}
          name="address"
          label="Tu Dirección"
          autoCompleteType="street-address"
          placeholder="¿A dónde lo mandamos?"
          testID="customer-address"
          defaultValue={""}
          rules={{
            required: {
              value: true,
              message: "Necesitamos tu dirección",
            },
          }}
          error={errors.address}
          maxLength={50}
        />
      )}
      {/* </AnimatedView> */}

      <Controller
        as={Input}
        control={control}
        name="notes"
        label="Notas"
        placeholder="¿Querés hacer alguna aclaración?"
        testID="order-notes"
        defaultValue={""}
        multiline
        numberOfLines={2}
        maxLength={500}
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
