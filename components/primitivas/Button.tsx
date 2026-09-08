import type { ButtonHTMLAttributes } from "react";
import { forwardRef } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "danger";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const {
      variant = "primary",
      type = "button",
      className,
      children,
      ...rest
    } = props;
    const composedClassName = [styles.button, styles[variant], className]
      .filter(Boolean)
      .join(" ");
    return (
      <button {...rest} className={composedClassName} ref={ref} type={type}>
        {children}
      </button>
    );
  },
);

export default Button;
