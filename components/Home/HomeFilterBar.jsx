import React from "react";

import { categories } from "../../lib/utils/categories";
import styles from "./HomeFilterBar.module.css";

function Item({ id, title, selected, onSelect }) {
  return (
    <li>
      <button
        aria-label={title}
        aria-pressed={selected}
        className={`${styles.item} ${selected ? styles.itemSelected : ""}`}
        data-testid={`category-${id}`}
        onClick={() => onSelect(id)}
        type="button"
      >
        <span className={`${styles.title} ${selected ? styles.titleSelected : ""}`}>{title}</span>
      </button>
    </li>
  );
}

const HomeFilterBar = ({ selectedFilter, onSelectFilter }) => {
  const [selected, setSelected] = React.useState(selectedFilter || "");

  const onSelect = React.useCallback(
    (id) => {
      setSelected(id);
      onSelectFilter(id);
    },
    [onSelectFilter]
  );

  return (
    <nav aria-label="Categorías" className={styles.container}>
      <ul className={styles.list}>
        {categories.map((item) => (
          <Item id={item} title={item} selected={selected === item} onSelect={onSelect} key={item} />
        ))}
      </ul>
    </nav>
  );
};

export default HomeFilterBar;
