// @ts-nocheck
import Dialog from "#components/primitivas/Dialog";
import { validatePhoneNumber } from "#lib/utils/utils";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Controller } from "react-hook-form";
import TimeAgo from "react-timeago";
import buildFormatter from "react-timeago/lib/formatters/buildFormatter";
import spanishStrings from "react-timeago/lib/language-strings/es";
import Input from "../ShopInput";
import styles from "./EditShop.module.css";
import UploadImage from "./UploadImage";

const formatter = buildFormatter(spanishStrings);

function getValidUpdatedAtTimestamp(updatedAt) {
  if (updatedAt === null || updatedAt === undefined) {
    return null;
  }

  const timestamp =
    updatedAt instanceof Date
      ? updatedAt.getTime()
      : typeof updatedAt === "string" || typeof updatedAt === "number"
        ? new Date(updatedAt).getTime()
        : Number.NaN;

  return Number.isFinite(timestamp) ? timestamp : null;
}

function SaveButton({ isSaving, onClick }) {
  const { pending } = useFormStatus();
  const saving = pending || isSaving;
  return (
    <button
      aria-busy={saving}
      className={`${styles.saveButton} ${saving ? styles.saveButtonSaving : ""}`}
      data-testid="save-shop"
      disabled={saving}
      onClick={onClick}
      type="submit"
    >
      <span className={styles.buttonText}>Guardar</span>
      {saving && (
        <span aria-label="Guardando" className={styles.spinner} role="status" />
      )}
    </button>
  );
}

export default function EditShop({
  shop,
  control,
  errors,
  handleSubmit: _handleSubmit,
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
  const updatedAtTimestamp = getValidUpdatedAtTimestamp(shop.updated_at);

  return (
    <>
      <Dialog onClose={handleClose} open={show}>
        <UploadImage
          handleClose={handleClose}
          imageType={imageType}
          shopID={shop.id}
        />
      </Dialog>

      <section className={styles.container}>
        <header className={styles.titleContainer}>
          <div className={styles.titleTextContainer}>
            <h1 className={styles.title}>Datos de tu Comercio</h1>
            {updatedAtTimestamp !== null && (
              <p className={styles.updatedAt}>
                <span>Actualizado </span>
                <TimeAgo
                  date={updatedAtTimestamp}
                  formatter={formatter}
                  minPeriod={60}
                />
              </p>
            )}
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
              control={control}
              defaultValue={shop.name}
              name="name"
              render={({ field }) => (
                <Input
                  {...field}
                  autoCompleteType="off"
                  error={errors.name}
                  label="Nombre del Comercio:"
                  maxLength={50}
                  testID="edit-shop-name"
                />
              )}
              rules={{
                required: {
                  value: true,
                  message: "El nombre del comercio es requerido.",
                },
              }}
            />
            <Controller
              control={control}
              defaultValue={shop.address}
              name="address"
              render={({ field }) => (
                <Input
                  {...field}
                  autoCompleteType="off"
                  error={errors.address}
                  label="Dirección:"
                  maxLength={50}
                  testID="edit-shop-address"
                />
              )}
            />
            <Controller
              control={control}
              defaultValue={shop.opentimes}
              name="opentimes"
              render={({ field }) => (
                <Input
                  {...field}
                  autoCompleteType="off"
                  error={errors.opentimes}
                  label="Horario:"
                  maxLength={50}
                  testID="edit-shop-opentimes"
                />
              )}
            />
            <Controller
              control={control}
              defaultValue={shop.deliverycost}
              name="deliverycost"
              render={({ field }) => (
                <Input
                  {...field}
                  autoCompleteType="off"
                  error={errors.deliverycost}
                  label="Costo del Delivery:"
                  maxLength={50}
                  testID="edit-shop-deliverycost"
                />
              )}
            />
          </div>
          <div className={styles.formColumnRight}>
            <Controller
              control={control}
              defaultValue={shop.orderswhatsappnumber}
              name="orderswhatsappnumber"
              render={({ field }) => (
                <Input
                  {...field}
                  autoCompleteType="off"
                  error={errors.orderswhatsappnumber}
                  keyboardType="phone-pad"
                  label="WhatsApp del comercio:"
                  maxLength={20}
                  placeholder="Escribilo así: +5492234470974"
                  testID="edit-shop-whatsapp"
                />
              )}
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
              control={control}
              defaultValue={shop.ordersphonenumber}
              name="ordersphonenumber"
              render={({ field }) => (
                <Input
                  {...field}
                  autoCompleteType="off"
                  error={errors.ordersphonenumber}
                  keyboardType="phone-pad"
                  label="Teléfono Fijo:"
                  maxLength={20}
                  placeholder="Escribilo así: +5492234470974"
                  testID="edit-shop-phone"
                />
              )}
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
              control={control}
              defaultValue={shop.notes}
              name="notes"
              render={({ field }) => (
                <Input
                  {...field}
                  error={errors.notes}
                  label="Notas:"
                  maxLength={1000}
                  multiline
                  numberOfLines={3.5}
                  placeholder="¿Querés hacer alguna aclaración?"
                />
              )}
            />
          </div>
        </div>
      </section>
    </>
  );
}
