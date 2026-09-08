import styles from "./SiteFooter.module.css";

/** Small, shared footer for public pages and the app shell. */
export default function SiteFooter() {
  return (
    <footer className={styles.container}>
      <a
        className={styles.link}
        href="https://github.com/hacerpedido/hacerpedido-webapp"
        rel="noreferrer"
        target="_blank"
      >
        <span>Hecho con cariño</span>
        <span aria-hidden="true" className={styles.separator}>
          ·
        </span>
        <span>Código en GitHub</span>
        <span aria-hidden="true" className={styles.externalIcon}>
          ↗
        </span>
      </a>
    </footer>
  );
}
