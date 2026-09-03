// @ts-nocheck
import { WhatsappFill as WhatsappFillIcon } from "#assets/icons";
import { useCart } from "#lib/context/CartContext";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { Controller, useForm } from "react-hook-form";
import Input from "../Input";
import Switch from "../Switch";
import styles from "./Form.module.css";

const Form = ({ onSubmit }) => {
  const { state, dispatch } = useCart();
  const shop = state.shop;
  const { name } = shop;
  const [takeaway, setTakeaway] = useState(false);
  const submitLock = useRef(false);
  const [isTransitionPending, startSubmitTransition] = useTransition();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ mode: "onSubmit" });
  const [, formAction, isSubmitting] = useActionState(
    async (_state, formData) => {
      await onSubmit(Object.fromEntries(formData.entries()));
      return null;
    },
    null,
  );

  useEffect(() => {
    if (!isSubmitting) submitLock.current = false;
  }, [isSubmitting]);

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
    <form
      action={formAction}
      className={styles.container}
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        if (submitLock.current || isSubmitting || isTransitionPending) return;

        handleSubmit(() => {
          if (submitLock.current) return;
          submitLock.current = true;
          startSubmitTransition(() => formAction(new FormData(form)));
        })(event);
      }}
    >
      <Switch toggle={toggleTakeAway} value={takeaway} />

      <Controller
        control={control}
        defaultValue={state.name ?? ""}
        name="name"
        render={({ field }) => (
          <Input
            {...field}
            autoCompleteType="name"
            autoFocus
            error={errors.name}
            label="Tu Nombre"
            maxLength={50}
            onChangeText={onNameChange}
            placeholder="¿Cómo te llamás?"
            testID="customer-name"
          />
        )}
        rules={{
          required: {
            value: true,
            message: "Necesitamos tu nombre",
          },
        }}
      />

      {/* <AnimatedView style={animatedProps}> */}
      {takeaway || (
        <Controller
          control={control}
          defaultValue={state.address ?? ""}
          name="address"
          render={({ field }) => (
            <Input
              {...field}
              autoCompleteType="street-address"
              error={errors.address}
              label="Tu Dirección"
              maxLength={50}
              onChangeText={onAddressChange}
              placeholder="¿A dónde lo mandamos?"
              testID="customer-address"
            />
          )}
          rules={{
            required: {
              value: true,
              message: "Necesitamos tu dirección",
            },
          }}
        />
      )}
      {/* </AnimatedView> */}

      <Controller
        control={control}
        defaultValue={state.notes ?? ""}
        name="notes"
        render={({ field }) => (
          <Input
            {...field}
            error={errors.notes}
            label="Notas"
            maxLength={500}
            multiline
            numberOfLines={2}
            onChangeText={onNotesChange}
            placeholder="¿Querés hacer alguna aclaración?"
            testID="order-notes"
          />
        )}
      />

      <p className={styles.notes}>
        Por favor,
        <strong> confirmá el precio final </strong>
        con el comercio. No somos responsables de modificaciones en el menú.
      </p>

      <SubmitOrderButton
        isSubmitting={isSubmitting || isTransitionPending}
        name={name}
      />
    </form>
  );
};

const SubmitOrderButton = ({ isSubmitting, name }) => {
  return (
    <button
      aria-busy={isSubmitting}
      aria-label="Submit WhatsApp order"
      className={`${styles.button} ${styles.buttonWhatsApp} bounza`}
      data-testid="submit-whatsapp-order"
      disabled={isSubmitting}
      type="submit"
    >
      <span className={styles.textContainer}>
        <span className={styles.icon}>
          <WhatsappFillIcon color="#ffffff" />
        </span>
        <span className={styles.buttonText}> Pedir a {name} </span>
      </span>
    </button>
  );
};

export default Form;
