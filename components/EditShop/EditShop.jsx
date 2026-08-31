import React, { useState } from "react";
import { Controller } from "react-hook-form";
import TimeAgo from "react-timeago";
import spanishStrings from "react-timeago/lib/language-strings/es";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import Modal from "react-bootstrap/Modal";

import Input from "../ShopInput";
import { validatePhoneNumber } from "../../lib/utils/utils";
import UploadImage from "./UploadImage";
import styles from "./EditShop.module.css";

const formatter = buildFormatter(spanishStrings);

export default function EditShop({ shop, control, errors, handleSubmit, getValues, isSaving, refresh }) {
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
      <Modal show={show} onHide={handleClose}>
        <UploadImage shopID={shop.id} imageType={imageType} handleClose={handleClose} />
      </Modal>

      <section className={styles.container}>
        <header className={styles.titleContainer}>
          <div className={styles.titleTextContainer}>
            <h1 className={styles.title}>Datos de tu Comercio</h1>
            <p className={styles.updatedAt}>
              <span>Actualizado </span>
              <TimeAgo date={shop.updated_at} formatter={formatter} minPeriod={60} />
            </p>
          </div>
          <div className={styles.buttonsContainer}>
            <button className={styles.uploadImageButton} onClick={() => handleShow("logo")} disabled={isSaving} type="button">
              Editar logo
            </button>
            <button className={styles.uploadImageButton} onClick={() => handleShow("background")} disabled={isSaving} type="button">
              Editar portada
            </button>
            <button
              className={`${styles.saveButton} ${isSaving ? styles.saveButtonSaving : ""}`}
              onClick={handleSubmit}
              disabled={isSaving}
              data-testid="save-shop"
              type="button"
            >
              <span className={styles.buttonText}>Guardar</span>
              {isSaving && <span aria-label="Guardando" className={styles.spinner} role="status" />}
            </button>
          </div>
        </header>
        <div className={styles.formContainer}>
          <div className={styles.formColumnLeft}>
              <Controller
                as={Input}
                control={control}
                name="name"
                label="Nombre del Comercio:"
                defaultValue={shop.name}
                testID="edit-shop-name"
                rules={{
                  required: {
                    value: true,
                    message: "El nombre del comercio es requerido.",
                  },
                }}
                error={errors.name}
                maxLength={50}
              />
              <Controller
                as={Input}
                control={control}
                name="address"
                label="Dirección:"
                defaultValue={shop.address}
                testID="edit-shop-address"
                error={errors.address}
                maxLength={50}
              />
              <Controller
                as={Input}
                control={control}
                name="opentimes"
                label="Horario:"
                defaultValue={shop.opentimes}
                testID="edit-shop-opentimes"
                error={errors.opentimes}
                maxLength={50}
              />
              <Controller
                as={Input}
                control={control}
                name="deliverycost"
                label="Costo del Delivery:"
                defaultValue={shop.deliverycost}
                testID="edit-shop-deliverycost"
                error={errors.deliverycost}
                maxLength={50}
              />
          </div>
          <div className={styles.formColumnRight}>
              <Controller
                as={Input}
                control={control}
                name="orderswhatsappnumber"
                label="WhatsApp del comercio:"
                defaultValue={shop.orderswhatsappnumber}
                error={errors.orderswhatsappnumber}
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
                maxLength={20}
                placeholder={"Escribilo así: +5492234470974"}
                pattern={"\\+?[0-9]*"}
                keyboardType={"phone-pad"}
                onChange={([e]) => {
                  let value = e.target.value ?? "";
                  return value.replace(/[^0-9+]/g, "");
                }}
              />
              <Controller
                as={Input}
                control={control}
                name="ordersphonenumber"
                label="Teléfono Fijo:"
                defaultValue={shop.ordersphonenumber}
                error={errors.ordersphonenumber}
                maxLength={20}
                placeholder={"Escribilo así: +5492234470974"}
                pattern={"\\+?[0-9]*"}
                keyboardType={"phone-pad"}
                onChange={([e]) => {
                  let value = e.target.value ?? "";
                  return value.replace(/[^0-9+]/g, "");
                }}
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
                        (orderswhatsappnumber != null && orderswhatsappnumber !== "") ||
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
                placeholder={"¿Querés hacer alguna aclaración?"}
                name="notes"
                multiline
                numberOfLines={3.5}
                label="Notas:"
                defaultValue={shop.notes}
                error={errors.notes}
                maxLength={1000}
              />
          </div>
        </div>
      </section>
    </>
  );
}
