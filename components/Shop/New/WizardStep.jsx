import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Text } from "react-native";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import WizardRadio from "./WizardRadio";

import { setField } from "lib/reducers/newShopSlice";

export default function WizardStep({ name, label, input, options, previous, next }) {
  const initialValue = useSelector((state) => state.newShop[name]);
  const [value, setValue] = useState(initialValue);
  const dispatch = useDispatch();
  const { register, handleSubmit, errors, trigger } = useForm({ mode: "all" });
  // Validate as soon as we show the form
  useEffect(() => {
    trigger();
  }, [trigger]);

  const onSubmit = (data) => {
    dispatch(setField({ field: name, data: data[name] }));
    next();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>
        <Text>{label}</Text>
        {input}
      </label>

      <br />

      {options ? (
        <WizardRadio
          name={name}
          options={options}
          checked={value}
          handleChange={(e) => setValue(e.target.value)}
          validation={register({ required: "required" })}
        />
      ) : (
        <input
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          ref={register({ required: "required" })}
        />
      )}

      {!errors[name] && <input type="submit" value="Aceptar" />}

      <br />

      <button onClick={previous}>
        <Text>Volver</Text>
      </button>
    </form>
  );
}
