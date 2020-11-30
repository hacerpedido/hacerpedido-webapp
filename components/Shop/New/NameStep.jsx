import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Text } from "react-native";
import { useDispatch } from "react-redux";

import { setName } from "lib/reducers/newShopSlice";

const NameStep = ({ previous, next }) => {
  const dispatch = useDispatch();
  const { register, handleSubmit, errors, trigger } = useForm({
    defaultValues: {},
    mode: "all",
  });

  const onSubmit = (data) => {
    dispatch(setName(data.name));
    next();
  };

  useEffect(() => {
    trigger();
  }, [trigger]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>
        <Text>¿Cómo es tu nombre? *</Text>
        <input name="name" ref={register({ required: "required" })} />
      </label>

      <br />

      <button onClick={previous}> Volver </button>
      {!errors.name && <input type="submit" value="Aceptar" />}
    </form>
  );
};

export default NameStep;
