"use client";

import HomeFilterBar from "#components/Home/HomeFilterBar";
import HomeHeader from "#components/Home/HomeHeader";
import ShopCard from "#components/Home/ShopCard";
import Loading from "#components/Loading";
import { useCart } from "#lib/context/CartContext";
import type { Shop } from "#lib/types";

import axios from "axios";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import styles from "../pages/index.module.css";

export default function HomeClient({ initialShops }: { initialShops: Shop[] }) {
  const { dispatch, isRestored } = useCart();
  const [category, setCategory] = useState("Comida");
  const [shops, setShops] = useState(initialShops);
  const [isLoading, setIsLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [, setFirst] = useState(0);
  const listRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isRestored) dispatch({ type: "CLEAR_CART" });
  }, [dispatch, isRestored]);

  useEffect(() => {
    if (category === "Comida") return;
    setIsLoading(true);
    axios
      .get("/api/shop/home", { params: { category } })
      .then(({ data }) => setShops(data))
      .catch(() => setShops([]))
      .finally(() => setIsLoading(false));
  }, [category]);

  const visible = shops.filter(
    (shop) => shop.visibility === "public" && shop.category === category,
  );
  const selectCategory = (value: string) =>
    startTransition(() => {
      setFirst(0);
      setCategory(value);
    });

  return (
    <>
      <div className={styles.header}>
        <HomeHeader />
        <HomeFilterBar
          isPending={isPending}
          onSelectFilter={selectCategory}
          selectedFilter={category}
        />
      </div>
      <main className={styles.body}>
        <p className={styles.count}>
          {visible.length === 0 ? "No hay" : visible.length} comercios locales
        </p>
        {isLoading || isPending ? (
          <Loading />
        ) : visible.length ? (
          <section aria-label="Locales" className={styles.list} ref={listRef}>
            <ul className={styles.shopList}>
              {visible.map((shop, index) => (
                <li
                  className={styles.shopItem}
                  data-shop-index={index}
                  key={shop.id}
                >
                  <Link href={`/${shop.slug}`}>
                    <a
                      aria-label={shop.name}
                      className={styles.shopButton}
                      data-testid={`shop-card-${shop.slug}`}
                      onClick={() => setFirst(index)}
                    >
                      <ShopCard shop={shop} />
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
            <div aria-hidden="true" className={styles.lastView} />
          </section>
        ) : null}
      </main>
    </>
  );
}
