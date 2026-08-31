/* eslint-disable react-native/no-raw-text */
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Link from "next/link";
import axios from "axios";
import Head from "next/head";

import HomeHeader from "../components/Home/HomeHeader";
import HomeFilterBar from "../components/Home/HomeFilterBar";
import ShopCard from "../components/Home/ShopCard";
import { loading } from "../lib/reducers/appSlice";
import { setCategory, setShops, setFirstVisibleItem } from "../lib/reducers/homeSlice";
import { setShop } from "../lib/reducers/shopSlice";
import Loading from "../components/Loading";
import styles from "./index.module.css";

const renderHeader = (count) => {
  const shopText = count > 0 || count === 0 ? "comercios" : "comercio";
  const countText = count === 0 ? "No hay" : count;

  return (
    <p className={styles.count}>
      {countText} {shopText} locales
    </p>
  );
};

export default function App() {
  const firstVisibleItem = useSelector((state) => state.home.firstVisibleItem);
  const category = useSelector((state) => state.home.selectedFilter);
  const shops = useSelector((state) => state.home.shops);
  const isLoading = useSelector((state) => state.app.loading);
  const dispatch = useDispatch();
  const listRef = React.useRef(null);
  const firstVisibleItemRef = React.useRef(firstVisibleItem ?? 0);
  const visibleItemsRef = React.useRef(new Map());

  const onSelect = React.useCallback(
    (shop) => {
      const header = document.querySelector(`.${styles.header}`);
      const viewportTop = header ? header.getBoundingClientRect().bottom : 0;
      const visibleIndex = listRef.current
        ? [...listRef.current.querySelectorAll("[data-shop-index]")]
            .map((item) => {
              const bounds = item.getBoundingClientRect();
              const visibleHeight = Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, viewportTop));
              return { index: Number(item.dataset.index), ratio: bounds.height ? visibleHeight / bounds.height : 0 };
            })
            .filter((item) => item.ratio >= 0.5)
            .sort((first, second) => first.index - second.index)[0]?.index
        : undefined;

      if (visibleIndex !== undefined) {
        firstVisibleItemRef.current = visibleIndex;
      }
      dispatch(setFirstVisibleItem(firstVisibleItemRef.current));
      dispatch(setShop(shop));
    },
    [dispatch]
  );

  useEffect(() => {
    dispatch(loading(true));
    dispatch(setShops([]));

    async function getData() {
      const shopData = await axios.get(`${window.location.origin}/api/shop/home`, { params: { category } });

      dispatch(setShops(shopData.data));
      dispatch(loading(false));
    }
    getData().catch((error) => {
      console.log(JSON.stringify(error, null, 2));
      dispatch(setShops([]));
      dispatch(loading(false));
    });
  }, [dispatch, category]);

  const filteredShops = shops.filter((shop) => shop.visibility === "public" && shop.category === category);

  useEffect(() => {
    if (isLoading || !listRef.current || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    visibleItemsRef.current = new Map();
    const header = document.querySelector(`.${styles.header}`);
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.dataset.index);
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            visibleItemsRef.current.set(index, entry.intersectionRatio);
          } else {
            visibleItemsRef.current.delete(index);
          }
        });

        const visibleIndexes = [...visibleItemsRef.current.keys()].sort((first, second) => first - second);
        if (visibleIndexes.length > 0) {
          firstVisibleItemRef.current = visibleIndexes[0];
        }
      },
      { rootMargin: `-${headerHeight}px 0px 0px 0px`, threshold: [0.5] }
    );

    listRef.current.querySelectorAll("[data-shop-index]").forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [category, filteredShops.length, isLoading]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const index = firstVisibleItem ?? 0;
    if (index === 0) {
      window.scrollTo(0, 0);
      return;
    }

    if (isLoading || !listRef.current) {
      return;
    }

    const item = listRef.current.querySelector(`[data-shop-index="${index}"]`);
    if (!item) {
      return;
    }

    const header = document.querySelector(`.${styles.header}`);
    const headerHeight = header ? header.getBoundingClientRect().height : 0;
    const targetTop = item.getBoundingClientRect().top + window.pageYOffset - headerHeight;
    window.scrollTo(0, Math.max(0, targetTop));
  }, [category, filteredShops.length, isLoading]);

  const ShopList = () => (
    <section className={styles.list} ref={listRef} aria-label="Locales">
      <ul className={styles.shopList}>
        {filteredShops.map((item, index) => (
          <li key={item.id} className={styles.shopItem} data-shop-index={index}>
            <Link href={`/${item.slug}`}>
              <a
                aria-label={item.name}
                className={styles.shopButton}
                onClick={() => onSelect(item)}
                data-testid={`shop-card-${item.slug}`}
              >
                <ShopCard shop={item} />
              </a>
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.lastView} aria-hidden="true" />
    </section>
  );

  return (
    <>
      <Head>
        <title>Hacer Pedido | Pedí a tu comercio favorito por WhatsApp.</title>
      </Head>

      <div className={styles.header}>
        <HomeHeader />
        <HomeFilterBar
          selectedFilter={category}
          onSelectFilter={(selected) => {
            firstVisibleItemRef.current = 0;
            dispatch(setFirstVisibleItem(0));
            dispatch(setCategory(selected));
          }}
        />
      </div>

      <main className={styles.body}>
        {renderHeader(filteredShops.length)}
        {isLoading ? <Loading /> : filteredShops.length ? <ShopList /> : null}
      </main>
    </>
  );
}
