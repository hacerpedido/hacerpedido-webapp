import * as React from "react";

export default function Form({
  register,
  errors,
  setValue,
  validation,
  children,
}) {
  const Inputs = React.useRef([]);

  return (
    <>
      {(Array.isArray(children) ? [...children] : [children]).map(
        (child, i) => {
          return child.props.name
            ? React.createElement(child.type, {
                ...{
                  ...child.props,
                  ref: (e) => {
                    register(
                      { name: child.props.name },
                      validation[child.props.name]
                    );
                    Inputs.current[i] = e;
                  },
                  onChangeText: (v) => setValue(child.props.name, v, true),
                  onSubmitEditing: () => {
                    Inputs.current[i + 1]
                      ? Inputs.current[i + 1].focus()
                      : Inputs.current[i].blur();
                  },
                  //onBlur: () => trigger(child.props.name),
                  blurOnSubmit: false,
                  fgf: child.props.name,
                  error: errors[child.props.name],
                },
              })
            : child;
        }
      )}
    </>
  );
}
