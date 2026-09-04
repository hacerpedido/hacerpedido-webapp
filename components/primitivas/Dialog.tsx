import type { ReactElement, ReactNode } from "react";
import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
} from "react";
import styles from "./Dialog.module.css";

type DialogSlotProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

const DialogTitle = ({ children, className, id }: DialogSlotProps) => {
  const composedClassName = `${styles.title} ${className ?? ""}`.trim();
  return (
    <h2 className={composedClassName} id={id}>
      {children}
    </h2>
  );
};

const DialogDescription = ({ children, className, id }: DialogSlotProps) => {
  const composedClassName = `${styles.description} ${className ?? ""}`.trim();
  return (
    <p className={composedClassName} id={id}>
      {children}
    </p>
  );
};

const DialogBody = ({ children, className }: DialogSlotProps) => {
  const composedClassName = `${styles.body} ${className ?? ""}`.trim();
  return <div className={composedClassName}>{children}</div>;
};

const DialogFooter = ({ children, className }: DialogSlotProps) => {
  const composedClassName = `${styles.footer} ${className ?? ""}`.trim();
  return <footer className={composedClassName}>{children}</footer>;
};

type DialogProps = {
  open: boolean;
  onClose?: () => void;
  titleId?: string;
  descriptionId?: string;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
  closeLabel?: string;
  hideCloseButton?: boolean;
};

const DialogRoot = function Dialog(props: DialogProps) {
  const {
    open,
    onClose,
    titleId,
    descriptionId,
    ariaLabel,
    className,
    children,
    closeLabel = "Cerrar",
    hideCloseButton = false,
  } = props;

  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const generatedId = useId();
  const fallbackTitleId = `${generatedId}-title`;
  const resolvedTitleId = titleId ?? fallbackTitleId;

  useEffect(() => {
    const element = dialogRef.current;
    if (!element) {
      return;
    }
    if (open && !element.open) {
      if (typeof element.showModal === "function") {
        element.showModal();
      } else {
        element.setAttribute("open", "");
      }
    } else if (!open && element.open) {
      if (typeof element.close === "function") {
        element.close();
      } else {
        element.removeAttribute("open");
      }
    }
  }, [open]);

  useEffect(() => {
    const element = dialogRef.current;
    if (!element || !onClose) {
      return;
    }
    const handleClose = () => onClose();
    element.addEventListener("close", handleClose);
    return () => {
      element.removeEventListener("close", handleClose);
    };
  }, [onClose]);

  let titleNode: ReactNode = null;
  let descriptionNode: ReactNode = null;
  let bodyNode: ReactNode = null;
  let footerNode: ReactNode = null;

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) {
      bodyNode = child;
      return;
    }
    const elementType = child.type;
    if (elementType === DialogTitle) {
      titleNode = child;
      return;
    }
    if (elementType === DialogDescription) {
      descriptionNode = child;
      return;
    }
    if (elementType === DialogBody) {
      bodyNode = child;
      return;
    }
    if (elementType === DialogFooter) {
      footerNode = child;
      return;
    }
    bodyNode = child;
  });

  const titleElement: ReactNode = titleNode
    ? cloneElement(titleNode as ReactElement<DialogSlotProps>, {
        id:
          (titleNode as ReactElement<DialogSlotProps>).props.id ??
          resolvedTitleId,
      })
    : null;

  const ariaProps: {
    "aria-modal"?: "true";
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
  } = {};

  if (open) {
    ariaProps["aria-modal"] = "true";
  }
  if (ariaLabel) {
    ariaProps["aria-label"] = ariaLabel;
  } else {
    ariaProps["aria-labelledby"] = resolvedTitleId;
  }
  if (descriptionId) {
    ariaProps["aria-describedby"] = descriptionId;
  }

  const dialogClassName = `${styles.dialog} ${className ?? ""}`.trim();

  return (
    <dialog {...ariaProps} className={dialogClassName} ref={dialogRef}>
      <header className={styles.header}>
        {titleElement ?? (
          <h2 className={styles.visuallyHidden} id={resolvedTitleId}>
            {ariaLabel ?? "Diálogo"}
          </h2>
        )}
        {!hideCloseButton && (
          <button
            aria-label={closeLabel}
            className={styles.closeButton}
            onClick={() => {
              const element = dialogRef.current;
              if (!element) {
                return;
              }
              if (typeof element.close === "function") {
                // Real browsers fire the native `close` event afterwards, which
                // reaches the listener registered above and calls onClose.
                element.close();
              } else {
                // jsdom 26 does not implement HTMLDialogElement.close(); emulate
                // the close path manually so tests and SSR-style runs work.
                element.removeAttribute("open");
                onClose?.();
              }
            }}
            type="button"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}
      </header>
      {descriptionNode}
      {bodyNode}
      {footerNode}
    </dialog>
  );
};

const Dialog = Object.assign(DialogRoot, {
  Title: DialogTitle,
  Description: DialogDescription,
  Body: DialogBody,
  Footer: DialogFooter,
});

export default Dialog;
