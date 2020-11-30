import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

const NameStep = ({ previous, next }) => {
  const name = useSelector((state) => state.newShop.name);

  const { register, handleSubmit, errors, trigger } = useForm({
    defaultValues: {},
    mode: "all",
  });

  const onSubmit = (data) => {
    next();
  };

  useEffect(() => {
    trigger();
  }, [trigger]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label>
        {`Mucho gusto ${name}, ¿Cuál es el nombre de tu negocio? *`}
        <input name="shopName" ref={register({ required: "required" })} />
      </label>

      <br />

      <button onClick={previous}> Volver </button>
      {!errors.shopName && <input type="submit" value="Aceptar" />}
    </form>
  );
};

export default NameStep;
