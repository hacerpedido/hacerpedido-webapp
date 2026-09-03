// @ts-nocheck
import React from "react";
import styles from "./Input.module.css";

const Input = React.forwardRef((props, ref) => {
  const {
    label,
    error,
    multiline,
    numberOfLines,
    numberOfLies,
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
  void numberOfLies;
  const reactId = React.useId();
  const inputId = inputProps.id ?? reactId;
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
  const controlClassName =
    `${styles.input} ${error ? styles.inputError : ""} ${className || ""}`.trim();
  const controlProps = {
    ...inputProps,
    ref,
    id: inputProps.id ?? inputId,
    value,
    className: controlClassName,
    autoCapitalize: props.autoCapitalize || "none",
    "data-testid": testID,
    autoComplete: autoCompleteType || inputProps.autoComplete,
    inputMode: keyboardType === "phone-pad" ? "tel" : inputProps.inputMode,
    "aria-invalid": error ? "true" : undefined,
    onChange: handleChange,
    onKeyDown: handleKeyDown,
    style: placeholderTextColor
      ? { "--placeholder-color": placeholderTextColor }
      : undefined,
    ...(multiline ? { rows: numberOfLines } : {}),
  };
  const control = multiline ? (
    <textarea {...controlProps} />
  ) : (
    <input {...controlProps} />
  );

  return (
    <div className={styles.container}>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          <span className={styles.labelText}>{label}</span>
          {control}
        </label>
      ) : (
        control
      )}
      {error && <span className={styles.textError}>{error.message}</span>}
    </div>
  );
});

export default Input;
