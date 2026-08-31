import React from "react";
import styles from "./ShopInput.module.css";

const ShopInput = React.forwardRef((props, ref) => {
  const {
    label,
    error,
    multiline,
    numberOfLines,
    testID,
    autoCompleteType,
    keyboardType,
    placeholderTextColor,
    onChange,
    onChangeText,
    onSubmitEditing,
    blurOnSubmit,
    onKeyDown,
    className,
    value,
    ...inputProps
  } = props;
  const handleChange = (event) => {
    if (onChange) onChange(event);
    if (onChangeText) onChangeText(event.target.value);
  };
  const handleKeyDown = (event) => {
    const isComposing = event.isComposing || event.keyCode === 229;
    const shouldSubmit =
      event.key === "Enter" &&
      !event.shiftKey &&
      !isComposing &&
      (blurOnSubmit === true || !multiline);

    if (shouldSubmit) {
      event.preventDefault();
      if (onSubmitEditing) onSubmitEditing(event);
      if (blurOnSubmit === true || (!multiline && blurOnSubmit !== false)) {
        event.currentTarget.blur();
      }
    }
    if (onKeyDown) onKeyDown(event);
  };
  const heightClassName = numberOfLines === 2 ? styles.inputLines2 : numberOfLines === 3.5 ? styles.inputLines3_5 : "";
  const controlClassName = `${styles.input} ${error ? styles.inputError : ""} ${heightClassName} ${className || ""}`.trim();
  const controlProps = {
    ...inputProps,
    ref,
    value: value || "",
    className: controlClassName,
    autoCapitalize: props.autoCapitalize || "none",
    "data-testid": testID,
    autoComplete: autoCompleteType || inputProps.autoComplete,
    inputMode: keyboardType === "phone-pad" ? "tel" : inputProps.inputMode,
    "aria-invalid": error ? "true" : undefined,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    style: placeholderTextColor ? { "--placeholder-color": placeholderTextColor } : undefined,
    ...(numberOfLines ? { rows: Math.ceil(numberOfLines) } : {}),
  };
  const control = multiline ? <textarea {...controlProps} /> : <input {...controlProps} />;

  return (
    <div className={styles.container}>
      {label ? <label className={styles.label}><span className={styles.labelText}>{label}</span>{control}</label> : control}
      {error && <span className={styles.textError}>{error.message}</span>}
    </div>
  );
});

export default ShopInput;
