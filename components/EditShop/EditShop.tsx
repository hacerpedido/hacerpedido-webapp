// @ts-nocheck
import { validatePhoneNumber } from "#lib/utils/utils";

import React, { useState } from "react";
import Modal from "react-bootstrap/Modal";
import { useFormStatus } from "react-dom";
import { Controller } from "react-hook-form";
import TimeAgo from "react-timeago";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import spanishStrings from "react-timeago/lib/language-strings/es";
import Input from "../ShopInput";
import styles from "./EditShop.module.css";
import UploadImage from "./UploadImage";

const formatter = buildFormatter(spanishStrings);

function SaveButton({ isSaving, onClick }) {
  const { pending } = useFormStatus();
  return (
    <button
      className={`${styles.saveButton} ${pending ? styles.saveButtonSaving : ""}`}
      data-testid="save-shop"
      disabled={pending || isSaving}
      onClick={onClick}
      type="submit"
    >
      <span className={styles.buttonText}>Guardar</span>
      {pending && (
        <span aria-label="Guardando" className={styles.spinner} role="status" />
      )}
    </button>
  );
}

export default function EditShop({
  shop,
  control,
  errors,
  handleSubmit,
  getValues,
  isSaving,
  refresh,
  onSave,
}) {
  const [imageType, setImageType] = useState(undefined);

  const handleClose = (options = {}) => {
    setImageType(undefined);
    if (options.forceRefresh) {
      refresh();
    }
  };
  const handleShow = (type) => setImageType(type);

  const show = typeof imageType !== "undefined";

  return (
    <>
      <Modal onHide={handleClose} show={show}>
        <UploadImage
          handleClose={handleClose}
          imageType={imageType}
          shopID={shop.id}
        />
      </Modal>

      <section className={styles.container}>
        <header className={styles.titleContainer}>
          <div className={styles.titleTextContainer}>
            <h1 className={styles.title}>Datos de tu Comercio</h1>
            <p className={styles.updatedAt}>
              <span>Actualizado </span>
              <TimeAgo
                date={shop.updated_at}
                formatter={formatter}
                minPeriod={60}
              />
            </p>
          </div>
          <div className={styles.buttonsContainer}>
            <button
              className={styles.uploadImageButton}
              disabled={isSaving}
              onClick={() => handleShow("logo")}
              type="button"
            >
              Editar logo
            </button>
            <button
              className={styles.uploadImageButton}
              disabled={isSaving}
              onClick={() => handleShow("background")}
              type="button"
            >
              Editar portada
            </button>
            <SaveButton isSaving={isSaving} onClick={onSave} />
          </div>
        </header>
        <div className={styles.formContainer}>
          <div className={styles.formColumnLeft}>
            <Controller
              as={Input}
              control={control}
              defaultValue={shop.name}
              error={errors.name}
              label="Nombre del Comercio:"
              maxLength={50}
              name="name"
              rules={{
                required: {
                  value: true,
                  message: "El nombre del comercio es requerido.",
                },
              }}
              testID="edit-shop-name"
            />
            <Controller
              as={Input}
              control={control}
              defaultValue={shop.address}
              error={errors.address}
              label="Dirección:"
              maxLength={50}
              name="address"
              testID="edit-shop-address"
            />
            <Controller
              as={Input}
              control={control}
              defaultValue={shop.opentimes}
              error={errors.opentimes}
              label="Horario:"
              maxLength={50}
              name="opentimes"
              testID="edit-shop-opentimes"
            />
            <Controller
              as={Input}
              control={control}
              defaultValue={shop.deliverycost}
              error={errors.deliverycost}
              label="Costo del Delivery:"
              maxLength={50}
              name="deliverycost"
              testID="edit-shop-deliverycost"
            />
          </div>
          <div className={styles.formColumnRight}>
            <Controller
              as={Input}
              control={control}
              defaultValue={shop.orderswhatsappnumber}
              error={errors.orderswhatsappnumber}
              keyboardType={"phone-pad"}
              label="WhatsApp del comercio:"
              maxLength={20}
              name="orderswhatsappnumber"
              onChange={([e]) => {
                const value = e.target.value ?? "";
                return value.replace(/[^0-9+]/g, "");
              }}
              pattern={"\\+?[0-9]*"}
              placeholder={"Escribilo así: +5492234470974"}
              rules={{
                validate: {
                  matchesAtLeastAPhone: (value) => {
                    if (value != null && value !== "") {
                      const phoneValidationResult = validatePhoneNumber(value);
                      if (typeof phoneValidationResult === "string") {
                        return phoneValidationResult;
                      }
                    }
                    const { ordersphonenumber } = getValues();
                    return (
                      (ordersphonenumber != null && ordersphonenumber !== "") ||
                      (value != null && value !== "") ||
                      "Al menos un número de teléfono debe ser ingresado."
                    );
                  },
                },
              }}
            />
            <Controller
              as={Input}
              control={control}
              defaultValue={shop.ordersphonenumber}
              error={errors.ordersphonenumber}
              keyboardType={"phone-pad"}
              label="Teléfono Fijo:"
              maxLength={20}
              name="ordersphonenumber"
              onChange={([e]) => {
                const value = e.target.value ?? "";
                return value.replace(/[^0-9+]/g, "");
              }}
              pattern={"\\+?[0-9]*"}
              placeholder={"Escribilo así: +5492234470974"}
              rules={{
                validate: {
                  matchesAtLeastAPhone: (value) => {
                    if (value != null && value !== "") {
                      const phoneValidationResult = validatePhoneNumber(value);
                      if (typeof phoneValidationResult === "string") {
                        return phoneValidationResult;
                      }
                    }
                    const { orderswhatsappnumber } = getValues();
                    return (
                      (orderswhatsappnumber != null &&
                        orderswhatsappnumber !== "") ||
                      (value != null && value !== "") ||
                      "Al menos un número de teléfono debe ser ingresado."
                    );
                  },
                },
              }}
            />
            <Controller
              as={Input}
              control={control}
              defaultValue={shop.notes}
              error={errors.notes}
              label="Notas:"
              maxLength={1000}
              multiline
              name="notes"
              numberOfLines={3.5}
              placeholder={"¿Querés hacer alguna aclaración?"}
            />
          </div>
        </div>
      </section>
    </>
  );
}
