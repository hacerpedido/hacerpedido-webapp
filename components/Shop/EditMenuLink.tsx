// @ts-nocheck
import styles from "./EditMenuLink.module.css";

const EditMenuLink = ({ shop }) => {
  if (!shop?.typeformtoken) {
    return null;
  }

  return (
    <a
      aria-label="Editar menú"
      className={styles.container}
      href={`/${shop.typeformtoken}/edit`}
    >
      Editar menú
    </a>
  );
};

export default EditMenuLink;
